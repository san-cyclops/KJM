# Deployment Pipeline Setup

This document explains how to set up and use the CI/CD pipeline for the KJM Admin Application.

## Overview

The deployment pipeline uses GitHub Actions to automatically deploy your application to an AWS EC2 server whenever code is pushed to the release branch.

## AWS Infrastructure

### EC2 Server:

- **Instance**: Ubuntu 20.04 LTS
- **IP Address**: 13.232.39.214
- **SSH Access**: `ssh -i jummaMasjid.pem ubuntu@13.232.39.214`

### RDS Database:

- **Engine**: MySQL 8.0
- **Database Name**: masjid
- **Endpoint**: masjid.cfyeiqomyb7l.ap-south-1.rds.amazonaws.com
- **Port**: 3306
- **Region**: ap-south-1 (Asia Pacific - Mumbai)

## Pipeline Architecture

```
GitHub Repository → GitHub Actions → AWS EC2 Server → AWS RDS MySQL
     ↓                    ↓              ↓              ↓
  Code Push         Tests & Build    Deploy & Start   Database Operations
```

## Setup Instructions

### 1. Server Setup (One-time)

First, prepare your AWS EC2 server by running the setup script:

```bash
ssh -i jummaMasjid.pem ubuntu@13.232.39.214
wget https://raw.githubusercontent.com/san-cyclops/KJM/main/scripts/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### 2. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add the following repository secrets:

#### Required Secrets:

- **SSH_PRIVATE_KEY**: Your private key content (jummaMasjid.pem)
  ```
  -----BEGIN RSA PRIVATE KEY-----
  [Your private key content here]
  -----END RSA PRIVATE KEY-----
  ```

#### Optional Secrets (if using different database credentials):

- **DB_HOST**: Database host (default: masjid.cfyeiqomyb7l.ap-south-1.rds.amazonaws.com)
- **DB_USER**: Database username (default: root)
- **DB_PASSWORD**: Database password (default: NewSecurePassword123!)
- **DB_NAME**: Database name (default: masjid)

### 3. Deployment Process

The pipeline automatically triggers when you push to the release branch:

```bash
git add .
git commit -m "Your commit message"
git push origin release
```

## Pipeline Stages

### 1. Test Stage

- **Node.js Testing**: Tests on Node.js 18.x and 20.x
- **Dependency Installation**: `npm ci`
- **Syntax Check**: Validates JavaScript syntax
- **Unit Tests**: Runs `npm test` if tests are available

### 2. Deploy Stage (only on release branch)

- **SSH Setup**: Configures SSH connection to server
- **File Transfer**: Copies application files to server
- **Deployment**: Runs deployment script on server

## Deployment Script Features

### Automatic Deployment (`scripts/deploy.sh`):

- ✅ **Zero-downtime deployment** with backup/restore
- ✅ **PM2 process management** with auto-restart
- ✅ **Nginx reverse proxy** configuration
- ✅ **Security headers** and gzip compression
- ✅ **Logging** and monitoring setup
- ✅ **Firewall configuration** (UFW)
- ✅ **Health checks** and status monitoring

### Server Configuration:

- **Application Path**: `/home/ubuntu/kjm-admin/current`
- **Process Manager**: PM2 with ecosystem configuration
- **Web Server**: Nginx reverse proxy on port 80
- **Logs**: `/home/ubuntu/kjm-admin/logs/`
- **Backup**: Previous deployment in `/home/ubuntu/kjm-admin/backup`

## Application URLs

After successful deployment:

- **Main Application**: http://13.232.39.214
- **Health Check**: http://13.232.39.214/health

## Monitoring Commands

SSH into your server to monitor the application:

```bash
ssh -i jummaMasjid.pem ubuntu@13.232.39.214

# Check application status
pm2 status

# View logs
pm2 logs kjm-admin

# View real-time logs
pm2 logs kjm-admin --follow

# Restart application
pm2 restart kjm-admin

