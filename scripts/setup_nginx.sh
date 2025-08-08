#!/bin/bash

echo "Installing Nginx..."
sudo amazon-linux-extras install nginx1 -y || sudo yum install nginx -y

echo "Creating Nginx config..."

cat <<EOF | sudo tee /etc/nginx/conf.d/bible-app.conf
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://localhost4001:/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass \$http_upgrade;
    }

    location /admin/ {
        root /home/ec2-user/bible-app;
        index index.html;
        try_files \$uri /admin/index.html;
    }

    location / {
        root /home/ec2-user/bible-app/client/dist;
        index index.html;
        try_files \$uri /index.html;
    }
}
EOF

echo "Restarting Nginx..."
sudo nginx -t && sudo systemctl restart nginx