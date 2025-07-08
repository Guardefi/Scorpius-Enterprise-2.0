# Scorpius Enterprise Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Scorpius Enterprise Platform in production environments with enterprise-grade security, scalability, and reliability.

## Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 4 cores per service instance
- **Memory**: 8GB RAM per service instance
- **Storage**: 100GB SSD storage
- **Network**: 1Gbps network connectivity

#### Recommended Production Requirements
- **CPU**: 8+ cores per service instance
- **Memory**: 16GB+ RAM per service instance
- **Storage**: 500GB+ NVMe SSD storage
- **Network**: 10Gbps network connectivity

### Software Dependencies

#### Container Runtime
- **Docker**: 24.0+ or **Podman**: 4.0+
- **Kubernetes**: 1.28+ (for orchestrated deployments)
- **Helm**: 3.12+ (for Kubernetes package management)

#### Database Systems
- **PostgreSQL**: 15+ (primary database)
- **Redis**: 7+ (caching and session storage)
- **MongoDB**: 6+ (optional, for document storage)

#### Monitoring Stack
- **Prometheus**: 2.45+ (metrics collection)
- **Grafana**: 10+ (visualization)
- **AlertManager**: 0.25+ (alerting)

## Deployment Options

### 1. Docker Compose (Development/Testing)

#### Quick Start
```bash
# Clone the repository
git clone https://github.com/your-org/scorpius.git
cd scorpius

# Copy environment configuration
cp .env.example .env

# Edit configuration
nano .env

# Start services
docker-compose up -d
```

#### Configuration
```yaml
# docker-compose.yml
version: '3.8'
services:
  api-gateway:
    build: ./backend/api-gateway
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
```

### 2. Kubernetes (Production)

#### Namespace Setup
```bash
# Create namespace
kubectl create namespace scorpius-production

# Create secrets
kubectl create secret generic scorpius-secrets \
  --from-literal=jwt-secret=${JWT_SECRET} \
  --from-literal=db-password=${DB_PASSWORD} \
  -n scorpius-production
```

#### Deployment Manifests
```yaml
# api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: scorpius-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
      - name: api-gateway
        image: ghcr.io/your-org/scorpius-api-gateway:latest
        ports:
        - containerPort: 8000
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: scorpius-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 3. AWS EKS (Cloud Production)

#### Infrastructure Setup
```bash
# Create EKS cluster
eksctl create cluster \
  --name scorpius-production \
  --region us-west-2 \
  --nodegroup-name standard-workers \
  --node-type m5.large \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 10 \
  --managed
```

#### Terraform Configuration
```hcl
# main.tf
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = "scorpius-production"
  cluster_version = "1.28"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  node_groups = {
    main = {
      desired_capacity = 3
      max_capacity     = 10
      min_capacity     = 1
      
      instance_types = ["m5.large"]
      
      k8s_labels = {
        Environment = "production"
        Application = "scorpius"
      }
    }
  }
}
```

## Configuration Management

### 1. Environment Variables

#### Core Configuration
```bash
# Application Settings
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=INFO
PORT=8000

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:5432/scorpius
REDIS_URL=redis://redis-host:6379

# Security Settings
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
ENCRYPTION_KEY=your-32-char-encryption-key-here

# External Services
PROMETHEUS_URL=http://prometheus:9090
GRAFANA_URL=http://grafana:3000

# Rate Limiting
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60

# CORS Configuration
ALLOWED_ORIGINS=https://app.scorpius.com,https://admin.scorpius.com
ALLOWED_HOSTS=scorpius.com,api.scorpius.com
```

### 2. Secrets Management

#### AWS Secrets Manager
```python
import boto3
from botocore.exceptions import ClientError

def get_secret(secret_name, region_name="us-west-2"):
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=region_name
    )
    
    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=secret_name
        )
        return get_secret_value_response['SecretString']
    except ClientError as e:
        raise e
```

#### HashiCorp Vault
```bash
# Store secrets in Vault
vault kv put secret/scorpius/production \
  jwt_secret="your-jwt-secret" \
  db_password="your-db-password"

# Retrieve secrets
vault kv get -field=jwt_secret secret/scorpius/production
```

## Database Setup

### 1. PostgreSQL Configuration

#### Production Setup
```sql
-- Create database and user
CREATE DATABASE scorpius;
CREATE USER scorpius WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE scorpius TO scorpius;

-- Performance tuning
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
```

#### Connection Pooling
```python
# Database connection pool configuration
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True,
    pool_recycle=3600
)
```

### 2. Redis Configuration

#### Production Redis Setup
```bash
# redis.conf
bind 0.0.0.0
port 6379
requirepass your-secure-redis-password
maxmemory 2gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Monitoring & Observability

### 1. Prometheus Configuration

