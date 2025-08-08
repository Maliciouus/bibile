#!/bin/bash
set -e  # Exit immediately on error

DEPLOY_DIR="/opt/myapp"  # Update if you use a different path

echo "Installing Bun..."
curl -fsSL https://bun.sh/install | bash

# Bun installs to /root/.bun in CodeDeploy (since it's run as root)
export BUN_INSTALL="/root/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# Verify bun is available
echo "Bun version: $(bun --version)"

echo "Installing PM2 globally via Bun (via bunx)..."
bun add -g pm2

echo "Installing server dependencies..."
cd "$DEPLOY_DIR/server"
bun install

echo "✅ Install phase complete."
