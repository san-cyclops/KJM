#!/bin/bash

# Complete AWS Server Setup and Deployment Script
# This script will set up the server environment and deploy the application

echo "🚀 Starting Complete AWS Server Setup and Deployment..."
echo "=================================================="

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install essential packages
echo "🔧 Installing essential packages..."
sudo apt-get install -y curl wget git build-essential software-properties-common jq htop

# Install Node.js 20.x
echo "📥 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install PM2 globally
echo "🔧 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt-get install -y nginx

# Install MySQL client (for testing RDS connection)
echo "🗄️ Installing MySQL client..."
sudo apt-get install -y mysql-client

# Setup UFW firewall
echo "🔒 Setting up firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /home/ubuntu/dev
sudo mkdir -p /home/ubuntu/dev/logs
sudo chown -R ubuntu:ubuntu /home/ubuntu/dev

# Clone the application
echo "📥 Cloning application from GitHub..."
cd /home/ubuntu/dev
git clone https://github.com/san-cyclops/KJM.git current
cd current

# Install application dependencies
echo "📦 Installing application dependencies..."
npm install --production

# Test database connection
echo "🗄️ Testing RDS database connection..."
mysql -h kjm.cfyeiqomyb7l.ap-south-1.rds.amazonaws.com -P 3306 -u admin -p'NewSecurePassword123!' -e "SHOW DATABASES;" || {
    echo "❌ Database connection failed. Please check RDS configuration."
    echo "Make sure:"
    echo "1. RDS instance is running"
    echo "2. Security groups allow connections from this EC2"
    echo "3. Database credentials are correct"
}

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'kjm-admin',
    script: 'app.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: 'kjm.cfyeiqomyb7l.ap-south-1.rds.amazonaws.com',
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

# Start application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup ubuntu -u ubuntu --hp /home/ubuntu | grep sudo | bash || true

# Configure Nginx
echo "🌐 Configuring Nginx..."
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
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx

echo ""
echo "=================================================="
echo "🎉 Deployment completed successfully!"
echo "=================================================="
echo "Application: KJM Admin"
echo "URL: http://13.232.39.214"
echo "PM2 Status:"
pm2 status
echo ""
echo "📊 Application Logs:"
pm2 logs kjm-admin --lines 10
echo ""
echo "🔧 Useful commands:"
echo "  pm2 status           - Check application status"
echo "  pm2 logs kjm-admin   - View application logs"
echo "  pm2 restart kjm-admin- Restart application"
echo "  pm2 stop kjm-admin   - Stop application"
echo "  sudo systemctl status nginx - Check Nginx status"
echo "=================================================="