#### Prometheus Config
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'scorpius-api-gateway'
    static_configs:
      - targets: ['api-gateway:8000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'kubernetes-pods'
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
        action: keep
        regex: true
```

### 2. Grafana Dashboards

#### Key Metrics Dashboard
```json
{
  "dashboard": {
    "title": "Scorpius API Gateway",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      }
    ]
  }
}
```

### 3. Alerting Rules

#### Critical Alerts
```yaml
# alert_rules.yml
groups:
  - name: scorpius_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"
```

## Security Configuration

### 1. TLS/SSL Setup

#### Certificate Management
```bash
# Using cert-manager for automatic certificate management
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@scorpius.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

### 2. Network Security

#### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-gateway-netpol
  namespace: scorpius-production
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
```

## Load Balancing & High Availability

### 1. Ingress Configuration

#### NGINX Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: scorpius-ingress
  namespace: scorpius-production
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.scorpius.com
    secretName: scorpius-tls
  rules:
  - host: api.scorpius.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway-service
            port:
              number: 8000
```

### 2. Horizontal Pod Autoscaling

#### HPA Configuration
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: scorpius-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Backup & Disaster Recovery

### 1. Database Backup

#### Automated PostgreSQL Backup
```bash
#!/bin/bash
# backup-postgres.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="scorpius_backup_${DATE}.sql"

# Create backup
pg_dump -h $DB_HOST -U $DB_USER -d scorpius > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}.gz" s3://scorpius-backups/postgres/

# Clean up old backups (keep 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete
```

### 2. Application State Backup

#### Redis Backup
```bash
#!/bin/bash
# backup-redis.sh

BACKUP_DIR="/backups/redis"
DATE=$(date +%Y%m%d_%H%M%S)

# Create Redis backup
redis-cli --rdb "${BACKUP_DIR}/dump_${DATE}.rdb"

# Upload to S3
aws s3 cp "${BACKUP_DIR}/dump_${DATE}.rdb" s3://scorpius-backups/redis/
```

## Performance Optimization

### 1. Application Performance

#### Connection Pooling
```python
# Optimized database connection pool
DATABASE_POOL_SIZE = 20
DATABASE_MAX_OVERFLOW = 30
DATABASE_POOL_TIMEOUT = 30
DATABASE_POOL_RECYCLE = 3600

# Redis connection pool
REDIS_CONNECTION_POOL_SIZE = 50
REDIS_CONNECTION_POOL_TIMEOUT = 5
```

#### Caching Strategy
```python
# Multi-level caching
import redis
from functools import wraps

redis_client = redis.Redis(
    host='redis-host',
    port=6379,
    db=0,
    max_connections=50
)

def cache_result(expiration=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{hash(str(args) + str(kwargs))}"
            
            # Try to get from cache
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, expiration, json.dumps(result))
            
            return result
        return wrapper
    return decorator
```

### 2. Infrastructure Performance

#### Resource Limits
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

## Troubleshooting

### 1. Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
kubectl exec -it api-gateway-pod -- psql $DATABASE_URL -c "SELECT 1"

# Check connection pool status
kubectl logs api-gateway-pod | grep "connection pool"
```

#### Memory Issues
```bash
# Check memory usage
kubectl top pods -n scorpius-production

# Check for memory leaks
kubectl exec -it api-gateway-pod -- python -c "
import psutil
process = psutil.Process()
print(f'Memory usage: {process.memory_info().rss / 1024 / 1024:.2f} MB')
"
```

### 2. Log Analysis

#### Centralized Logging
```bash
# View application logs
kubectl logs -f deployment/api-gateway -n scorpius-production

# Search for errors
kubectl logs deployment/api-gateway -n scorpius-production | grep ERROR

# View audit logs
kubectl logs deployment/api-gateway -n scorpius-production | grep "audit_event"
```

## Maintenance

### 1. Regular Maintenance Tasks

#### Weekly Tasks
- [ ] Review security alerts
- [ ] Check backup integrity
- [ ] Update dependencies
- [ ] Review performance metrics

#### Monthly Tasks
- [ ] Security vulnerability scan
- [ ] Capacity planning review
- [ ] Disaster recovery testing
- [ ] Performance optimization review

### 2. Update Procedures

#### Rolling Updates
```bash
# Update deployment image
kubectl set image deployment/api-gateway \
  api-gateway=ghcr.io/your-org/scorpius-api-gateway:v1.4.1 \
  -n scorpius-production

# Monitor rollout
kubectl rollout status deployment/api-gateway -n scorpius-production

# Rollback if needed
kubectl rollout undo deployment/api-gateway -n scorpius-production
```

## Support & Contacts

### Emergency Contacts
- **Operations Team**: ops@scorpius.com
- **Security Team**: security@scorpius.com
- **On-call Engineer**: +1-XXX-XXX-XXXX

### Documentation
- **API Documentation**: https://docs.scorpius.com/api
- **Runbook**: https://docs.scorpius.com/runbook
- **Architecture**: https://docs.scorpius.com/architecture

---

*This deployment guide is regularly updated. For the latest version, visit: https://docs.scorpius.com/deployment*