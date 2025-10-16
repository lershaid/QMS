# QMS Platform - System Architecture Diagram

## High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                             │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         React Frontend (Vite) - Port 5173                   │ │
│  │                                                              │ │
│  │  Components:                                                │ │
│  │  • Dashboard (Stats, Charts, Activity Feed)                 │ │
│  │  • Policy Management (Wizard, Approval, Versioning)         │ │
│  │  • Audit Management (Schedule, Execute, Reports)            │ │
│  │  • CAPA Workbench (NC Tracking, RCA, Verification)          │ │
│  │  • Risk Register (Assessment, Controls, Objectives)         │ │
│  │                                                              │ │
│  │  State: Zustand + React Query                               │ │
│  │  Routing: React Router v6                                   │ │
│  │  HTTP: Axios                                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────┬──────────────────────────────────────────┘
                         │ HTTPS/REST API
                         ▼
┌───────────────────────────────────────────────────────────────────┐
│                      API GATEWAY - Port 3000                       │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Express.js Proxy                                            │ │
│  │  • JWT Authentication Middleware                             │ │
│  │  • Rate Limiting (100 req/15min)                             │ │
│  │  • Request Routing                                           │ │
│  │  • CORS & Security Headers (Helmet)                          │ │
│  │  • Request Logging                                           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────┬────────┬────────┬────────┬────────┬────────┬────────┬────┘
         │        │        │        │        │        │        │
         ▼        ▼        ▼        ▼        ▼        ▼        ▼
┌────────────────────────────────────────────────────────────────────┐
│                     MICROSERVICES LAYER                            │
└────────────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│IAM Service  │  │Policy       │  │Document     │  │Audit        │
│Port 3001    │  │Service      │  │Service      │  │Service      │
│             │  │Port 3002    │  │Port 3003    │  │Port 3004    │
│• Users      │  │             │  │             │  │             │
│• Roles      │  │• Creation   │  │• Storage    │  │• Schedule   │
│• Permissions│  │• Approval   │  │• Versioning │  │• Checklists │
│• Auth/JWT   │  │• Versioning │  │• Access     │  │• Findings   │
│• Sessions   │  │• PDF Gen    │  │• Control    │  │• Reports    │
│• Audit Log  │  │• Attestation│  │             │  │             │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │
       │                │                │                │
       ▼                ▼                ▼                ▼
   [DB: iam]       [DB: policy]     [DB: docs]      [DB: audit]
                       │                │
                       └────────┬───────┘
                                ▼
                          [MinIO S3]
                          (PDFs, Files)

┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│CAPA Service │  │Risk Service │  │Analytics    │  │Notification │
│Port 3005    │  │Port 3006    │  │Service      │  │Service      │
│             │  │             │  │Port 3007    │  │Port 3008    │
│• NC Intake  │  │• Risk Reg   │  │             │  │             │
│• RCA Tools  │  │• Assessment │  │• KPIs       │  │• Email      │
│• Actions    │  │• Objectives │  │• Dashboards │  │• Alerts     │
│• Tracking   │  │• Controls   │  │• Reports    │  │• Reminders  │
│• Verification│  │• MoC        │  │• Trends     │  │• Tasks      │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │                │
       ▼                ▼                ▼                ▼
   [DB: capa]       [DB: risk]    [DB: analytics]  [DB: notif]


                    ┌──────────────────────┐
                    │   MESSAGE BROKER     │
                    │   RabbitMQ           │
                    │   Port 5672          │
                    │                      │
                    │ • Policy Events      │
                    │ • Audit Events       │
                    │ • CAPA Events        │
                    │ • Risk Events        │
                    │ • Notifications      │
                    └──────────────────────┘
                              ▲
                              │ Publish/Subscribe
                              │
            ┌─────────────────┴─────────────────┐
            │      Event-Driven Communication   │
            │  (All services can pub/sub)       │
            └───────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                            │
└───────────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│  PostgreSQL 16  │  │   MinIO S3       │  │    RabbitMQ 3.12     │
│  Port 5432      │  │   Port 9000/9001 │  │    Port 5672/15672   │
│                 │  │                  │  │                      │
│ Databases:      │  │ Buckets:         │  │ Queues:              │
│ • qms_iam       │  │ • qms-policies   │  │ • policy.events      │
│ • qms_policy    │  │ • qms-documents  │  │ • audit.events       │
│ • qms_documents │  │ • qms-evidence   │  │ • capa.events        │
│ • qms_audit     │  │ • qms-backups    │  │ • notification.queue │
│ • qms_capa      │  │                  │  │                      │
│ • qms_risk      │  │ Features:        │  │ Features:            │
│ • qms_analytics │  │ • Versioning     │  │ • Durable queues     │
│ • qms_notif     │  │ • Encryption     │  │ • Message TTL        │
│                 │  │ • Replication    │  │ • Dead letter queue  │
└─────────────────┘  └──────────────────┘  └──────────────────────┘

                    ┌──────────────────┐
                    │   Redis          │
                    │   Port 6379      │
                    │                  │
                    │ • Session Cache  │
                    │ • Rate Limiting  │
                    │ • API Cache      │
                    └──────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    SECURITY & MONITORING                           │
