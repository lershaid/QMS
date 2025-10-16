# QMS Platform - Quick Reference

## 🚀 One-Command Start
```bash
docker-compose up --build
# Or using Makefile
make start
```

## 📱 Access URLs
| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | admin@example.com / password123 |
| API Gateway | http://localhost:3000 | - |
| IAM Docs | http://localhost:3001/api-docs | - |
| Policy Docs | http://localhost:3002/api-docs | - |
| MinIO Console | http://localhost:9001 | qms_minio_admin / qms_minio_secure_password |
| RabbitMQ | http://localhost:15672 | qms_rabbit / qms_rabbit_password |

## 🔧 Common Commands

### Docker Compose
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart a service
docker-compose restart iam-service

# Rebuild a service
docker-compose up -d --build policy-service

# Clean everything
docker-compose down -v
```

### Makefile
```bash
make help          # Show all commands
make start         # Start all services
make stop          # Stop all services
make logs          # View all logs
make clean         # Complete cleanup
make db-migrate    # Run migrations
make health        # Check service health
```

## 🗄️ Database Commands
```bash
# Access PostgreSQL
docker-compose exec postgres psql -U qms_admin -d qms_iam

# Run migrations (IAM)
docker-compose exec iam-service npx prisma migrate deploy

# Reset database
docker-compose down -v
docker-compose up -d postgres
docker-compose exec iam-service npx prisma migrate deploy
```

## 📝 API Quick Start

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "demo-tenant",
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Create Policy (with token)
```bash
curl -X POST http://localhost:3000/api/v1/policies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-tenant-id: demo-tenant" \
  -d '{
    "title": "Quality Management Policy",
    "ownerId": "USER_ID",
    "scope": "All operations",
    "applicableStandards": ["ISO 9001:2015"]
  }'
```

## 🏗️ Project Structure
```
QMS/
├── services/          # 9 microservices
├── frontend/          # React app
├── shared/common/     # Shared utilities
└── docker-compose.yml # Infrastructure
```

## 🔍 Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs [service-name]

# Rebuild
docker-compose up -d --build --no-cache [service-name]
```

### Port already in use
```bash
# Find process
lsof -i :3000

# Stop Docker services
docker-compose down
```

### Database connection error
```bash
# Check PostgreSQL
docker-compose ps postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

## 📊 Service Ports
| Service | Port |
|---------|------|
| API Gateway | 3000 |
| IAM | 3001 |
| Policy | 3002 |
| Document | 3003 |
| Audit | 3004 |
| CAPA | 3005 |
| Risk | 3006 |
| Analytics | 3007 |
| Notification | 3008 |
| Frontend | 5173 |
| PostgreSQL | 5432 |
| MinIO | 9000, 9001 |
| RabbitMQ | 5672, 15672 |
| Redis | 6379 |

## 🎯 Architecture Pattern
```
Frontend (React) 
    ↓
API Gateway (Express)
    ↓
Microservices (9 services)
    ↓
Infrastructure (PostgreSQL, MinIO, RabbitMQ, Redis)
```

## 📚 Documentation
- **BUILD_COMPLETE.md**: Complete build summary
- **GETTING_STARTED.md**: Detailed setup guide
- **README.md**: Project overview
- **Architectural Blueprint.txt**: System design

## 💡 Tips
- Use `make help` to see all available commands
- Check service health: `make health`
- View real-time logs: `make logs`
- Each service has Swagger docs at `/api-docs`
- Use Prisma Studio: `cd services/iam-service && npx prisma studio`

## 🔐 Security Reminders
⚠️ **Before Production:**
1. Change all default passwords
2. Set strong JWT secret (64+ chars)
3. Enable SSL/TLS
4. Use environment-specific configs
5. Set up proper backups
6. Configure monitoring

## 🆘 Need Help?
1. Check logs: `docker-compose logs -f`
2. Verify health: `curl http://localhost:3000/health`
3. Review documentation in `/docs`
4. Check API docs at service ports

---

**Quick Start: `make start` → Wait 2 minutes → Open http://localhost:5173**
