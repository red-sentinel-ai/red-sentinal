#!/bin/bash
# Production start script for nautilus-server with PM2

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Building nautilus-server in release mode..."
cargo build --release

# Create logs directory if it doesn't exist
mkdir -p logs

echo "Starting nautilus-server with PM2 on port 3013..."
pm2 start ecosystem.config.js

echo "Server started. Use 'pm2 logs nautilus-server' to view logs."
echo "Use 'pm2 status' to check status."
