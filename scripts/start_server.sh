#!/bin/bash

echo "Starting server with PM2..."
export PATH="$HOME/.bun/bin:$PATH"
cd /home/ec2-user/bible-app/server

# Stop if already running
pm2 stop bible-app || true

# Start using Bun with PM2
pm2 start index.ts --name bible-app --interpreter bun
pm2 save