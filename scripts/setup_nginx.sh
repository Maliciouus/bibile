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
NVM_DIR = f"{HOME}/.nvm"

# 1. Update & upgrade system
run("sudo apt-get update -y && sudo apt-get upgrade -y")

# 2. Install dependencies (nginx, unzip, certbot, curl)
run("sudo apt-get install -y nginx unzip certbot python3-certbot-nginx curl")

# 3. Install Bun (if not installed)
if not Path(BUN_PATH).exists():
    run("curl -fsSL https://bun.sh/install | bash")
    run(f"""echo 'export BUN_INSTALL="{HOME}/.bun"' >> ~/.bashrc""", critical=False)
    run(f"""echo 'export PATH="{BUN_PATH}:$PATH"' >> ~/.bashrc""", critical=False)

os.environ["PATH"] = f"{BUN_PATH}:{os.environ['PATH']}"

# 4. Install NVM + Node.js LTS
if not Path(NVM_DIR).exists():
    run("curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash")
    run(f"""echo 'export NVM_DIR="{NVM_DIR}"' >> ~/.bashrc""", critical=False)
    run(f"""echo '[ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"' >> ~/.bashrc""", critical=False)

# Load nvm for current session + install Node.js LTS
os.environ["NVM_DIR"] = NVM_DIR
run(f"export NVM_DIR={NVM_DIR} && [ -s \"$NVM_DIR/nvm.sh\" ] && \\. \"$NVM_DIR/nvm.sh\" && nvm install --lts && nvm use --lts")

# 5. Install PM2 using Bun
run(f"{BUN_PATH}/bun i -g pm2")

# 6. Verify installs
run("nginx -v", critical=False)
run(f"{BUN_PATH}/bun --version")
run(f"{BUN_PATH}/pm2 --version")

print("\033[92m✔ Bun + PM2 + Node.js LTS + Nginx + Certbot installed!\033[0m")

# 7. Configure Nginx
nginx_conf = f"""
server {{
    listen 80;
    server_name 65.0.74.170;

    root /opt/bundle/client;
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

# 8. Start backend using PM2 with Bun
backend_path = "/opt/bundle/server/src/api/"
if Path(backend_path).exists():
    run(f"cd {backend_path} && {BUN_PATH}/bun install")
    run(f"cd {backend_path} && {BUN_PATH}/pm2 start index.ts --name myapi --interpreter {BUN_PATH}/bun")
    run(f"{BUN_PATH}/pm2 save")
    run(f"{BUN_PATH}/pm2 startup systemd -u $USER --hp $HOME")
else:
    print(f"\033[93m⚠ Warning:\033[0m Backend path {backend_path} does not exist. Skipping PM2 startup.")

print("\033[92m Deployment completed successfully!\033[0m")
