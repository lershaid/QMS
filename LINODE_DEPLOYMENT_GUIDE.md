# 🚀 QMS System - Linode Deployment Guide

## 📋 Server Specifications for Linode

### Recommended Server Configuration

Based on your QMS architecture (8 microservices + infrastructure), here are the recommended Linode specifications:

---

## 🎯 **Option 1: Single Server Deployment (Recommended for Start)**

### **Linode Dedicated 16GB Plan**
- **CPU:** 8 vCPUs (Dedicated)
- **RAM:** 16 GB
- **Storage:** 320 GB SSD
- **Transfer:** 5 TB
- **Network:** 40 Gbps In / 5 Gbps Out
- **Monthly Cost:** ~$72/month

**Capacity:**
- Up to 50-100 concurrent users
- 5-10 tenants
- 100,000 documents
- Suitable for small to medium organizations

---

## 🎯 **Option 2: Production-Grade Deployment**

### **Linode Dedicated 32GB Plan**
- **CPU:** 16 vCPUs (Dedicated)
- **RAM:** 32 GB
- **Storage:** 640 GB SSD
- **Transfer:** 7 TB
- **Network:** 40 Gbps In / 8 Gbps Out
- **Monthly Cost:** ~$144/month

**Capacity:**
- Up to 200-500 concurrent users
- 20-50 tenants
- 500,000+ documents
- Suitable for medium to large organizations

**Additional Requirements:**
- **Backup Storage:** Linode Backups (+20% cost) or S3-compatible storage
- **Load Balancer:** Linode NodeBalancer ($10/month) if using multiple servers
- **Managed Database:** Consider Linode Managed Databases for PostgreSQL

---

## 🎯 **Option 3: Enterprise/High-Availability Setup**

### **Multi-Server Architecture**

#### **Application Server (Linode Dedicated 32GB)**
- Runs all microservices
- $144/month

#### **Database Server (Linode Dedicated 16GB)**
- PostgreSQL with replication
- $72/month

#### **Object Storage Server (Linode Dedicated 8GB)**
- MinIO for documents
- $36/month

#### **Load Balancer**
- Linode NodeBalancer
- $10/month

**Total:** ~$262/month

**Capacity:**
- 1,000+ concurrent users
- 100+ tenants
- Millions of documents
- 99.9% uptime SLA

---

## 📊 Resource Allocation Breakdown

### **Memory Distribution (16GB Server)**
```
PostgreSQL:     4 GB
MinIO:          2 GB
RabbitMQ:       1 GB
Redis:          1 GB
API Gateway:    1 GB
IAM Service:    1 GB
Policy Service: 1 GB
Document Svc:   1 GB
Other Services: 2 GB (250MB each)
System:         1 GB
-------------------
Total:         16 GB
```

### **CPU Distribution**
- PostgreSQL: 2-3 cores
- Microservices: 4-5 cores
- Infrastructure: 1-2 cores
- System: 1 core

### **Storage Requirements**
- System & Apps: 20 GB
- PostgreSQL Data: 50-100 GB
- MinIO (Documents): 100-200 GB
- Logs: 10 GB
- Backups: 50 GB
- **Total:** 230-380 GB

---

## 🌍 Recommended Linode Data Center Locations

Choose based on your primary user base:

### **North America**
- **Fremont, CA** - West Coast USA
- **Dallas, TX** - Central USA
- **Newark, NJ** - East Coast USA
- **Toronto, ON** - Canada

### **Europe**
- **London, UK** - Western Europe
- **Frankfurt, DE** - Central Europe

### **Asia Pacific**
- **Singapore** - Southeast Asia
- **Tokyo, JP** - East Asia
- **Sydney, AU** - Australia

---

## 🛠️ Pre-Deployment Checklist

### **1. Prepare Environment Variables**

Create a `.env.production` file:

```bash
# Production Environment Variables
NODE_ENV=production
LOG_LEVEL=warn

# Domain Configuration
DOMAIN=qms.yourdomain.com
API_DOMAIN=api.yourdomain.com

# Database (Strong Password!)
POSTGRES_USER=qms_admin
POSTGRES_PASSWORD=<GENERATE_64_CHAR_PASSWORD>
POSTGRES_DB=qms_platform

# JWT Secrets (Minimum 64 characters)
JWT_SECRET=<GENERATE_RANDOM_STRING_64_CHARS>
JWT_REFRESH_SECRET=<GENERATE_RANDOM_STRING_64_CHARS>
JWT_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# MinIO Credentials
MINIO_ROOT_USER=qms_minio_admin
MINIO_ROOT_PASSWORD=<GENERATE_64_CHAR_PASSWORD>
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=true

# RabbitMQ
RABBITMQ_DEFAULT_USER=qms_rabbit
RABBITMQ_DEFAULT_PASS=<GENERATE_64_CHAR_PASSWORD>

# Redis (optional password)
REDIS_PASSWORD=<GENERATE_64_CHAR_PASSWORD>

# Email SMTP
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<YOUR_SENDGRID_API_KEY>
SMTP_FROM=noreply@yourdomain.com

# CORS
CORS_ORIGIN=https://qms.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100
```

### **2. Generate Strong Secrets**

Use this command to generate secure secrets:

