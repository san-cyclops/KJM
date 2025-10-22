#!/bin/bash

# KJM Admin Application Deployment Script
# This script deploys the Node.js application to the server

set -e  # Exit on any error

echo "Starting deployment of KJM Admin Application..."

# Configuration
APP_DIR="/home/ubuntu/dev"
APP_NAME="kjm-admin"
NODE_VERSION="20"

# Create application directory
echo "Creating application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Stop existing application
echo "Stopping existing application..."
sudo pkill -f "node app.js" || true
pm2 stop $APP_NAME || true
pm2 delete $APP_NAME || true

# Backup current deployment (if exists)
if [ -d "current" ]; then
    echo "Backing up current deployment..."
    rm -rf backup
    mv current backup
fi

# Copy new deployment files
echo "Copying new deployment files..."
mkdir -p current
cp -r /tmp/kjm-deploy/* current/
cd current

# Install/update Node.js (if needed)
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null || ! node --version | grep -q "v$NODE_VERSION"; then
    echo "Installing Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo "Installing dependencies..."
npm install --production --silent

# Install PM2 globally (if not installed)
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Create/update PM2 ecosystem file
echo "Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'kjm-admin',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_NAME: 'masjid',
      DB_USER: 'admin',
      DB_PASSWORD: 'NewSecurePassword123!'
    },
    error_file: '/home/ubuntu/dev/logs/err.log',
    out_file: '/home/ubuntu/dev/logs/out.log',
    log_file: '/home/ubuntu/dev/logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p /home/ubuntu/dev/logs

# Start application with PM2
echo "Starting application with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup ubuntu -u ubuntu --hp /home/ubuntu | grep sudo | bash || true

# Install and configure Nginx (if not already installed)
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Setup nginx reverse proxy (if not already configured)
if [ ! -f "/etc/nginx/sites-available/kjm-admin" ]; then
    echo "Configuring Nginx reverse proxy..."
    sudo tee /etc/nginx/sites-available/kjm-admin > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name 13.232.39.214;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
    
    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        access_log off;
    }
}
NGINXEOF
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/kjm-admin /etc/nginx/sites-enabled/
    
    # Remove default site if it exists
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test nginx configuration
    sudo nginx -t
    
    # Reload nginx
    sudo systemctl reload nginx
    sudo systemctl enable nginx
fi

# Setup UFW firewall rules (if UFW is available)
if command -v ufw &> /dev/null; then
    echo "Configuring firewall rules..."
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 22/tcp
fi

# Install MySQL if not present (commented out - assuming it's already installed)
# if ! command -v mysql &> /dev/null; then
#     echo "Installing MySQL..."
#     sudo apt-get install -y mysql-server
#     sudo mysql_secure_installation
# fi

# Clean up temporary files
echo "Cleaning up..."
rm -rf /tmp/kjm-deploy

# Final status check
echo "Checking application status..."
sleep 5
pm2 status
pm2 logs $APP_NAME --lines 10

echo ""
echo "=========================================="
echo "Deployment completed successfully!"
echo "=========================================="
echo "Application: KJM Admin"
echo "URL: http://13.232.39.214"
echo "Status: $(pm2 jlist | jq -r '.[] | select(.name=="kjm-admin") | .pm2_env.status')"
echo "PID: $(pm2 jlist | jq -r '.[] | select(.name=="kjm-admin") | .pid')"
echo "Memory: $(pm2 jlist | jq -r '.[] | select(.name=="kjm-admin") | .monit.memory')"
echo "CPU: $(pm2 jlist | jq -r '.[] | select(.name=="kjm-admin") | .monit.cpu')%"
echo "=========================================="
echo ""
echo "Useful commands:"
echo "  pm2 status           - Check application status"
echo "  pm2 logs kjm-admin   - View application logs"
echo "  pm2 restart kjm-admin- Restart application"
echo "  pm2 stop kjm-admin   - Stop application"
echo "=========================================="