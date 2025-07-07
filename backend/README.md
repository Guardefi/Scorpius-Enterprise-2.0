# Scorpius Enterprise Microservices

This repository contains the microservices architecture for the Scorpius Enterprise platform, extracted and reorganized from Docker images.

## 🏗️ Architecture Overview

The Scorpius platform has been decomposed into the following microservices:

### Core Services

| Service | Port | Description | Technology |
|---------|------|-------------|------------|
| **API Gateway** | 8080 | Main entry point, request routing, authentication | Python/FastAPI |
| **Time Machine Service** | 8081 | Blockchain state replay and historical analysis | Python |
| **Reporting Service** | 8082 | Analytics, reports generation | Python |

### Infrastructure Services

| Service | Port | Description |
|---------|------|-------------|
| **PostgreSQL** | 5432 | Primary database |
| **Redis** | 6379 | Caching and message queuing |
| **PgAdmin** | 8083 | Database management UI |
| **Redis Commander** | 8084 | Redis management UI |

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Git

### Run the Stack

```bash
# Clone and start all services
git clone <your-repo>
cd scorpius-microservices

# Start the entire stack
docker compose up --build

# Or start in background
docker compose up -d --build
```

### Access Services

- **API Gateway**: http://localhost:8080
- **Time Machine Service**: http://localhost:8081
- **Reporting Service**: http://localhost:8082
- **PgAdmin**: http://localhost:8083 (admin@scorpius.local / admin123)
- **Redis Commander**: http://localhost:8084

## 📁 Service Structure

```
scorpius-microservices/
├── api-gateway/
│   └── app/
│       ├── main.py
│       ├── Dockerfile
│       └── requirements.txt
├── time-machine-service/
│   └── app/
│       ├── time_machine_app.py
│       ├── time_machine/
│       ├── Dockerfile
│       └── requirements.txt
├── reporting-service/
│   └── app/
│       ├── app.py
│       ├── Dockerfile
│       └── requirements.txt
└── docker-compose.yml
```

## 🔧 Development

### Individual Service Development

Each service is a standalone Git repository with its own:
- Dockerfile
- requirements.txt
- Tests
- Documentation

### Building Individual Services

```bash
# Build specific service
docker compose build time-machine-service

# Run specific service
docker compose up time-machine-service postgres redis
```

### Adding New Services

1. Extract code from Docker image:
```bash
docker run --name salvage-new-service -d <image> tail -f /dev/null
docker cp salvage-new-service:/app ./new-service/
docker rm -f salvage-new-service
```

2. Initialize Git repository:
```bash
cd new-service
git init
git add .
git commit -m "Initial commit: Salvaged from Docker image"
```

3. Add to docker-compose.yml:
```yaml
new-service:
  build: ./new-service/app
  ports:
    - "8085:8000"
  depends_on:
    - postgres
    - redis
  networks:
    - scorpius-network
```

## 🛡️ Security Considerations

- Change default passwords in production
- Use environment variable files for secrets
- Implement proper network segmentation
- Enable TLS/SSL for external communication

## 📊 Monitoring & Logging

- All services log to stdout/stderr
- Use `docker compose logs <service>` to view logs
- Consider adding ELK stack or similar for centralized logging

## 🏃‍♂️ Next Steps

1. **Extract remaining services** from Docker images:
   - Scanner services (mythril, slither, manticore, etc.)
   - Honeypot service
   - MEV protection
   - Quantum services
   - Bridge service
   - Wallet guard

2. **Set up CI/CD**:
   - GitHub Actions for automated builds
   - Container registry integration
   - Automated testing

3. **Production deployment**:
   - Kubernetes manifests
   - Helm charts
   - Production-ready configurations

## 🎯 Service URLs (when running)

| Service | Health Check | Documentation |
|---------|-------------|---------------|
| API Gateway | http://localhost:8080/health | http://localhost:8080/docs |
| Time Machine | http://localhost:8081/health | http://localhost:8081/docs |
| Reporting | http://localhost:8082/health | http://localhost:8082/docs |

## 🤝 Contributing

1. Each service has its own Git repository
2. Make changes in the respective service directory
3. Test locally with `docker compose up --build <service>`
4. Submit PRs to individual service repositories

---

**Generated on**: $(Get-Date)
**Extracted from**: Scorpius Enterprise Docker images
**Total Services Recovered**: 3 (with more to follow)
