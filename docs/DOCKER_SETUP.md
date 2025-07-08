# Scorpius Docker Compose Setup

This repository now includes a unified Docker Compose setup that makes it easy to run the entire Scorpius platform locally.

## Quick Start

1. **Clone and setup**:
   ```bash
   git clone https://github.com/Guardefi/Scorpius1.5.git
   cd Scorpius1.5
   ```

2. **Configure environment**:
   ```bash
   # The .env file is already configured with sensible defaults
   # Customize it if needed for your environment
   ```

3. **Start everything**:
   ```bash
   # Using make (recommended)
   make up

   # Or using docker compose directly
   docker compose up -d
   ```

4. **Check status**:
   ```bash
   make status
   # or
   docker compose ps
   ```

## Available Services

The setup includes all Scorpius services:

### Core Services
- **API Gateway**: `http://localhost:8080` - Main entry point
- **Frontend**: `http://localhost:3000` - Web interface
- **Auth Proxy**: Internal authentication service
- **Audit Trail**: Internal audit logging

### Scanner Services
- **Scanner AI Orchestrator**: `http://localhost:8010`
- **Mythril Scanner**: Internal security scanner
- **Slither Scanner**: Internal static analysis
- **Manticore Scanner**: Internal symbolic execution
- **MythX Scanner**: Internal security scanner

### Blockchain Services
- **Time Machine**: `http://localhost:8020` - Historical state replay
- **Reporting**: `http://localhost:8021` - Analytics and reports
- **Mempool**: `http://localhost:8030` - Transaction monitoring
- **MEV Bot**: `http://localhost:8040` - MEV detection/protection

### Infrastructure
- **PostgreSQL**: `localhost:5432` - Database
- **Redis**: `localhost:6379` - Cache and message broker
- **Keycloak**: `http://localhost:8090` - Identity management
- **PgAdmin**: `http://localhost:8083` - Database management
- **Redis Commander**: `http://localhost:8084` - Redis management

## Management Commands

### Using Make (Recommended)
```bash
make up          # Start all services
make down        # Stop all services
make restart     # Restart all services
make logs        # Show logs for all services
make logs-api-gateway  # Show logs for specific service
make status      # Show service status
make clean-docker      # Remove everything (containers, volumes)
make db-shell    # Open PostgreSQL shell
make redis-shell # Open Redis CLI
```

### Using Docker Compose Directly
```bash
docker compose up -d           # Start services
docker compose down            # Stop services
docker compose logs -f         # Follow logs
docker compose ps              # Show status
docker compose exec api-gateway bash  # Shell into service
```

## Configuration

### Environment Variables
Key environment variables are defined in `.env`:

```bash
# Database
POSTGRES_PASSWORD=postgres
POSTGRES_USER=postgres
POSTGRES_DB=scorpius

# Security
JWT_SECRET=super-secret-string-change-in-production
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# Redis
REDIS_PASSWORD=ChangeMe

# Blockchain
ETH_RPC_URL=wss://mainnet.infura.io/ws/v3/YOUR_INFURA_KEY
```

### Service Communication
All services run on the same Docker network (`scorpius-net`) and can communicate using service names:
- `http://api-gateway:8000`
- `http://auth_proxy:8000`
- `http://db:5432`
- `http://redis:6379`

## Development Workflow

### 1. Start Core Services Only
```bash
# Start just infrastructure
docker compose up -d db redis keycloak

# Add core services
docker compose up -d api-gateway auth_proxy audit_trail
```

### 2. Live Development
For live code reloading, mount your source code:
```yaml
# Add to docker-compose.override.yml
services:
  api-gateway:
    volumes:
      - ./backend/api-gateway:/app
```

### 3. Debugging
```bash
# View logs
make logs-api-gateway

# Shell into container
make shell-api-gateway

# Check health
make health-docker
```

### 4. Testing Changes
```bash
# Rebuild specific service
docker compose build api-gateway
docker compose up -d api-gateway

# Or rebuild everything
make rebuild
make up
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 3000, 8080, 5432, 6379 are available
2. **Memory issues**: Ensure Docker has at least 8GB RAM allocated
3. **Build failures**: Run `make clean-docker` and `make rebuild`

### Logs and Debugging
```bash
# Check specific service logs
make logs-api-gateway

# Check all logs
make logs

# Check system resources
make stats

# Health check
docker compose ps
```

### Database Issues
```bash
# Connect to database
make db-shell

# Reset database
docker compose down -v
docker compose up -d
```

## Production Considerations

Before deploying to production:

1. **Change secrets** in `.env`:
   ```bash
   JWT_SECRET=your-super-secure-secret
   POSTGRES_PASSWORD=strong-password
   KEYCLOAK_ADMIN_PASSWORD=strong-password
   ```

2. **Use proper domains** instead of localhost

3. **Add SSL/TLS** termination (nginx, traefik, etc.)

4. **Configure monitoring** and health checks

5. **Set up backups** for database and volumes

## Network Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │   API Gateway   │    │  Auth Proxy     │
│   :3000         │───▶│     :8080       │───▶│    :8000        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Scanner AI   │    │   PostgreSQL    │    │   Keycloak      │
│     :8010       │    │     :5432       │    │    :8090        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │     :6379       │
                       └─────────────────┘
```

All services communicate over the `scorpius-net` Docker network.
