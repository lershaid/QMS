# QMS Platform - Setup and Installation Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- **Docker Desktop** (or Docker Engine + Docker Compose) v20.10+
- **Node.js** v20+ (for local development)
- **Git** (to clone the repository)

## Quick Start (Recommended)

### 1. Start All Services with Docker Compose

```bash
# Navigate to the project root
cd /workspaces/QMS

# Start all services (this will take a few minutes on first run)
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This single command will:
- Start PostgreSQL database
- Start MinIO object storage
- Start RabbitMQ message broker
- Start Redis cache
- Build and start all 9 microservices
- Start the React frontend

### 2. Access the Platform

Once all services are running, you can access:

- **Frontend Application**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **IAM Service API Docs**: http://localhost:3001/api-docs
- **Policy Service API Docs**: http://localhost:3002/api-docs
- **MinIO Console**: http://localhost:9001
- **RabbitMQ Management**: http://localhost:15672

### 3. Default Login Credentials

**Frontend Login:**
- Email: `admin@example.com`
- Password: `password123`

*(Note: You'll need to create this user first - see Database Setup below)*

**MinIO Console:**
- Username: `qms_minio_admin`
- Password: `qms_minio_secure_password`

**RabbitMQ Management:**
- Username: `qms_rabbit`
- Password: `qms_rabbit_password`

## Initial Database Setup

### Option 1: Using Docker (Recommended)

```bash
# Run database migrations for all services
docker-compose exec iam-service npx prisma migrate deploy
docker-compose exec policy-service npx prisma migrate deploy
# Repeat for other services with Prisma schemas
```

### Option 2: Manual Setup

```bash
# Navigate to IAM service
cd services/iam-service

# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

## Creating Your First Admin User

You can create an admin user through the API:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "demo-tenant-id",
    "email": "admin@example.com",
    "password": "password123",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

## Development Mode

### Running Services Individually

If you want to develop on a specific service:

```bash
# Start only infrastructure
docker-compose up postgres minio rabbitmq redis

# Navigate to a specific service
cd services/iam-service

# Install dependencies
npm install

# Run in development mode with hot-reload
npm run dev
```

### Frontend Development

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

## Useful Commands

### Docker Compose

```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f policy-service

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Restart a specific service
docker-compose restart iam-service

# Scale a service
docker-compose up --scale policy-service=3
```

### Database Management

```bash
# Access PostgreSQL CLI
docker-compose exec postgres psql -U qms_admin -d qms_iam

# View database logs
docker-compose logs -f postgres

# Backup database
docker-compose exec postgres pg_dump -U qms_admin qms_iam > backup.sql
```

### MinIO Management

```bash
# List buckets
docker-compose exec minio mc ls local

# Create a bucket
docker-compose exec minio mc mb local/qms-policies
```

## Troubleshooting

### Services Not Starting

1. **Check if ports are already in use:**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   # Or on Windows
   netstat -ano | findstr :3000
   ```

2. **Check Docker logs:**
   ```bash
   docker-compose logs [service-name]
   ```

3. **Rebuild without cache:**
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

### Database Connection Issues

1. **Ensure PostgreSQL is healthy:**
   ```bash
   docker-compose ps postgres
   ```

2. **Check connection string in .env files**

3. **Reset database:**
   ```bash
   docker-compose down -v
   docker-compose up postgres
   ```

### MinIO Connection Issues

1. **Verify MinIO is running:**
   ```bash
   docker-compose ps minio
   ```

2. **Check MinIO logs:**
   ```bash
   docker-compose logs minio
   ```

3. **Ensure buckets exist:**
   - Access MinIO console at http://localhost:9001
   - Create bucket named `qms-policies`

### Frontend Not Connecting to API

1. **Check API Gateway is running:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Verify CORS settings** in `services/api-gateway/src/index.js`

3. **Check browser console** for error messages

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│                    http://localhost:5173                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (Express)                      │
│                    http://localhost:3000                     │
│            Routes, Authentication, Rate Limiting             │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬─────────┘
   │      │      │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
│IAM │ │POL │ │DOC │ │AUD │ │CAP │ │RSK │ │ANL │ │NOT │
│3001│ │3002│ │3003│ │3004│ │3005│ │3006│ │3007│ │3008│
└─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
  │      │      │      │      │      │      │      │
  └──┬───┴──┬───┴───┬──┴───┬──┴───┬──┴───┬──┴───┬──┘
     │      │       │      │      │      │      │
     ▼      ▼       ▼      ▼      ▼      ▼      ▼
┌──────────────────────────────────────────────────────┐
│  PostgreSQL  │  MinIO  │  RabbitMQ  │  Redis  │
│    :5432     │  :9000  │   :5672    │  :6379  │
└──────────────────────────────────────────────────────┘
```

## Next Steps

1. **Explore the API documentation:**
   - Visit http://localhost:3001/api-docs for IAM Service APIs
   - Visit http://localhost:3002/api-docs for Policy Service APIs

2. **Create additional users and assign roles**

3. **Start creating policies using the Policy Lifecycle Service**

4. **Configure ERP integration connectors** (SAP, NetSuite, Dynamics 365)

5. **Set up the Regulatory Intelligence Service** with your API keys

6. **Customize the frontend** to match your organization's branding

## Production Deployment

For production deployment, you'll need to:

1. **Change all default passwords** in docker-compose.yml
2. **Set up SSL/TLS certificates** for HTTPS
3. **Configure environment-specific .env files**
4. **Set up proper database backups**
5. **Configure log aggregation** (e.g., ELK Stack)
6. **Set up monitoring** (e.g., Prometheus + Grafana)
7. **Deploy to Kubernetes** or cloud provider (AWS, Azure, GCP)

## Support

For issues or questions:
- Check the [README.md](./README.md) for feature documentation
- Review the [Architectural Blueprint](./Architectural%20Blueprint%20for%20a%20Unified%20Compliance%20Operating%20System.txt)
- Open an issue on GitHub

---

**Built with ❤️ following the ISO Harmonized Structure principles**
