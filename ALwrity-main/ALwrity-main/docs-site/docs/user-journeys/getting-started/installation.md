# Installation Guide

## 🎯 Overview

This guide helps you install and set up ALwrity on your system. You'll learn how to install the platform, configure it for your needs, and get started with your first content creation workflow.

## 🚀 What You'll Achieve

### Complete Setup
- **Platform Installation**: Install ALwrity on your preferred system
- **Configuration Setup**: Configure the platform for your specific needs
- **Initial Testing**: Test the installation and verify functionality
- **First Content**: Create your first piece of content

### System Requirements
- **Hardware Requirements**: Meet minimum hardware specifications
- **Software Dependencies**: Install required software dependencies
- **Network Configuration**: Configure network and connectivity
- **Security Setup**: Set up basic security configurations

## 📋 System Requirements

### Minimum Requirements
**Hardware**:
- **CPU**: 2+ cores, 2.0+ GHz
- **RAM**: 4+ GB
- **Storage**: 20+ GB available space
- **Network**: Stable internet connection

**Software**:
- **Operating System**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Python**: 3.9 or higher
- **Node.js**: 16+ for frontend development
- **Docker**: 20.10+ (optional but recommended)

### Recommended Requirements
**Hardware**:
- **CPU**: 4+ cores, 3.0+ GHz
- **RAM**: 8+ GB
- **Storage**: 50+ GB SSD
- **Network**: 100+ Mbps connection

**Software**:
- **Operating System**: Latest stable version
- **Python**: 3.11+ (latest stable)
- **Node.js**: 18+ (LTS version)
- **Docker**: Latest stable version

## 🛠️ Installation Methods

### Method 1: Docker Installation (Recommended)

#### Prerequisites
```bash
# Install Docker and Docker Compose
# Windows: Download from https://docker.com/products/docker-desktop
# macOS: Download from https://docker.com/products/docker-desktop
# Ubuntu: Follow official Docker installation guide

# Verify installation
docker --version
docker-compose --version
```

#### Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/your-org/alwrity.git
cd alwrity

# 2. Copy environment template
cp .env.template .env

# 3. Edit environment variables
nano .env
# Configure your database, API keys, and other settings

# 4. Build and start services
docker-compose up -d

# 5. Check service status
docker-compose ps

# 6. View logs
docker-compose logs -f
```

#### Environment Configuration
```env
# .env file configuration
# Database Configuration
DATABASE_URL=postgresql://alwrity:password@db:5432/alwrity
POSTGRES_DB=alwrity
POSTGRES_USER=alwrity
POSTGRES_PASSWORD=your_secure_password

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false

# Security Configuration
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here

# External Services
OPENAI_API_KEY=your-openai-api-key
STABILITY_API_KEY=your-stability-api-key
GOOGLE_SEARCH_API_KEY=your-google-search-api-key

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

### Method 2: Manual Installation

#### Backend Installation
```bash
# 1. Create virtual environment
python -m venv venv

# 2. Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up database
# Install PostgreSQL and create database
createdb alwrity

# 5. Run database migrations
python -m alembic upgrade head

# 6. Start backend server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Installation
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.template .env

# 4. Configure environment variables
# Edit .env file with your configuration

# 5. Start development server
npm start
```

### Method 3: Cloud Installation

#### AWS Installation
```bash
# 1. Launch EC2 instance
# Use Ubuntu 20.04 LTS AMI
# Instance type: t3.medium or larger

# 2. Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Install Docker
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker ubuntu

# 4. Clone and run ALwrity
git clone https://github.com/your-org/alwrity.git
cd alwrity
docker-compose up -d
```

#### Google Cloud Installation
```bash
# 1. Create Compute Engine instance
# Use Ubuntu 20.04 LTS
# Machine type: e2-medium or larger

# 2. Connect to instance
gcloud compute ssh your-instance-name

# 3. Install Docker
sudo apt update
sudo apt install docker.io docker-compose
sudo usermod -aG docker $USER

# 4. Deploy ALwrity
git clone https://github.com/your-org/alwrity.git
cd alwrity
docker-compose up -d
```

## 📊 Configuration Setup

### Database Configuration
**PostgreSQL Setup**:
```sql
-- Create database and user
CREATE DATABASE alwrity;
CREATE USER alwrity_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE alwrity TO alwrity_user;

-- Configure connection pooling
-- Edit postgresql.conf
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
```

**Database Migration**:
```bash
# Run initial migrations
python -m alembic upgrade head

# Create admin user
python scripts/create_admin.py

# Seed initial data
python scripts/seed_data.py
```

### API Configuration
**Environment Variables**:
```env
# Production Configuration
DEBUG=false
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000

# Security Settings
SECRET_KEY=your-production-secret-key
JWT_SECRET=your-production-jwt-secret
CORS_ORIGINS=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# External API Configuration
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-4
STABILITY_API_KEY=your-stability-key
```

### Frontend Configuration
**Environment Setup**:
```env
# Frontend Environment Variables
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
REACT_APP_SENTRY_DSN=your-sentry-dsn

# Feature Flags
REACT_APP_ENABLE_SEO_DASHBOARD=true
REACT_APP_ENABLE_BLOG_WRITER=true
REACT_APP_ENABLE_LINKEDIN_WRITER=true
```