```bash
# Generate 64-character random string
openssl rand -base64 48

# Or use this:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it 4 times for:
1. POSTGRES_PASSWORD
2. JWT_SECRET
3. JWT_REFRESH_SECRET
4. MINIO_ROOT_PASSWORD

### **3. DNS Configuration**

Point these domains to your Linode server IP:

```
A Record: qms.yourdomain.com → YOUR_LINODE_IP
A Record: api.yourdomain.com → YOUR_LINODE_IP
A Record: www.qms.yourdomain.com → YOUR_LINODE_IP
```

### **4. SSL/TLS Certificates**

We'll use Let's Encrypt (free) with Certbot.

---

## 📦 Deployment Steps

### **Step 1: Provision Linode Server**

1. Create Linode account (if you don't have one)
2. Deploy a new Linode:
   - **Image:** Ubuntu 24.04 LTS
   - **Plan:** Dedicated 16GB or 32GB
   - **Region:** Choose nearest to users
   - **Root Password:** Set strong password

3. Add your SSH key for secure access

### **Step 2: Initial Server Setup**

SSH into your server:

```bash
ssh root@YOUR_LINODE_IP
```

Update system:

```bash
apt update && apt upgrade -y
apt install -y curl git wget nano ufw fail2ban
```

### **Step 3: Install Docker & Docker Compose**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### **Step 4: Configure Firewall**

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP & HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
```

### **Step 5: Clone QMS Repository**

```bash
# Create app directory
mkdir -p /opt/qms
cd /opt/qms

# Clone your repository
git clone https://github.com/yourusername/QMS.git .

# Or upload files via SCP:
# scp -r /local/path/to/QMS root@YOUR_LINODE_IP:/opt/qms/
```

### **Step 6: Configure Production Environment**

```bash
# Copy production environment file
cp .env.example .env.production

# Edit with your secrets
nano .env.production
```

Paste your generated secrets and configuration.

### **Step 7: Install SSL Certificate**

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot certonly --standalone -d qms.yourdomain.com -d api.yourdomain.com

# Note the certificate paths (usually /etc/letsencrypt/live/...)
```

### **Step 8: Create Production Docker Compose**

The production `docker-compose.prod.yml` file is ready (see below).

### **Step 9: Deploy the Application**

```bash
cd /opt/qms

# Build and start containers
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### **Step 10: Run Database Migrations**

```bash
# Wait for PostgreSQL to be ready
sleep 30

# Run migrations for all services
docker compose -f docker-compose.prod.yml exec iam-service npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec policy-service npx prisma migrate deploy
# ... repeat for other services with databases
```

### **Step 11: Create Initial Admin User**

```bash
# Register first admin user via API
curl -X POST https://api.yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "default-tenant",
    "email": "admin@yourdomain.com",
    "password": "YourSecurePassword123!",
    "firstName": "System",
    "lastName": "Administrator"
  }'
```

### **Step 12: Verify Deployment**

1. Visit `https://qms.yourdomain.com` - Should load the frontend
2. Login with your admin credentials
3. Check all services are healthy:

```bash
docker compose -f docker-compose.prod.yml ps
```

---

## 🔒 Post-Deployment Security

### **1. Enable Automated Backups**

```bash
# Create backup script
cat > /opt/qms/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/qms-backups/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup databases
docker compose -f /opt/qms/docker-compose.prod.yml exec -T postgres pg_dumpall -U qms_admin > $BACKUP_DIR/postgres.sql

# Backup MinIO data
docker compose -f /opt/qms/docker-compose.prod.yml exec -T minio mc mirror /data $BACKUP_DIR/minio

# Compress
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

# Keep only last 7 days
find /opt/qms-backups/ -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/qms/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/qms/backup.sh
```

### **2. Setup Monitoring**

Consider installing:
- **Prometheus + Grafana** for metrics
- **Loki** for log aggregation
- **Uptime Robot** for external monitoring

### **3. Configure Log Rotation**

```bash
# Docker logs can grow large
cat > /etc/logrotate.d/docker << 'EOF'
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
EOF
```

### **4. Enable Fail2Ban**

```bash
# Already installed, configure for SSH
systemctl enable fail2ban
systemctl start fail2ban
```

---

## 📊 Monitoring & Maintenance

### **Health Checks**

```bash
# Check all services
curl https://api.yourdomain.com/health

# Check individual services
docker compose -f docker-compose.prod.yml ps
```

### **View Logs**

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f iam-service
```

### **Restart Services**

```bash
# Restart specific service
docker compose -f docker-compose.prod.yml restart iam-service

# Restart all services
docker compose -f docker-compose.prod.yml restart
```

### **Update Application**

```bash
cd /opt/qms
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 💰 Cost Summary

### **Monthly Costs (Estimated)**

| Component | Cost |
|-----------|------|
| Linode Dedicated 16GB | $72 |
| Linode Backups (optional) | $14 |
| Domain Name | $12 |
| SendGrid Email (Free tier) | $0 |
| SSL Certificate (Let's Encrypt) | $0 |
| **Total** | **$84-98/month** |

**For Dedicated 32GB:** $158-172/month

---

## 🆘 Troubleshooting

### **Services won't start**
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check disk space
df -h

# Check memory
free -h
```

### **Database connection errors**
```bash
# Verify PostgreSQL is running
docker compose -f docker-compose.prod.yml ps postgres

# Check connection
docker compose -f docker-compose.prod.yml exec postgres psql -U qms_admin -c "SELECT version();"
```

### **Out of memory**
```bash
# Add swap space
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

---

## 📞 Support & Resources

- **Linode Documentation:** https://www.linode.com/docs/
- **Docker Documentation:** https://docs.docker.com/
- **Let's Encrypt:** https://letsencrypt.org/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## ✅ Next Steps After Deployment

1. ✅ Configure email templates
2. ✅ Setup monitoring and alerts
3. ✅ Configure automated backups to S3
4. ✅ Create user documentation
5. ✅ Setup CI/CD pipeline
6. ✅ Configure rate limiting per tenant
7. ✅ Implement audit log retention policy
8. ✅ Setup performance monitoring
9. ✅ Create disaster recovery plan
10. ✅ Schedule regular security audits

**Your QMS system is now ready for production! 🎉**
