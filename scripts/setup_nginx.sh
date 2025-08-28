#!/usr/bin/env python3
import subprocess
import sys
from pathlib import Path
import os

def run(cmd, critical=True):
    print(f"\033[94m▶ Running:\033[0m {cmd}")
    result = subprocess.run(cmd, shell=True, executable="/bin/bash")
    if result.returncode != 0:
        if critical:
            sys.exit(f"\033[91m Failed:\033[0m {cmd}")
        else:
            print(f"\033[93m⚠ Warning:\033[0m {cmd} failed but continuing...")

HOME = str(Path.home())
BUN_PATH = f"{HOME}/.bun/bin"

# 1. Update & upgrade system
run("sudo apt-get update -y && sudo apt-get upgrade -y")

# 2. Install required packages
run("sudo apt-get install -y nginx unzip certbot python3-certbot-nginx curl")

# 3. Setup project directory
run("sudo mkdir -p /var/www/src")
run("sudo chown -R ubuntu:ubuntu /var/www/src")

# 4. Install Bun
if not Path(BUN_PATH).exists():
    run("curl -fsSL https://bun.sh/install | bash")
    run(f"""echo 'export BUN_INSTALL="{HOME}/.bun"' >> ~/.bashrc""", critical=False)
    run(f"""echo 'export PATH="{BUN_PATH}:$PATH"' >> ~/.bashrc""", critical=False)

os.environ["PATH"] = f"{BUN_PATH}:{os.environ['PATH']}"

# 5. Install Node.js (system-wide, avoids nvm issues)
run("curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -")
run("sudo apt-get install -y nodejs")

# Optional: Symlink /usr/bin/node (if needed by subprocesses)
run("sudo ln -sf $(which node) /usr/bin/node", critical=False)

# 6. Install PM2 globally via Bun
run(f"{BUN_PATH}/bun i -g pm2")

# 7. Verify installations
run("nginx -v", critical=False)
run(f"{BUN_PATH}/bun --version")
run(f"{BUN_PATH}/pm2 --version")

print("\033[92m✔ Bun + PM2 + Node.js + Nginx + Certbot installed!\033[0m")

# 8. Configure Nginx
nginx_conf = f"""
server {{
    listen 80;
    server_name 13.233.83.134;

    root /var/www/src/bundle/client;
    index index.html;

    location / {{
        try_files $uri /index.html;
    }}

    location /api/ {{
        proxy_pass http://65.1.109.175:4001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }}
}}
"""
print("\033[94m▶ Writing Nginx config...\033[0m")
Path("/tmp/deploy_site.conf").write_text(nginx_conf)
run("sudo mv /tmp/deploy_site.conf /etc/nginx/sites-available/app.conf")
run("sudo ln -sf /etc/nginx/sites-available/app.conf /etc/nginx/sites-enabled/app.conf")
run("sudo nginx -t")
run("sudo systemctl enable nginx")
run("sudo systemctl restart nginx")

# 9. Start backend via PM2 (Bun)
backend_path = "/var/www/src/bundle/server/src/api/"
if Path(backend_path).exists():
    run(f"cd {backend_path} && {BUN_PATH}/bun install")
    run(f"cd {backend_path} && {BUN_PATH}/pm2 start {BUN_PATH}/bun --name 'api'")
    run(f"{BUN_PATH}/pm2 save")
    run(f"{BUN_PATH}/pm2 startup systemd -u $USER --hp $HOME")
else:
    print(f"\033[93m⚠ Warning:\033[0m Backend path {backend_path} does not exist. Skipping PM2 startup.")

print("\033[92m✅ Deployment completed successfully!\033[0m")