└───────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Authentication & Authorization                                  │
│  • OAuth 2.0 / OpenID Connect                                   │
│  • JWT (JSON Web Tokens)                                        │
│  • Role-Based Access Control (RBAC)                             │
│  • Multi-Tenancy (Database per tenant)                          │
│  • Session Management                                            │
│  • Audit Logging                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Security Headers & Middleware                                   │
│  • Helmet.js (XSS, MIME sniffing, etc.)                         │
│  • CORS (Cross-Origin Resource Sharing)                         │
│  • Rate Limiting                                                 │
│  • Request Validation (Joi)                                      │
│  • TLS 1.3 encryption                                            │
└─────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT OPTIONS                           │
└───────────────────────────────────────────────────────────────────┘

Development:                Production:
┌──────────────┐           ┌────────────────────────────┐
│ Docker       │           │ Kubernetes (K8s)           │
│ Compose      │    →      │ • Auto-scaling             │
│              │           │ • Load balancing           │
│ • Local dev  │           │ • Health checks            │
│ • Hot reload │           │ • Rolling updates          │
│ • Easy setup │           │ • Service mesh             │
└──────────────┘           └────────────────────────────┘

                          Or Cloud Providers:
                          ┌────────────────────────────┐
                          │ AWS ECS/EKS                │
                          │ Azure AKS                  │
                          │ Google GKE                 │
                          │ Digital Ocean              │
                          └────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                 ISO HARMONIZED STRUCTURE MAPPING                   │
└───────────────────────────────────────────────────────────────────┘

Clause 4: Context of Organization
    └─> Policy Service (Scope, Interested Parties, Issues)

Clause 5: Leadership
    └─> Policy Service (Policy Hub, Roles & Responsibilities)

Clause 6: Planning (Risks & Opportunities)
    └─> Risk Service (Risk Register, Objectives, MoC)

Clause 7: Support
    └─> Document Service (Documented Information)
    └─> IAM Service (Competence, Training, Communication)

Clause 8: Operation
    └─> Policy Service (Operational Controls)
    └─> Document Service (Process Management)

Clause 9: Performance Evaluation
    └─> Audit Service (Internal Audits)
    └─> Analytics Service (KPIs, Management Review)

Clause 10: Improvement
    └─> CAPA Service (Nonconformity & Corrective Action)

┌───────────────────────────────────────────────────────────────────┐
│                      DATA FLOW EXAMPLE                             │
│              (Policy Creation to Publication)                      │
└───────────────────────────────────────────────────────────────────┘

1. User creates policy draft
      └─> Frontend → API Gateway → Policy Service
      └─> Save to PostgreSQL (qms_policy)

2. Submit for approval
      └─> Policy Service creates approval workflow
      └─> Notification Service sends email to approvers
      └─> RabbitMQ: policy.approval.requested

3. Approvers review and sign
      └─> Frontend → API Gateway → Policy Service
      └─> E-signature recorded
      └─> All approvals collected

4. Auto-publish
      └─> Policy Service generates PDF (Puppeteer)
      └─> Upload to MinIO (qms-policies bucket)
      └─> Update status to "Published"
      └─> RabbitMQ: policy.published

5. Dissemination
      └─> Notification Service picks up event
      └─> Send emails to target audience
      └─> Create attestation tasks
      └─> RabbitMQ: policy.disseminated

6. Tracking
      └─> Analytics Service aggregates data
      └─> Dashboard shows attestation rates
      └─> Management review reports

┌───────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK SUMMARY                        │
└───────────────────────────────────────────────────────────────────┘

Backend:
  • Node.js 20 (Alpine Linux)
  • Express.js 4
  • Prisma ORM 5
  • JWT (jsonwebtoken)
  • Bcrypt (password hashing)
  • Puppeteer (PDF generation)

Frontend:
  • React 18
  • Vite 5
  • React Router 6
  • TanStack Query (React Query)
  • Zustand (state)
  • Axios (HTTP)
  • Lucide React (icons)

Infrastructure:
  • PostgreSQL 16
  • MinIO (S3-compatible)
  • RabbitMQ 3.12
  • Redis 7

DevOps:
  • Docker
  • Docker Compose
  • (Future: Kubernetes)

┌───────────────────────────────────────────────────────────────────┐
│                       SCALABILITY FEATURES                         │
└───────────────────────────────────────────────────────────────────┘

Horizontal Scaling:
  ✓ Stateless microservices
  ✓ Load balancer compatible
  ✓ Shared cache (Redis)
  ✓ Shared message queue (RabbitMQ)

Vertical Scaling:
  ✓ PostgreSQL connection pooling
  ✓ Redis caching layer
  ✓ MinIO distributed mode ready

Performance:
  ✓ API caching
  ✓ Database indexing
  ✓ Async message processing
  ✓ CDN-ready static assets

┌───────────────────────────────────────────────────────────────────┐
│                         SUCCESS METRICS                            │
└───────────────────────────────────────────────────────────────────┘

✓ 9 microservices (fully containerized)
✓ 1 API Gateway (with auth)
✓ 1 React frontend (responsive)
✓ 4 infrastructure services
✓ Complete authentication system
✓ Policy lifecycle with PDF generation
✓ Event-driven architecture
✓ Multi-tenancy support
✓ Production-ready architecture

TOTAL: 15+ containerized services working together!

┌───────────────────────────────────────────────────────────────────┐
│                      START COMMAND                                 │
└───────────────────────────────────────────────────────────────────┘

                    docker-compose up --build

                            ⬇️

        All services start automatically in 2-3 minutes!

                Access: http://localhost:5173

═══════════════════════════════════════════════════════════════════
                END OF ARCHITECTURE DIAGRAM
═══════════════════════════════════════════════════════════════════
```
