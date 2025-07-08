# Scorpius Enterprise Makefile
# Provides common development and deployment tasks

.PHONY: help install test security build deploy clean

# Default target
help: ## Show this help message
	@echo "Scorpius Enterprise Platform"
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development
install: ## Install development dependencies
	pip install -r backend/api-gateway/requirements.txt
	pip install -r config/requirements-dev.txt

dev: ## Start development environment
	docker-compose -f docker-compose.yml up -d
	@echo "Development environment started at http://localhost:8000"

dev-logs: ## Show development logs
	docker-compose logs -f api-gateway

# Testing
test: ## Run all tests
	pytest tests/ -v --cov=backend --cov-report=html

test-security: ## Run security tests only
	pytest tests/security/ -v

test-integration: ## Run integration tests
	pytest tests/integration/ -v

# Security
security: ## Run security scans
	bandit -r backend/ -f json -o reports/bandit-report.json
	safety check --json --output reports/safety-report.json
	@echo "Security reports generated in reports/"

lint: ## Run code quality checks
	black --check backend/
	isort --check-only backend/
	flake8 backend/
	mypy backend/

format: ## Format code
	black backend/
	isort backend/

# Building
build: ## Build Docker images
	docker build -f docker/Dockerfile.enterprise -t scorpius-api-gateway:latest backend/api-gateway/

build-all: ## Build all service images
	docker-compose build

# Deployment
deploy-dev: ## Deploy to development
	docker-compose -f docker-compose.yml up -d

deploy-staging: ## Deploy to staging
	kubectl apply -f deploy/kubernetes/ -n scorpius-staging
	kubectl rollout status deployment/api-gateway -n scorpius-staging

deploy-prod: ## Deploy to production
	@echo "Deploying to production..."
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		./scripts/setup-production.sh; \
	fi

# Monitoring
logs: ## Show production logs
	kubectl logs -f deployment/api-gateway -n scorpius-production

metrics: ## Open Grafana dashboard
	@echo "Opening Grafana at http://localhost:3000"
	@open http://localhost:3000 || xdg-open http://localhost:3000

health: ## Check service health
	curl -s http://localhost:8000/health | jq .

# Database
db-migrate: ## Run database migrations
	python scripts/migrate.py

db-backup: ## Backup database
	./scripts/backup-postgres.sh

# Maintenance
clean: ## Clean up containers and images
	docker-compose down -v
	docker system prune -f

clean-all: ## Clean everything including volumes
	docker-compose down -v --remove-orphans
	docker system prune -af --volumes

# Documentation
docs: ## Generate documentation
	python scripts/generate_docs.py
	@echo "Documentation generated in docs/"

# Secrets management
secrets-generate: ## Generate new secrets
	@echo "JWT_SECRET=$$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
	@echo "ENCRYPTION_KEY=$$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"

# Quick commands
start: dev ## Alias for dev
stop: ## Stop all services
	docker-compose down

restart: stop start ## Restart all services

status: ## Show service status
	docker-compose ps