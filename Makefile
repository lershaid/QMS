.PHONY: help start stop restart logs clean install test build dev

# Default target
help:
	@echo "QMS Platform - Available Commands:"
	@echo ""
	@echo "  make start        - Start all services"
	@echo "  make start-infra  - Start only infrastructure (DB, MinIO, RabbitMQ, Redis)"
	@echo "  make stop         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo "  make logs         - View logs from all services"
	@echo "  make clean        - Stop and remove all containers and volumes"
	@echo "  make install      - Install dependencies for all services"
	@echo "  make test         - Run tests for all services"
	@echo "  make build        - Build all Docker images"
	@echo "  make dev          - Start in development mode with hot-reload"
	@echo "  make db-migrate   - Run database migrations"
	@echo "  make db-reset     - Reset all databases"
	@echo ""

# Start all services
start:
	@echo "🚀 Starting QMS Platform..."
	docker-compose up -d --build
	@echo "✅ All services started!"
	@echo "Frontend: http://localhost:5173"
	@echo "API Gateway: http://localhost:3000"

# Start only infrastructure
start-infra:
	@echo "🔧 Starting infrastructure services..."
	docker-compose up -d postgres minio rabbitmq redis
	@echo "✅ Infrastructure ready!"

# Stop all services
stop:
	@echo "⏹️  Stopping all services..."
	docker-compose down
	@echo "✅ All services stopped!"

# Restart all services
restart:
	@echo "🔄 Restarting all services..."
	docker-compose restart
	@echo "✅ Services restarted!"

# View logs
logs:
	docker-compose logs -f

# Clean everything (including volumes)
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	@echo "✅ Cleanup complete!"

# Install dependencies for all services (local development)
install:
	@echo "📦 Installing dependencies..."
	cd shared/common && npm install
	cd services/api-gateway && npm install
	cd services/iam-service && npm install
	cd services/policy-service && npm install
	cd frontend && npm install
	@echo "✅ Dependencies installed!"

# Run tests
test:
	@echo "🧪 Running tests..."
	docker-compose exec iam-service npm test
	docker-compose exec policy-service npm test
	@echo "✅ Tests complete!"

# Build all images
build:
	@echo "🔨 Building all Docker images..."
	docker-compose build
	@echo "✅ Build complete!"

# Development mode
dev:
	@echo "💻 Starting in development mode..."
	docker-compose up --build
	@echo "✅ Development mode active!"

# Database migrations
db-migrate:
	@echo "🗄️  Running database migrations..."
	docker-compose exec iam-service npx prisma migrate deploy
	docker-compose exec policy-service npx prisma migrate deploy
	@echo "✅ Migrations complete!"

# Reset databases
db-reset:
	@echo "⚠️  Resetting all databases..."
	docker-compose down -v
	docker-compose up -d postgres
	@sleep 5
	docker-compose exec iam-service npx prisma migrate deploy
	docker-compose exec policy-service npx prisma migrate deploy
	@echo "✅ Databases reset!"

# Health check
health:
	@echo "🏥 Checking service health..."
	@curl -s http://localhost:3000/health || echo "API Gateway: ❌"
	@curl -s http://localhost:3001/health || echo "IAM Service: ❌"
	@curl -s http://localhost:3002/health || echo "Policy Service: ❌"
	@echo "✅ Health check complete!"
