# Self-Host Setup for Developers

## 🎯 Overview

This guide helps developers set up ALwrity for self-hosting. You'll learn how to deploy ALwrity on your own infrastructure, configure it for your needs, and maintain it independently.

## 🚀 What You'll Achieve

### Self-Hosting Benefits
- **Full Control**: Complete control over your ALwrity instance
- **Data Privacy**: Keep all data on your own infrastructure
- **Customization**: Full customization capabilities
- **Cost Control**: Predictable hosting costs

### Technical Requirements
- **Server Management**: Basic server administration skills
- **Docker Knowledge**: Understanding of Docker containers
- **Database Management**: Basic database administration
- **Network Configuration**: Basic networking knowledge

## 📋 Prerequisites

### System Requirements
**Minimum Requirements**:
- **CPU**: 2+ cores, 2.0+ GHz
- **RAM**: 4+ GB
- **Storage**: 20+ GB SSD
- **OS**: Ubuntu 20.04+, CentOS 8+, or Docker-compatible OS

**Recommended Requirements**:
- **CPU**: 4+ cores, 3.0+ GHz
- **RAM**: 8+ GB
- **Storage**: 50+ GB SSD
- **Network**: 100+ Mbps connection

### Software Requirements
**Required Software**:
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: Latest version
- **Node.js**: 16+ (for frontend)
- **Python**: 3.9+ (for backend)

## 🛠️ Installation Process

### Step 1: Clone Repository
```bash
git clone https://github.com/your-org/alwrity.git
cd alwrity
```

### Step 2: Environment Configuration
```bash
# Copy environment template
cp backend/env_template.txt backend/.env
cp frontend/env_template.txt frontend/.env

# Edit configuration files
nano backend/.env
nano frontend/.env
```

### Step 3: Docker Setup
```bash
# Build and start services
docker-compose up -d

# Check service status
docker-compose ps
```

### Step 4: Database Setup
```bash
# Run database migrations
docker-compose exec backend python -m alembic upgrade head

# Create initial admin user
docker-compose exec backend python scripts/create_admin.py
```

## 📊 Configuration

### Backend Configuration
**Environment Variables**:
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@db:5432/alwrity

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false

# Security Configuration
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret

# External Services
OPENAI_API_KEY=your-openai-key
STABILITY_API_KEY=your-stability-key
```

### Frontend Configuration
**Environment Variables**:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=production

# Feature Flags
REACT_APP_ENABLE_SEO_DASHBOARD=true
REACT_APP_ENABLE_BLOG_WRITER=true
```

### Database Configuration
**PostgreSQL Setup**:
```yaml
# docker-compose.yml
services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: alwrity
      POSTGRES_USER: alwrity_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
```

## 🎯 Deployment Options

### Docker Deployment
**Single Server**:
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# With SSL/HTTPS
docker-compose -f docker-compose.prod.ssl.yml up -d
```

**Multi-Server**:
```yaml
# docker-compose.cluster.yml
services:
  backend:
    image: alwrity/backend:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 2G
```

### Kubernetes Deployment
**Helm Chart**:
```bash
# Install ALwrity on Kubernetes
helm install alwrity ./helm-chart \
  --set database.password=secure_password \
  --set ingress.host=your-domain.com
```

### Cloud Deployment
**AWS Deployment**:
- **ECS**: Elastic Container Service
- **EKS**: Elastic Kubernetes Service
- **EC2**: Elastic Compute Cloud

**Google Cloud Deployment**:
- **GKE**: Google Kubernetes Engine
- **Cloud Run**: Serverless containers
- **Compute Engine**: Virtual machines

## 📈 Production Setup

### Security Configuration
**SSL/TLS Setup**:
```nginx
# Nginx configuration
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Firewall Configuration**:
```bash
# UFW firewall setup
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Monitoring Setup
**Health Checks**:
```yaml
# docker-compose.yml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

**Log Management**:
```bash
# Log rotation
sudo logrotate -f /etc/logrotate.d/alwrity
```

## 🛠️ Maintenance

### Backup Procedures
**Database Backup**:
```bash
# Daily backup script
#!/bin/bash
docker-compose exec -T db pg_dump -U alwrity_user alwrity > backup_$(date +%Y%m%d).sql
```

**Application Backup**:
```bash
# Backup volumes
docker run --rm -v alwrity_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

### Update Procedures
**Application Updates**:
```bash
# Update application
git pull origin main
docker-compose build
docker-compose up -d
```

**Database Updates**:
```bash
# Run migrations
docker-compose exec backend python -m alembic upgrade head
```

### Troubleshooting
**Common Issues**:
- **Port Conflicts**: Check for port conflicts
- **Memory Issues**: Monitor memory usage
- **Database Connection**: Verify database connectivity
- **SSL Certificates**: Check certificate validity

## 🎯 Performance Optimization

### Resource Optimization
**Memory Optimization**:
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

**CPU Optimization**:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
        reservations:
          cpus: '1'
```

### Caching Setup
**Redis Configuration**:
```yaml
services:
  redis:
    image: redis:alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
```

## 📊 Monitoring and Logging

### Application Monitoring
**Health Endpoints**:
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}
```

**Metrics Collection**:
```python
from prometheus_client import Counter, Histogram

request_count = Counter('requests_total', 'Total requests')
request_duration = Histogram('request_duration_seconds', 'Request duration')
```

### Log Management
**Structured Logging**:
```python
import structlog

logger = structlog.get_logger()
logger.info("User login", user_id=user.id, ip_address=request.client.host)
```

## 🎯 Security Best Practices

### Security Hardening
**Container Security**:
```dockerfile
# Use non-root user
RUN adduser --disabled-password --gecos '' alwrity
USER alwrity
```

**Network Security**:
```yaml
# docker-compose.yml
networks:
  alwrity_network:
    driver: bridge
    internal: true
```

### Access Control
**SSH Configuration**:
```bash
# Disable root login
echo "PermitRootLogin no" >> /etc/ssh/sshd_config

# Use key-based authentication
echo "PasswordAuthentication no" >> /etc/ssh/sshd_config
```

## 🎯 Next Steps

### Immediate Actions (This Week)
1. **Server Setup**: Set up your server and install prerequisites
2. **Repository Clone**: Clone ALwrity repository
3. **Environment Setup**: Configure environment variables
4. **Initial Deployment**: Deploy ALwrity using Docker

### Short-Term Planning (This Month)
1. **Production Setup**: Configure for production use
2. **SSL Setup**: Configure SSL/TLS certificates
3. **Monitoring Setup**: Implement monitoring and logging
4. **Backup Procedures**: Set up backup and recovery procedures

### Long-Term Strategy (Next Quarter)
1. **Performance Optimization**: Optimize performance and resources
2. **Security Hardening**: Implement security best practices
3. **High Availability**: Implement high availability setup
4. **Automation**: Automate deployment and maintenance procedures

---

*Ready to self-host ALwrity? Start with the [API Quickstart](api-quickstart.md) to understand the platform architecture before setting up your own instance!*