# Check system resources
htop

# Check nginx status
sudo systemctl status nginx

# Check nginx configuration
sudo nginx -t
```

## Troubleshooting

### Common Issues:

1. **SSH Connection Failed**

   - Verify SSH_PRIVATE_KEY secret is correctly formatted
   - Check EC2 security group allows SSH (port 22)

2. **Deployment Failed**

   - Check GitHub Actions logs
   - Verify server has enough disk space: `df -h`
   - Check server memory: `free -m`

3. **Application Not Starting**

   - Check PM2 logs: `pm2 logs kjm-admin`
   - Verify database connection
   - Check port 3000 is available: `netstat -tlnp | grep 3000`

4. **Nginx Issues**
   - Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
   - Test configuration: `sudo nginx -t`
   - Restart nginx: `sudo systemctl restart nginx`

### Manual Deployment

If automatic deployment fails, you can deploy manually:

```bash
ssh -i jummaMasjid.pem ubuntu@13.232.39.214
cd /home/ubuntu/kjm-admin
git clone https://github.com/san-cyclops/KJM.git manual-deploy
cd manual-deploy
bash scripts/deploy.sh
```

## Security Considerations

### Implemented Security Measures:

- ✅ **Firewall**: UFW with restricted ports
- ✅ **Nginx Security Headers**: XSS, CSRF protection
- ✅ **Process Isolation**: PM2 with limited privileges
- ✅ **Log Rotation**: Automatic log management
- ✅ **SSH Key Authentication**: No password access

### Recommended Additional Security:

- 🔄 **SSL Certificate**: Set up Let's Encrypt for HTTPS
- 🔄 **Database Security**: Restrict MySQL access
- 🔄 **Rate Limiting**: Add nginx rate limiting
- 🔄 **Backup Strategy**: Implement database backups

## Pipeline Files Structure

```
.github/
└── workflows/
    └── deploy.yml          # Main GitHub Actions workflow

scripts/
├── deploy.sh               # Main deployment script
└── server-setup.sh         # One-time server setup

ecosystem.config.js         # PM2 configuration
```

## Environment Variables

The application supports the following environment variables:

```bash
NODE_ENV=production                              # Application environment
PORT=3000                                       # Application port
DB_HOST=masjid.cfyeiqomyb7l.ap-south-1.rds.amazonaws.com  # AWS RDS Database host
DB_USER=root                                    # Database username
DB_PASSWORD=NewSecurePassword123!               # Database password
DB_NAME=masjid                                  # Database name
```

## Performance Optimization

### Current Configuration:

- **PM2**: Single instance with auto-restart
- **Nginx**: Gzip compression enabled
- **Caching**: Static file caching (1 year)
- **Memory**: 1GB restart limit

### Scaling Options:

- **Horizontal**: Multiple PM2 instances
- **Load Balancer**: Nginx upstream configuration
- **Database**: MySQL optimization and replication
- **CDN**: Static asset delivery

## Backup and Recovery

### Automatic Backups:

- **Code**: Previous deployment kept in `backup/` directory
- **Process**: Zero-downtime deployment with rollback capability

### Manual Backup:

```bash
# Backup application
cp -r /home/ubuntu/kjm-admin/current /home/ubuntu/kjm-admin/backup-$(date +%Y%m%d-%H%M%S)

# Backup database
mysqldump -u root -p kjm_admin_db > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Recovery:

```bash
# Restore from backup
cd /home/ubuntu/kjm-admin
pm2 stop kjm-admin
rm -rf current
mv backup current
cd current
pm2 start ecosystem.config.js
```

## Support

For deployment issues:

1. Check GitHub Actions logs
2. Review server logs: `pm2 logs kjm-admin`
3. Monitor system resources: `htop`
4. Verify service status: `sudo systemctl status nginx`

---

**Last Updated**: October 2025  
**Pipeline Version**: 1.0  
**Supported Node.js**: 18.x, 20.x
