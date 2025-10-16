# 🎯 QMS Linode Server Specifications - Quick Reference

## 💰 Recommended Plans

### **STARTER (Small Business)**
**Linode Dedicated 16GB**
- **Price:** $72/month
- **Users:** 50-100 concurrent
- **Tenants:** 5-10 organizations
- **Documents:** Up to 100,000
- **CPU:** 8 vCPUs (Dedicated)
- **RAM:** 16 GB
- **Storage:** 320 GB SSD
- **Bandwidth:** 5 TB/month

### **PROFESSIONAL (Medium Business)**
**Linode Dedicated 32GB**
- **Price:** $144/month
- **Users:** 200-500 concurrent
- **Tenants:** 20-50 organizations
- **Documents:** Up to 500,000
- **CPU:** 16 vCPUs (Dedicated)
- **RAM:** 32 GB
- **Storage:** 640 GB SSD
- **Bandwidth:** 7 TB/month

### **ENTERPRISE (Large Organization)**
**Multi-Server Setup**
- **Price:** $262/month
- **Users:** 1,000+ concurrent
- **Tenants:** 100+ organizations
- **Documents:** Millions
- **Setup:** App Server (32GB) + DB Server (16GB) + Storage Server (8GB) + Load Balancer

## 📍 Data Center Selection

| Region | Location | Best For |
|--------|----------|----------|
| **Newark, NJ** | US East Coast | North America (East) |
| **Dallas, TX** | US Central | North America (Central) |
| **Fremont, CA** | US West Coast | North America (West) |
| **London, UK** | Europe | UK & Western Europe |
| **Frankfurt, DE** | Europe | Central & Eastern Europe |
| **Singapore** | Asia | Southeast Asia |
| **Tokyo, JP** | Asia | East Asia |
| **Sydney, AU** | Pacific | Australia & Pacific |

## 📊 Resource Breakdown (16GB Server)

```
Component              Memory    CPU     Storage
─────────────────────────────────────────────────
PostgreSQL             4 GB      2       50 GB
MinIO (Documents)      2 GB      1       100 GB
RabbitMQ               1 GB      0.5     5 GB
Redis                  1 GB      0.5     5 GB
API Gateway            1 GB      1       5 GB
IAM Service            1 GB      1       5 GB
Policy Service         1 GB      1       10 GB
Other Services (6×)    2 GB      1       20 GB
System Overhead        1 GB      1       20 GB
─────────────────────────────────────────────────
TOTAL                  16 GB     8       220 GB
Available Space                          100 GB
```

## 🔧 Minimum Requirements

**DO NOT go below these specs:**
- **RAM:** 8 GB (but 16 GB strongly recommended)
- **CPU:** 4 vCPUs (but 8 vCPUs recommended)
- **Storage:** 160 GB SSD minimum
- **Bandwidth:** 3 TB/month

## 💡 Cost Optimization Tips

1. **Start with 16GB** - Scale up when needed
2. **Use Linode Backups** - Only $14/month for peace of mind
3. **Block Storage** - Add cheap storage if you run out (starts at $10/100GB)
4. **CloudFlare** - Free CDN can reduce bandwidth costs
5. **Reserve IPs** - $1/month to keep your IP if you resize

## 📈 Scaling Path

```
Phase 1: Single 16GB Server          → $72/month (0-100 users)
Phase 2: Single 32GB Server          → $144/month (100-500 users)
Phase 3: Multi-Server (App + DB)     → $216/month (500-1000 users)
Phase 4: Multi-Server + LB           → $262/month (1000+ users)
Phase 5: Multi-Region HA             → $500+/month (Enterprise)
```

## 🎯 Which Plan Should You Choose?

### Choose **16GB** if:
- ✅ Starting out or pilot phase
- ✅ Single department or small company
- ✅ Budget conscious
- ✅ Up to 50 daily active users
- ✅ Can tolerate occasional slowdowns

### Choose **32GB** if:
- ✅ Multiple departments
- ✅ 100+ employees
- ✅ Business-critical application
- ✅ Need consistent performance
- ✅ Growth expected within 6 months

### Choose **Multi-Server** if:
- ✅ Enterprise organization
- ✅ High availability required (99.9% uptime)
- ✅ Regulatory compliance (data separation)
- ✅ 500+ employees
- ✅ International operations

## 💳 Total Monthly Costs

### Starter Package
```
Linode Dedicated 16GB     $72
Linode Backups            $14 (optional)
Domain Name               $12
SendGrid Email (Free)     $0
SSL (Let's Encrypt)       $0
────────────────────────────
TOTAL:                    $84-98/month
```

### Professional Package
```
Linode Dedicated 32GB     $144
Linode Backups            $29 (optional)
Domain Name               $12
SendGrid Email            $15 (40k emails/month)
Monitoring (UptimeRobot)  $0 (free tier)
────────────────────────────
TOTAL:                    $171-200/month
```

### Enterprise Package
```
App Server (32GB)         $144
DB Server (16GB)          $72
Storage Server (8GB)      $36
Load Balancer             $10
Backups                   $43
Domain Name               $12
SendGrid Email            $80 (100k emails/month)
Monitoring Service        $20
────────────────────────────
TOTAL:                    $417/month
```

## 🚀 Quick Deploy Checklist

- [ ] Sign up for Linode account
- [ ] Create 16GB or 32GB Dedicated server
- [ ] Point DNS to server IP
- [ ] Install Docker & Docker Compose
- [ ] Clone QMS repository
- [ ] Generate secure passwords (64 characters each)
- [ ] Configure `.env.production` file
- [ ] Get SSL certificate with Certbot
- [ ] Deploy with `docker-compose.prod.yml`
- [ ] Run database migrations
- [ ] Create admin user
- [ ] Configure backups
- [ ] Setup monitoring
- [ ] Test everything!

## 📞 Quick Links

- **Linode Plans:** https://www.linode.com/pricing/
- **Full Deployment Guide:** See `LINODE_DEPLOYMENT_GUIDE.md`
- **Architecture Review:** See `API_ARCHITECTURE_REVIEW.md`
- **Deployment Checklist:** See `DEPLOYMENT_READY.md`

## ⚡ One-Line Summary

**For most users:** Start with **Linode Dedicated 16GB ($72/month)** - it's perfect for 50-100 users and you can easily upgrade when needed.
