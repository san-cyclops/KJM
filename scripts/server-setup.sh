#!/bin/bash

# Server Setup Script for KJM Admin Application
# Run this script once on the server to prepare the environment

set -e

echo "Setting up server environment for KJM Admin Application..."

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install essential packages
echo "Installing essential packages..."
sudo apt-get install -y curl wget git build-essential software-properties-common

# Install Node.js 20.x
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "Installing Nginx..."
sudo apt-get install -y nginx

# Install MySQL (if needed - commented out)
# echo "Installing MySQL..."
# sudo apt-get install -y mysql-server
# sudo mysql_secure_installation

# Install UFW firewall
echo "Setting up firewall..."
sudo apt-get install -y ufw
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Create application user and directories
echo "Creating application directories..."
sudo mkdir -p /home/ubuntu/kjm-admin
sudo mkdir -p /home/ubuntu/kjm-admin/logs
sudo chown -R ubuntu:ubuntu /home/ubuntu/kjm-admin

# Setup PM2 startup script
echo "Setting up PM2 startup..."
pm2 startup ubuntu -u ubuntu --hp /home/ubuntu | grep sudo | bash || true

# Install jq for JSON parsing (useful for monitoring)
echo "Installing additional tools..."
sudo apt-get install -y jq htop

# Create deployment directory
mkdir -p /tmp/kjm-deploy

echo ""
echo "=========================================="
echo "Server setup completed successfully!"
echo "=========================================="
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "PM2 version: $(pm2 --version)"
echo "Nginx version: $(nginx -v 2>&1 | cut -d' ' -f3)"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Set up your GitHub repository secrets"
echo "2. Configure your database credentials"
echo "3. Push your code to trigger deployment"
echo "=========================================="