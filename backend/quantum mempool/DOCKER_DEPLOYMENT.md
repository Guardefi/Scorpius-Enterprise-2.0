# Ultimate Quantum Mempool Monitor - Docker Deployment

🚀 **Production-Ready Containerized Deployment**

## Quick Start

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose
- 4GB+ available RAM
- 10GB+ available disk space

### 1. One-Command Deployment

**Windows (PowerShell):**
```powershell
.\deploy-ultimate.ps1 -Action deploy
```

**Linux/Mac (Bash):**
```bash
chmod +x deploy-ultimate.sh
./deploy-ultimate.sh deploy
```

### 2. Manual Deployment

```bash
# Build and start all services
docker-compose -f docker-compose-production.yml up -d --build

# Check status
docker-compose -f docker-compose-production.yml ps

# View logs
docker-compose -f docker-compose-production.yml logs -f quantum-monitor
```

## Service Endpoints

Once deployed, access these services:

| Service | URL | Description |
|---------|-----|-------------|
| **Main API** | http://localhost:8000 | Primary application interface |
| **API Documentation** | http://localhost:8000/docs | Interactive API documentation |
| **Health Check** | http://localhost:8000/api/v1/health | System health monitoring |
| **System Status** | http://localhost:8000/api/v1/status | Detailed system status |
| **Dashboard** | http://localhost:8001 | Interactive monitoring dashboard |
| **WebSocket** | ws://localhost:8765 | Real-time data streaming |

## Container Architecture

```
┌─────────────────────────────────────────────┐
│           ultimate-quantum-monitor          │
│         (Main Application Container)        │
│                                             │
│  ✅ Quantum Threat Detection               │
│  ✅ Advanced ML Algorithms                 │
│  ✅ Enterprise Security                    │
│  ✅ Real-time Alerting                     │
│  ✅ WebSocket API                          │
│  ✅ Interactive Dashboard                  │
│                                             │
│  Ports: 8000, 8001, 8765, 9090            │
└─────────────────────────────────────────────┘
                      │
              ┌───────┴───────┐
              │               │
┌─────────────▼──┐  ┌─────────▼──────┐
│  quantum-redis │  │ quantum-postgres│
│                │  │                 │
│  ✅ Caching    │  │ ✅ Data Storage │
│  ✅ Sessions   │  │ ✅ Audit Logs   │
│                │  │ ✅ Metrics      │
│  Port: 6379    │  │ Port: 5432      │
└────────────────┘  └─────────────────┘
```

## Management Commands

### PowerShell (Windows)
```powershell
# Deploy system
.\deploy-ultimate.ps1 -Action deploy

# Check status
.\deploy-ultimate.ps1 -Action status

# View logs
.\deploy-ultimate.ps1 -Action logs -Service quantum-monitor

# Stop services
.\deploy-ultimate.ps1 -Action stop

# Restart services
.\deploy-ultimate.ps1 -Action restart

# Update deployment
.\deploy-ultimate.ps1 -Action update

# Clean up everything
.\deploy-ultimate.ps1 -Action clean
```

### Bash (Linux/Mac)
```bash
# Deploy system
./deploy-ultimate.sh deploy

# Check status
./deploy-ultimate.sh status

# View logs
./deploy-ultimate.sh logs quantum-monitor

# Stop services
./deploy-ultimate.sh stop

# Restart services
./deploy-ultimate.sh restart

# Update deployment
./deploy-ultimate.sh update

# Clean up everything
./deploy-ultimate.sh clean
```

## Configuration

### Environment Variables
The deployment uses these key environment variables:

```bash
QUANTUM_ENV=production
PYTHONPATH=/app
REDIS_HOST=redis
REDIS_PORT=6379
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=quantum_mempool
POSTGRES_USER=quantum_user
POSTGRES_PASSWORD=quantum_secure_password_2024
```

### Custom Configuration
Mount your custom config file:
```yaml
volumes:
  - ./config/unified-config.yaml:/app/config/unified-config.yaml:ro
```

## Monitoring & Health Checks

### Health Endpoints
- **Application Health**: `GET /api/v1/health`
- **System Status**: `GET /api/v1/status`
- **Quantum Threats**: `GET /api/v1/quantum/threats`

### Container Health Checks
All containers include built-in health checks:
- **quantum-monitor**: HTTP health check on port 8000
- **redis**: Redis ping command
- **postgres**: PostgreSQL connection test

### Viewing Logs
```bash
# Application logs
docker-compose -f docker-compose-production.yml logs -f quantum-monitor

# Database logs
docker-compose -f docker-compose-production.yml logs -f postgres

# Cache logs
docker-compose -f docker-compose-production.yml logs -f redis

# All logs
docker-compose -f docker-compose-production.yml logs -f
```

## Data Persistence

### Volumes
Data is persisted using Docker volumes:
- `quantum_logs`: Application and system logs
- `quantum_data`: Application data and files
- `quantum_config`: Configuration files
- `quantum_redis_data`: Redis cache data
- `quantum_postgres_data`: PostgreSQL database

### Backup
```bash
# Backup database
docker exec quantum-postgres pg_dump -U quantum_user quantum_mempool > backup.sql

# Backup Redis
docker exec quantum-redis redis-cli --rdb /data/dump.rdb BGSAVE
```

## Security Features

### Enterprise Security
- 🔒 Non-root container execution
- 🔒 Secure database passwords
- 🔒 Redis authentication
- 🔒 Network isolation
- 🔒 Health monitoring
- 🔒 Audit logging

### Network Security
- Internal network: `172.20.0.0/16`
- Service-to-service communication isolated
- External access only on necessary ports

## Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using the ports
netstat -tulpn | grep :8000
```

**Container won't start:**
```bash
# Check container logs
docker-compose -f docker-compose-production.yml logs quantum-monitor

# Check resource usage
docker stats
```

**Database connection issues:**
```bash
# Test database connection
docker exec -it quantum-postgres psql -U quantum_user -d quantum_mempool
```

### Performance Tuning
For production environments, consider:
- Increasing container memory limits
- Using SSD storage for volumes
- Implementing container clustering
- Adding load balancing

## Production Checklist

Before deploying to production:

- [ ] Update default passwords in `docker-compose-production.yml`
- [ ] Configure SSL certificates for HTTPS
- [ ] Set up backup procedures
- [ ] Configure monitoring and alerting
- [ ] Review security settings
- [ ] Test disaster recovery procedures
- [ ] Configure log rotation
- [ ] Set up external monitoring

## Support

The containerized Ultimate Quantum Mempool Monitor is now ready for production deployment! 

**Features Included:**
✅ Complete quantum threat detection system  
✅ Enterprise-grade security  
✅ Real-time monitoring and alerting  
✅ Interactive dashboard  
✅ WebSocket API for real-time updates  
✅ Health monitoring and metrics  
✅ Data persistence and backup  
✅ Production-ready configuration  

For technical support or questions, check the application logs and health endpoints first.
