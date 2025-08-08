#!/bin/bash

echo "Installing Bun..."
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

echo "Installing PM2..."
bun add pm2

echo "Installing server dependencies..."
cd /home/ec2-user/bible-app/server
bun install