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

# Bun install path
BUN_PATH = os.path.expanduser("~/.bun/bin")

# 1. Update system packages
run("sudo yum update -y")

# 2. Install Nginx
if subprocess.run("which nginx", shell=True).returncode != 0:
    run("sudo yum install -y nginx")

# 3. Install unzip & curl (needed for Bun install)
run("sudo yum install -y unzip curl --allowerasing")

# 4. Install Bun (if not already installed)
if not Path(BUN_PATH).exists():
    run("curl -fsSL https://bun.sh/install | bash")
    run("""echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc""", critical=False)
    run(f"""echo 'export PATH="{BUN_PATH}:$PATH"' >> ~/.bashrc""", critical=False)

# Add Bun to current session PATH
os.environ["PATH"] = f"{BUN_PATH}:{os.environ['PATH']}"

# 5. Install PM2 via Bun
run(f"{BUN_PATH}/bun add --global pm2")

# 6. Create a fake 'node' command to redirect to Bun
fake_node_path = "/usr/local/bin/node"
if not Path(fake_node_path).exists():
    run(f"sudo ln -s {BUN_PATH}/bun {fake_node_path}")

# 7. Verify PM2 installed
run(f"{BUN_PATH}/pm2 --version")
print("\033[92m✔ Bun + PM2 installed without Node.js!\033[0m")

# 8. Write Nginx config
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
run("sudo mv /tmp/deploy_site.conf /etc/nginx/conf.d/app.conf")
run("sudo nginx -t")
run("sudo systemctl enable nginx")
run("sudo systemctl restart nginx")

# 9. Start backend using PM2 with Bun
backend_path = "/opt/bundle/server/src/api/
if Path(backend_path).exists():
    run(f"{backend_path}bun i")
    run(f"cd {backend_path} && {BUN_PATH}/pm2 start index.ts --name myapi --interpreter {BUN_PATH}/bun")
    run(f"{BUN_PATH}/pm2 save")
    run(f"{BUN_PATH}/pm2 startup systemd -u ec2-user --hp /home/ec2-user")
else:
    print(f"\033[93m⚠ Warning:\033[0m Backend path {backend_path} does not exist. Skipping PM2 startup.")

print("\033[92m Deployment completed successfully!\033[0m")