## 🎯 Initial Setup

### First-Time Configuration
**Admin User Creation**:
```bash
# Create admin user
python scripts/create_admin.py

# Input required information:
# - Email address
# - Password
# - Full name
# - Organization
```

**Basic Configuration**:
```python
# backend/config/initial_setup.py
from backend.services.config_service import ConfigService

async def initial_setup():
    """Perform initial system setup."""
    config_service = ConfigService()
    
    # Set up default configurations
    await config_service.set_default_configs()
    
    # Create default content templates
    await config_service.create_default_templates()
    
    # Set up default user roles
    await config_service.setup_default_roles()
    
    print("Initial setup completed successfully!")
```

### System Verification
**Health Check**:
```bash
# Check backend health
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "database": "healthy",
  "redis": "healthy",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Frontend Verification**:
```bash
# Check frontend
curl http://localhost:3000

# Should return HTML page
```

## 🛠️ Post-Installation Setup

### SSL/HTTPS Configuration
**Nginx SSL Setup**:
```nginx
# /etc/nginx/sites-available/alwrity
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Backup Configuration
**Database Backup**:
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="alwrity"

# Create backup
pg_dump $DB_NAME > $BACKUP_DIR/alwrity_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/alwrity_backup_$DATE.sql

# Remove old backups (keep last 30 days)
find $BACKUP_DIR -name "alwrity_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: alwrity_backup_$DATE.sql.gz"
```

**Automated Backup**:
```bash
# Add to crontab
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh

# Weekly full backup
0 2 * * 0 /path/to/full_backup.sh
```

## 📈 Installation Verification

### System Tests
**API Endpoint Tests**:
```python
# test_installation.py
import requests
import json

def test_api_endpoints():
    """Test critical API endpoints."""
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    response = requests.get(f"{base_url}/health")
    assert response.status_code == 200
    
    # Test API documentation
    response = requests.get(f"{base_url}/docs")
    assert response.status_code == 200
    
    # Test authentication
    response = requests.get(f"{base_url}/api/auth/me")
    assert response.status_code in [200, 401]  # 401 is expected without auth
    
    print("All API tests passed!")

if __name__ == "__main__":
    test_api_endpoints()
```

**Frontend Tests**:
```javascript
// test_frontend.js
const puppeteer = require('puppeteer');

async function testFrontend() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    try {
        // Test homepage loads
        await page.goto('http://localhost:3000');
        await page.waitForSelector('body');
        
        // Test login page
        await page.goto('http://localhost:3000/login');
        await page.waitForSelector('form');
        
        console.log('Frontend tests passed!');
    } catch (error) {
        console.error('Frontend test failed:', error);
    } finally {
        await browser.close();
    }
}

testFrontend();
```

### Performance Verification
**Load Testing**:
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API performance
ab -n 1000 -c 10 http://localhost:8000/health

# Test frontend performance
ab -n 1000 -c 10 http://localhost:3000/
```

## 🎯 Troubleshooting

### Common Installation Issues

#### Docker Issues
**Container Won't Start**:
```bash
# Check container logs
docker-compose logs backend

# Common solutions:
# 1. Check port conflicts
netstat -tulpn | grep :8000

# 2. Check disk space
df -h

# 3. Restart Docker service
sudo systemctl restart docker
```

**Database Connection Issues**:
```bash
# Check database container
docker-compose exec db psql -U alwrity -d alwrity -c "SELECT 1;"

# Check environment variables
docker-compose exec backend env | grep DATABASE
```

#### Manual Installation Issues
**Python Dependencies**:
```bash
# Update pip
pip install --upgrade pip

# Install dependencies with verbose output
pip install -r requirements.txt -v

# Check Python version
python --version
```

**Node.js Issues**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version
npm --version
```

### Performance Issues
**Slow Startup**:
```bash
# Check system resources
htop
free -h
df -h

# Optimize Docker
docker system prune -a
```

**High Memory Usage**:
```bash
# Monitor memory usage
docker stats

# Adjust container limits
# Edit docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
```

## 🎯 Next Steps

### Immediate Actions (This Week)
1. **Complete Installation**: Finish installation and configuration
2. **Basic Testing**: Test all core functionality
3. **User Setup**: Create user accounts and basic configuration
4. **Documentation Review**: Review user documentation and guides

### Short-Term Planning (This Month)
1. **Production Setup**: Configure for production use
2. **SSL Setup**: Implement SSL/HTTPS for security
3. **Backup Setup**: Implement backup and recovery procedures
4. **Monitoring Setup**: Set up monitoring and alerting

### Long-Term Strategy (Next Quarter)
1. **Performance Optimization**: Optimize system performance
2. **Security Hardening**: Implement security best practices
3. **Scaling Preparation**: Prepare for scaling and growth
4. **Integration Setup**: Set up external integrations

---

*Installation complete? Check out our [First Steps Guide](first-steps.md) to start creating content with ALwrity!*
