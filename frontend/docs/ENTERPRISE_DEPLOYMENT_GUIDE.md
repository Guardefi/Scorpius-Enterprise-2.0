# SCORPIUS Enterprise Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Security Requirements](#security-requirements)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Monitoring & Alerting](#monitoring--alerting)
7. [High Availability](#high-availability)
8. [Disaster Recovery](#disaster-recovery)
9. [Compliance & Auditing](#compliance--auditing)
10. [Troubleshooting](#troubleshooting)

## Overview

SCORPIUS Quantum Security Platform is an enterprise-grade security analysis platform designed for organizations requiring the highest levels of security assessment and monitoring capabilities.

### Key Features

- **Multi-Tool Integration**: Slither, Mythril, Manticore, and custom security engines
- **Real-time Monitoring**: WebSocket-based live updates and alerting
- **Enterprise Authentication**: SSO, RBAC, and audit logging
- **Scalable Architecture**: Kubernetes-ready with horizontal scaling
- **Compliance Ready**: SOC 2, ISO 27001, and regulatory compliance features

## Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Security DB   │
│   (React SPA)   │◄──►│   (FastAPI)     │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │   WebSocket     │              │
         └──────────────►│   Gateway       │◄─────────────┘
                        └─────────────────┘
                                │
         ���──────────────────────┼──────────────────────┐
         │                      │                      │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Slither       │    │   Mythril       │    │   Manticore     │
│   Analysis      │    │   Analysis      │    │   Analysis      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Infrastructure Requirements

#### Minimum Requirements (Development)

- **CPU**: 8 cores
- **Memory**: 16 GB RAM
- **Storage**: 100 GB SSD
- **Network**: 1 Gbps

#### Production Requirements (High Availability)

- **Load Balancer**: 2x instances (4 cores, 8 GB RAM each)
- **Frontend Servers**: 3x instances (4 cores, 8 GB RAM each)
- **Backend APIs**: 5x instances (8 cores, 16 GB RAM each)
- **Security Analysis**: 10x instances (16 cores, 32 GB RAM each)
- **Database Cluster**: 3x instances (16 cores, 64 GB RAM, 1 TB SSD each)
- **Cache Layer**: 3x Redis instances (8 cores, 16 GB RAM each)
- **Monitoring**: 2x instances (8 cores, 16 GB RAM each)

## Security Requirements

### Network Security

```yaml
# Required firewall rules
Ingress:
  - Port 443 (HTTPS) from client networks
  - Port 22 (SSH) from management networks only
  - Port 5432 (PostgreSQL) from application networks only
  - Port 6379 (Redis) from application networks only

Egress:
  - Port 443 (HTTPS) for external API calls
  - Port 53 (DNS) for name resolution
  - Block all other outbound traffic
```

### TLS Configuration

```nginx
# Minimum TLS 1.3 configuration
ssl_protocols TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
```

### Authentication & Authorization

- **Multi-Factor Authentication (MFA)**: Required for all users
- **Role-Based Access Control (RBAC)**: Granular permissions
- **Session Management**: Secure session handling with automatic logout
- **API Security**: JWT tokens with short expiration and refresh rotation

## Installation

### Docker Compose Deployment

```bash
# Clone the repository
git clone https://github.com/scorpius-security/platform.git
cd platform

# Configure environment
cp .env.example .env.production
nano .env.production

# Generate secrets
openssl rand -hex 32 > secrets/jwt_secret
openssl rand -hex 32 > secrets/database_password
openssl rand -hex 32 > secrets/redis_password

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

```yaml
# Apply namespace
kubectl apply -f k8s/namespace.yaml

# Apply secrets
kubectl apply -f k8s/secrets/

# Apply configurations
kubectl apply -f k8s/configmaps/

# Deploy services
kubectl apply -f k8s/services/

# Deploy ingress
kubectl apply -f k8s/ingress/
```

### Environment Variables

```bash
# Core Application
APP_ENV=production
DEBUG=false
SECRET_KEY=${JWT_SECRET}

# Database Configuration
DATABASE_URL=postgresql://scorpius:${DB_PASSWORD}@postgres:5432/scorpius
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis Configuration
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
REDIS_POOL_SIZE=10

# Security Configuration
CORS_ORIGINS=https://scorpius.yourdomain.com
ALLOWED_HOSTS=scorpius.yourdomain.com,*.yourdomain.com

# Authentication
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# External Integrations
STRIPE_SECRET_KEY=${STRIPE_SECRET}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}

# Monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
SENTRY_DSN=${SENTRY_DSN}

# Enterprise Features
ENTERPRISE_LICENSE_KEY=${ENTERPRISE_LICENSE}
SSO_ENABLED=true
SAML_PROVIDER_URL=${SAML_URL}
LDAP_SERVER=${LDAP_SERVER}
```

## Configuration

### Database Schema Migration

```bash
# Run initial migrations
docker exec -it scorpius-backend alembic upgrade head

# Create enterprise admin user
docker exec -it scorpius-backend python -m app.cli create-admin \
  --email admin@yourdomain.com \
  --password ${ADMIN_PASSWORD} \
  --role enterprise_admin
```

### Security Tools Configuration

#### Slither Configuration

```json
{
  "detectors_to_run": [
    "reentrancy-eth",
    "reentrancy-no-eth",
    "reentrancy-unlimited-gas",
    "uninitialized-state",
    "uninitialized-storage",
    "uninitialized-local",
    "arbitrary-send",
    "controlled-delegatecall",
    "weak-prng",
    "suicidal",
    "assembly",
    "assert-state-change",
    "boolean-equal",
    "dangerous-strict-equalities",
    "deprecated-standards",
    "erc20-interface",
    "incorrect-equality",
    "locked-ether",
    "low-level-calls",
    "naming-convention",
    "pragma",
    "redundant-statements",
    "solc-version",
    "timestamp",
    "too-many-digits",
    "tx-origin",
    "unused-return",
    "unused-state",
    "void-cst"
  ],
  "exclude_detectors": [],
  "exclude_optimization": false,
  "exclude_informational": false,
  "exclude_low": false,
  "exclude_medium": false,
  "exclude_high": false,
  "json": true,
  "sarif": true
}
```

#### Mythril Configuration

```yaml
# mythril.config.yaml
analysis:
  strategy: "bfs"
  max_depth: 50
  create_timeout: 10
  execution_timeout: 86400
  solver_timeout: 10000

detectors:
  - "SWC-101" # Integer Overflow
  - "SWC-104" # Unchecked Call Return Value
  - "SWC-107" # Reentrancy
  - "SWC-108" # State Variable Default Visibility
  - "SWC-110" # Assert Violation
  - "SWC-113" # DoS with Failed Call
  - "SWC-115" # Authorization through tx.origin
  - "SWC-116" # Timestamp Dependence
  - "SWC-120" # Weak Sources of Randomness
  - "SWC-124" # Write to Arbitrary Storage Location

output:
  format: "json"
  verbose: 2
```

#### Manticore Configuration

```python
# manticore.config.py
from manticore.ethereum import ManticoreEVM

class ManticoreConfig:
    def __init__(self):
        self.m = ManticoreEVM()

        # Analysis settings
        self.m.context['max_depth'] = 100
        self.m.context['max_coverage'] = 90
        self.m.context['timeout'] = 3600

        # Detector settings
        self.detectors = [
            'DetectReentrancySimple',
            'DetectReentrancyAdvanced',
            'DetectUnusedRetVal',
            'DetectSuicidal',
            'DetectExternalCallAndLeak',
            'DetectEnvInstruction',
            'DetectRaceCondition',
            'DetectManipulableBalance',
            'DetectIntegerOverflow',
            'DetectUninitializedStorage',
            'DetectUninitializedMemory',
            'DetectInvalidJumpdest',
            'DetectUnusedRetVal'
        ]

        # Enable all detectors
        for detector in self.detectors:
            self.m.register_detector(detector)
```

## Monitoring & Alerting

### Prometheus Metrics

Key metrics monitored by SCORPIUS:

```promql
# Security Metrics
scorpius_threats_detected_total
scorpius_vulnerabilities_total{severity="critical|high|medium|low"}
scorpius_scans_total{status="completed|failed|running"}
scorpius_scan_duration_seconds
scorpius_false_positive_rate

# Performance Metrics
scorpius_api_requests_total
scorpius_api_request_duration_seconds
scorpius_websocket_connections_active
scorpius_database_connections_active
scorpius_cache_hit_ratio

# System Metrics
scorpius_cpu_usage_percent
scorpius_memory_usage_bytes
scorpius_disk_usage_bytes
scorpius_network_bytes_total
```

### Grafana Dashboards

Enterprise customers receive pre-configured dashboards:

1. **Executive Dashboard**: High-level security KPIs
2. **Operations Dashboard**: System health and performance
3. **Security Analysis Dashboard**: Detailed vulnerability tracking
4. **Compliance Dashboard**: Audit trails and compliance metrics

### Alert Rules

```yaml
# Critical security alerts
groups:
  - name: scorpius.security
    rules:
      - alert: CriticalVulnerabilityDetected
        expr: increase(scorpius_vulnerabilities_total{severity="critical"}[5m]) > 0
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: "Critical vulnerability detected"
          description: "A critical security vulnerability has been detected in smart contract analysis"

      - alert: HighVulnerabilitySpike
        expr: rate(scorpius_vulnerabilities_total{severity="high"}[5m]) > 10
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High volume of vulnerabilities detected"
          description: "Unusual spike in high-severity vulnerabilities"

      - alert: SecurityScanFailureRate
        expr: rate(scorpius_scans_total{status="failed"}[5m]) / rate(scorpius_scans_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High security scan failure rate"
          description: "More than 10% of security scans are failing"
```

## High Availability

### Load Balancer Configuration

```nginx
upstream scorpius_backend {
    least_conn;
    server backend-1:8000 max_fails=3 fail_timeout=30s;
    server backend-2:8000 max_fails=3 fail_timeout=30s;
    server backend-3:8000 max_fails=3 fail_timeout=30s;
    server backend-4:8000 max_fails=3 fail_timeout=30s;
    server backend-5:8000 max_fails=3 fail_timeout=30s;
}

upstream scorpius_frontend {
    least_conn;
    server frontend-1:3004 max_fails=3 fail_timeout=30s;
    server frontend-2:3004 max_fails=3 fail_timeout=30s;
    server frontend-3:3004 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name scorpius.yourdomain.com;

    # Health checks
    location /health {
        access_log off;
        proxy_pass http://scorpius_backend/health;
        proxy_set_header Host $host;
    }

    # API routing
    location /api/ {
        proxy_pass http://scorpius_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket routing
    location /ws {
        proxy_pass http://scorpius_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }

    # Frontend routing
    location / {
        proxy_pass http://scorpius_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Database High Availability

```yaml
# PostgreSQL cluster configuration
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: scorpius-postgres
spec:
  instances: 3

  postgresql:
    parameters:
      max_connections: "400"
      shared_buffers: "2GB"
      effective_cache_size: "6GB"
      maintenance_work_mem: "512MB"
      checkpoint_completion_target: "0.9"
      wal_buffers: "16MB"
      default_statistics_target: "100"
      random_page_cost: "1.1"
      effective_io_concurrency: "200"

  bootstrap:
    initdb:
      database: scorpius
      owner: scorpius
      secret:
        name: postgres-credentials

  monitoring:
    enabled: true

  backup:
    barmanObjectStore:
      s3Credentials:
        accessKeyId:
          name: backup-credentials
          key: access-key-id
        secretAccessKey:
          name: backup-credentials
          key: secret-access-key
      wal:
        retention: "1w"
      data:
        retention: "30d"
```

## Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh - Enterprise backup script

set -euo pipefail

BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Database backup
echo "Backing up databases..."
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/scorpius_main.sql.gz"
pg_dump "$SECURITY_DATABASE_URL" | gzip > "$BACKUP_DIR/scorpius_security.sql.gz"
pg_dump "$SETTINGS_DATABASE_URL" | gzip > "$BACKUP_DIR/scorpius_settings.sql.gz"
pg_dump "$MONITORING_DATABASE_URL" | gzip > "$BACKUP_DIR/scorpius_monitoring.sql.gz"

# Configuration backup
echo "Backing up configurations..."
tar -czf "$BACKUP_DIR/configs.tar.gz" /etc/scorpius/

# Secrets backup (encrypted)
echo "Backing up secrets..."
tar -czf - /etc/scorpius/secrets/ | \
  gpg --symmetric --cipher-algo AES256 --output "$BACKUP_DIR/secrets.tar.gz.gpg"

# Upload to S3
echo "Uploading to S3..."
aws s3 sync "$BACKUP_DIR" "s3://${BACKUP_BUCKET}/$(basename $BACKUP_DIR)/"

# Cleanup local backups older than 7 days
find /backups -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR"
```

### Recovery Procedures

```bash
#!/bin/bash
# restore.sh - Enterprise restore script

BACKUP_DATE="$1"
RESTORE_DIR="/tmp/restore_$BACKUP_DATE"

if [[ -z "$BACKUP_DATE" ]]; then
    echo "Usage: $0 <YYYYMMDD_HHMMSS>"
    exit 1
fi

# Download from S3
echo "Downloading backup from S3..."
mkdir -p "$RESTORE_DIR"
aws s3 sync "s3://${BACKUP_BUCKET}/$BACKUP_DATE/" "$RESTORE_DIR/"

# Restore databases
echo "Restoring databases..."
gunzip -c "$RESTORE_DIR/scorpius_main.sql.gz" | psql "$DATABASE_URL"
gunzip -c "$RESTORE_DIR/scorpius_security.sql.gz" | psql "$SECURITY_DATABASE_URL"
gunzip -c "$RESTORE_DIR/scorpius_settings.sql.gz" | psql "$SETTINGS_DATABASE_URL"
gunzip -c "$RESTORE_DIR/scorpius_monitoring.sql.gz" | psql "$MONITORING_DATABASE_URL"

# Restore configurations
echo "Restoring configurations..."
tar -xzf "$RESTORE_DIR/configs.tar.gz" -C /

# Restore secrets (requires passphrase)
echo "Restoring secrets..."
gpg --decrypt "$RESTORE_DIR/secrets.tar.gz.gpg" | tar -xzf - -C /

# Restart services
echo "Restarting services..."
docker-compose restart

echo "Restore completed from backup: $BACKUP_DATE"
```

## Compliance & Auditing

### Audit Logging

All user actions and system events are logged with:

- **User ID and session information**
- **Timestamp with timezone**
- **Action performed**
- **IP address and user agent**
- **Request/response data (sanitized)**
- **Success/failure status**

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "user_id": "user_12345",
  "session_id": "sess_abcdef",
  "action": "security_scan_initiated",
  "resource": "smart_contract",
  "resource_id": "contract_98765",
  "ip_address": "192.168.1.100",
  "user_agent": "SCORPIUS Desktop v1.0.0",
  "request_data": {
    "scan_type": "comprehensive",
    "tools": ["slither", "mythril", "manticore"]
  },
  "response_status": "success",
  "execution_time_ms": 1234
}
```

### Compliance Reports

Generate automated compliance reports for:

- **SOC 2 Type II**: Security, availability, processing integrity
- **ISO 27001**: Information security management
- **GDPR**: Data protection and privacy
- **HIPAA**: Healthcare data protection (if applicable)

## Troubleshooting

### Common Issues

#### High Memory Usage

```bash
# Check container memory usage
docker stats

# Check PostgreSQL performance
docker exec -it scorpius-postgres psql -c "
SELECT
  pid,
  usename,
  application_name,
  state,
  query_start,
  query
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;
"

# Optimize PostgreSQL
docker exec -it scorpius-postgres psql -c "
REINDEX DATABASE scorpius;
VACUUM ANALYZE;
"
```

#### WebSocket Connection Issues

```bash
# Check WebSocket endpoint
curl -I -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Key: test" \
  -H "Sec-WebSocket-Version: 13" \
  https://scorpius.yourdomain.com/ws

# Check Redis connectivity
docker exec -it scorpius-redis redis-cli ping
```

#### Security Scan Failures

```bash
# Check security tool logs
docker logs scorpius-slither
docker logs scorpius-mythril
docker logs scorpius-manticore

# Test tool availability
docker exec -it scorpius-backend python -c "
import subprocess
tools = ['slither', 'myth', 'manticore']
for tool in tools:
    try:
        result = subprocess.run([tool, '--version'],
                              capture_output=True, text=True)
        print(f'{tool}: {result.stdout.strip()}')
    except Exception as e:
        print(f'{tool}: ERROR - {e}')
"
```

### Support Contacts

- **Enterprise Support**: enterprise@scorpius.security
- **Emergency Hotline**: +1-800-SCORPIUS
- **Documentation**: https://docs.scorpius.security
- **Status Page**: https://status.scorpius.security

---

_This documentation is maintained by the SCORPIUS Security Team. For updates and additional resources, visit our [Enterprise Portal](https://enterprise.scorpius.security)._
