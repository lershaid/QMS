# QMS Compliance Operating System

A next-generation, cloud-native **Integrated Management System (IMS) Platform** that serves as a comprehensive Compliance Operating System for enterprises managing multiple ISO standards (9001, 14001, 45001, 27001, etc.).

## 🏗️ Architecture Overview

This platform is built on a **microservices architecture** following the **ISO Harmonized Structure (Annex SL)**, ensuring inherent compatibility with all current and future ISO management system standards.

### Technology Stack

- **Backend Framework**: Node.js with Express.js
- **Frontend Framework**: React with Vite
- **Database**: PostgreSQL (with Prisma ORM)
- **Object Storage**: MinIO (S3-compatible)
- **Message Broker**: RabbitMQ
- **Cache**: Redis
- **Authentication**: JWT with OAuth 2.0
- **API Documentation**: Swagger/OpenAPI

### Core Microservices

1. **API Gateway** (Port 3000) - Central entry point with routing and authentication
2. **IAM Service** (Port 3001) - Identity & Access Management
3. **Policy Lifecycle Service** (Port 3002) - Policy creation, approval, versioning, and AI-assisted authoring
4. **Document Information Service** (Port 3003) - Centralized document repository
5. **Audit & Inspection Service** (Port 3004) - Internal audit lifecycle management
6. **CAPA & Improvement Service** (Port 3005) - Nonconformity and corrective action workflows
7. **Risk & Opportunity Service** (Port 3006) - Unified risk management (ISO Clause 6)
8. **Analytics & Reporting Service** (Port 3007) - KPIs and performance dashboards
9. **Notification Service** (Port 3008) - System-wide notifications and alerts

### ISO Harmonized Structure Mapping

The platform modules mirror the 10-clause structure of ISO standards:

- **Clause 4**: Context Engine - Organizational context and interested parties
- **Clause 5**: Leadership & Policy Hub - Top management commitment
- **Clause 6**: Strategic Planning Workbench - Risk & opportunity management
- **Clause 7**: Support & Resource Management - Competence, training, documents
- **Clause 8**: Operational Control Center - Process mapping and controls
- **Clause 9**: Performance & Analytics Engine - Monitoring and measurement
- **Clause 10**: Improvement & CAPA Workbench - Continual improvement

## 🚀 Quick Start

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Node.js 20+ (for local development)
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd QMS
   ```

2. **Start all services**:
   ```bash
   npm run dev:build
   ```

   This command will:
   - Start PostgreSQL database
   - Start MinIO object storage
   - Start RabbitMQ message broker
   - Start Redis cache
   - Build and start all microservices
   - Start the frontend application

3. **Access the platform**:
   - **Frontend Application**: http://localhost:5173
   - **API Gateway**: http://localhost:3000
   - **MinIO Console**: http://localhost:9001
   - **RabbitMQ Management**: http://localhost:15672

### Default Credentials

- **MinIO**: 
  - Username: `qms_minio_admin`
  - Password: `qms_minio_secure_password`

- **RabbitMQ**: 
  - Username: `qms_rabbit`
  - Password: `qms_rabbit_password`

- **Database**: 
  - User: `qms_admin`
  - Password: `qms_secure_password`

**⚠️ IMPORTANT**: Change all default passwords before deploying to production!

## 📁 Project Structure

```
QMS/
├── docker-compose.yml          # Infrastructure orchestration
├── package.json                # Root package configuration
├── services/                   # Backend microservices
│   ├── api-gateway/           # Central API gateway
│   ├── iam-service/           # Identity & Access Management
│   ├── policy-service/        # Policy lifecycle management
│   ├── document-service/      # Document repository
│   ├── audit-service/         # Audit management
│   ├── capa-service/          # CAPA workflows
│   ├── risk-service/          # Risk management
│   ├── analytics-service/     # Analytics & reporting
│   └── notification-service/  # Notifications
├── frontend/                   # React SPA application
├── shared/                     # Shared libraries and utilities
│   ├── common/                # Common utilities
│   ├── messaging/             # RabbitMQ messaging
│   └── auth/                  # Authentication helpers
├── database/                   # Database initialization scripts
└── docs/                       # Additional documentation
```

## 🔧 Development

### Running Individual Services

```bash
# Stop all services
npm run down

# Start only infrastructure (DB, MinIO, RabbitMQ, Redis)
docker-compose up postgres minio rabbitmq redis

# Run a specific service locally
cd services/iam-service
npm install
npm run dev
```

### Database Migrations

```bash
# Run migrations for all services
npm run db:migrate

# Run migrations for a specific service
cd services/iam-service
npx prisma migrate dev
```

### Viewing Logs

```bash
# All services
npm run logs

# Specific service
docker-compose logs -f policy-service
```

## 🧪 Testing

```bash
# Run tests for all services
npm run test

# Run tests for a specific service
cd services/iam-service
npm run test
```

## 📊 Key Features

### 1. Intelligent Policy Management
- Multi-step policy creation wizard
- AI Co-Pilot for compliance checking (RAG-based)
- Configurable approval workflows
- Automated publishing pipeline (Web + PDF)
- E-signature support (ESIGN compliant)
- Version control with diff viewer
- Rule-based dissemination and attestation

### 2. Unified Risk Management
- Configurable risk models for different disciplines
- Support for ISO 9001, 14001, 45001 risk methodologies
- Risk-to-objective linking
- Management of Change (MoC) workflows

### 3. Audit & CAPA Excellence
- End-to-end audit lifecycle
- Reusable checklist templates
- Mobile-ready audit execution
- Integrated CAPA workflows with RCA tools
- Effectiveness verification

### 4. Deep ERP Integration
- Connector-based architecture
- Support for SAP S/4HANA, Oracle NetSuite, Microsoft Dynamics 365
- Canonical data models
- Bi-directional synchronization

### 5. Analytics & Dashboards
- Configurable KPI dashboards
- Real-time performance monitoring
- Management review automation
- Cross-functional reporting

## 🔒 Security

- OAuth 2.0 + OpenID Connect authentication
- JWT-based authorization
- Role-Based Access Control (RBAC)
- Multi-tenancy with database-per-tenant isolation
- TLS 1.3 encryption in transit
- Data encryption at rest
- API rate limiting
- Comprehensive audit logging

## 📈 Scalability

Each microservice can be independently scaled based on load:

```bash
# Scale a specific service
docker-compose up --scale policy-service=3
```

## 🌐 API Documentation

Once services are running, access Swagger documentation:

- API Gateway: http://localhost:3000/api-docs
- IAM Service: http://localhost:3001/api-docs
- Policy Service: http://localhost:3002/api-docs
- (etc. for each service)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Create Pull Request

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For support and questions:
- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@qms.example.com

## 🗺️ Roadmap

- [ ] Phase 1: Core microservices (IAM, Policy, Audit, CAPA, Risk)
- [ ] Phase 2: Frontend SPA with dashboard and wizards
- [ ] Phase 3: AI Co-Pilot integration (RAG-based)
- [ ] Phase 4: ERP connectors (SAP, NetSuite, Dynamics 365)
- [ ] Phase 5: Regulatory Intelligence Service
- [ ] Phase 6: Mobile applications
- [ ] Phase 7: Advanced analytics and ML-powered insights

---

Built with ❤️ by the QMS Development Team
