#!/bin/bash
set -e  # Exit immediately on error

sudo chmod +x /home/ec2-user/bible.app/scripts/*.sh
DEPLOY_DIR="/home/ec2-user/bible-app"  # Base deploy directory from appspec.yml

echo "Installing Bun..."
curl -fsSL https://bun.sh/install | bash

# Bun installs to /home/ec2-user/.bun since run as ec2-user
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Verify bun is available
echo "Bun version: $(bun --version)"

echo "Installing PM2 globally via Bun (via bunx)..."
bun add -g pm2

echo "Installing server dependencies..."
cd "$DEPLOY_DIR/server"
bun install

echo "✅ Install phase complete."
