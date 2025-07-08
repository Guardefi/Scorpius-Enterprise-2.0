# SCORPIUS Security Platform - Complete API Specification

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Security Scanner APIs](#security-scanner-apis)
3. [Honeypot Detection APIs](#honeypot-detection-apis)
4. [MEV Operations APIs](#mev-operations-apis)
5. [Wallet Guard APIs](#wallet-guard-apis)
6. [Time Machine APIs](#time-machine-apis)
7. [Real-time Monitoring](#real-time-monitoring)
8. [Analytics & Metrics APIs](#analytics--metrics-apis)
9. [User Management APIs](#user-management-apis)
10. [WebSocket Connections](#websocket-connections)
11. [SDK Endpoints](#sdk-endpoints)
12. [Plugin System APIs](#plugin-system-apis)
13. [System Management APIs](#system-management-apis)

---

## Authentication & Authorization

### Authentication Endpoints

#### `POST /api/v1/auth/login`

User authentication with credentials or wallet

```json
{
  "method": "credentials|wallet|oauth",
  "email": "user@example.com",
  "password": "password",
  "walletAddress": "0x...",
  "signature": "0x...",
  "provider": "metamask|walletconnect|coinbase"
}
```

#### `POST /api/v1/auth/logout`

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### `POST /api/v1/auth/refresh`

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### `POST /api/v1/auth/verify-2fa`

```json
{
  "token": "123456",
  "method": "totp|sms|email"
}
```

---

## Security Scanner APIs

### Vulnerability Scanning

#### `POST /api/v1/scanner/analyze`

Initiate comprehensive security analysis

```json
{
  "target": {
    "type": "contract|bytecode|source",
    "address": "0x...",
    "bytecode": "0x608060405...",
    "source": "pragma solidity ^0.8.0...",
    "chain": "ethereum|bsc|polygon|arbitrum"
  },
  "analysis": {
    "engines": ["slither", "mythril", "manticore", "securify", "oyente"],
    "depth": "quick|standard|deep",
    "timeout": 300,
    "customRules": ["reentrancy", "overflow", "access-control"]
  }
}
```

#### `GET /api/v1/scanner/results/{analysisId}`

Get analysis results

```json
{
  "id": "analysis_123",
  "status": "completed|running|failed",
  "progress": 85,
  "vulnerabilities": [...],
  "metrics": {...},
  "recommendations": [...]
}
```

### Plugin-Specific Endpoints

#### `POST /api/v1/scanner/slither`

Slither static analysis

```json
{
  "source": "contract source code",
  "detectors": ["reentrancy", "uninitialized-state", "unused-return"],
  "exclude": ["naming-convention"],
  "severity": ["high", "medium", "low"]
}
```

#### `POST /api/v1/scanner/mythril`

Mythril symbolic execution

```json
{
  "bytecode": "0x608060405...",
  "address": "0x...",
  "maxDepth": 22,
  "executionTimeout": 600,
  "modules": ["integer", "exceptions", "ether_thief"]
}
```

#### `POST /api/v1/scanner/manticore`

Manticore dynamic analysis

```json
{
  "source": "contract source",
  "constraints": ["require(amount > 0)"],
  "explorationStrategy": "dfs|bfs|random",
  "maxStates": 100
}
```

#### `GET /api/v1/scanner/engines/status`

Get status of all analysis engines

```json
{
  "slither": {
    "status": "online|offline|maintenance",
    "version": "0.9.6",
    "queueLength": 5,
    "avgProcessingTime": 45
  },
  "mythril": {...},
  "manticore": {...}
}
```

---

## Honeypot Detection APIs

### Analysis Endpoints

#### `POST /api/v1/honeypot/analyze`

Multi-method honeypot detection

```json
{
  "contractAddress": "0x...",
  "chain": "ethereum|bsc|polygon",
  "methods": {
    "static": true,
    "bytecode": true,
    "dynamic": true,
    "ml": true,
    "liquidity": true
  },
  "simulationParams": {
    "testAmount": "0.1",
    "slippageTolerance": 3,
    "gasLimit": 500000
  }
}
```

#### `GET /api/v1/honeypot/results/{analysisId}`

Get honeypot analysis results

```json
{
  "honeypotScore": 94,
  "riskLevel": "critical|high|medium|low|safe",
  "primaryTrigger": "Revert on sell > 1 ETH",
  "methods": {
    "static": {...},
    "bytecode": {...},
    "dynamic": {...},
    "ml": {...},
    "liquidity": {...}
  }
}
```

#### `POST /api/v1/honeypot/simulation/replay`

Replay transaction simulation

```json
{
  "analysisId": "hp_001",
  "stepIndex": 2,
  "customParams": {
    "amount": "1.0",
    "gasPrice": "20000000000"
  }
}
```

### Watchlist Management

#### `POST /api/v1/honeypot/watchlist`

Add contract to watchlist

```json
{
  "address": "0x...",
  "chain": "ethereum",
  "alertThreshold": 70,
  "scanInterval": 300,
  "alerts": {
    "email": true,
    "telegram": true,
    "webhook": "https://..."
  }
}
```

#### `GET /api/v1/honeypot/watchlist`

Get user's watchlist with pagination

```json
{
  "page": 1,
  "limit": 20,
  "sortBy": "lastChecked|honeypotScore|addedAt",
  "filter": "all|active|warning|inactive"
}
```

---

## MEV Operations APIs

### Strategy Management

#### `GET /api/v1/mev/strategies`

Get active MEV strategies

```json
{
  "strategies": [
    {
      "id": "mev_001",
      "name": "DEX Arbitrage Scanner",
      "type": "arbitrage",
      "status": "active|paused|stopped",
      "profitability": 847.23,
      "successRate": 92.4
    }
  ]
}
```

#### `POST /api/v1/mev/strategies`

Create new MEV strategy

```json
{
  "name": "Custom Arbitrage Bot",
  "type": "arbitrage|liquidation|sandwich|frontrun",
  "parameters": {
    "targetPools": ["0x...", "0x..."],
    "minProfitThreshold": 0.01,
    "maxGasPrice": 50000000000,
    "slippageTolerance": 0.5
  }
}
```

#### `PUT /api/v1/mev/strategies/{strategyId}/status`

Update strategy status

```json
{
  "status": "active|paused|stopped",
  "reason": "Manual pause for optimization"
}
```

### Opportunity Detection

#### `GET /api/v1/mev/opportunities`

Get real-time MEV opportunities

```json
{
  "filters": {
    "type": ["arbitrage", "liquidation"],
    "minProfit": 0.1,
    "priority": ["high", "medium"]
  },
  "realtime": true
}
```

#### `POST /api/v1/mev/opportunities/{oppId}/execute`

Execute MEV opportunity

```json
{
  "strategyId": "mev_001",
  "maxGas": 200000,
  "slippageOverride": 1.0,
  "dryRun": false
}
```

---

## Wallet Guard APIs

### Wallet Analysis

#### `POST /api/v1/wallet/analyze`

Comprehensive wallet security analysis

```json
{
  "address": "0x...",
  "ens": "vitalik.eth",
  "chain": "ethereum",
  "depth": "standard|deep",
  "includeHistory": true
}
```

#### `GET /api/v1/wallet/risk-profile/{address}`

Get wallet risk profile

```json
{
  "address": "0x...",
  "riskScore": 67,
  "riskLevel": "medium",
  "totalValue": "89456.78",
  "approvals": {...},
  "interactions": {...}
}
```

#### `GET /api/v1/wallet/approvals/{address}`

Get token approvals analysis

```json
{
  "address": "0x...",
  "approvals": [
    {
      "spender": "0x...",
      "token": "0x...",
      "amount": "unlimited|1000000",
      "riskLevel": "high",
      "lastUsed": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `POST /api/v1/wallet/approvals/revoke`

Revoke token approval

```json
{
  "walletAddress": "0x...",
  "tokenAddress": "0x...",
  "spenderAddress": "0x...",
  "signature": "0x..."
}
```

---

## Time Machine APIs

### Historical Analysis

#### `POST /api/v1/time-machine/query`

Query historical blockchain state

```json
{
  "blockNumber": 18850000,
  "timestamp": "2024-01-15T10:30:00Z",
  "queries": [
    {
      "type": "balance",
      "address": "0x...",
      "token": "0x..."
    },
    {
      "type": "storage",
      "address": "0x...",
      "slot": "0x0"
    }
  ]
}
```

#### `GET /api/v1/time-machine/exploits`

Get famous exploit database

```json
{
  "category": "flash-loan|reentrancy|oracle|bridge",
  "dateRange": {
    "start": "2022-01-01",
    "end": "2024-01-01"
  },
  "sortBy": "date|impact|complexity"
}
```

#### `POST /api/v1/time-machine/replay/{exploitId}`

Replay historical exploit

```json
{
  "exploitId": "euler_finance_2023",
  "forkBlock": 16817996,
  "customParams": {
    "flashLoanAmount": "30000000",
    "targetPool": "0x..."
  }
}
```

---

## Real-time Monitoring

### System Status

#### `GET /api/v1/system/status`

Get overall system health

```json
{
  "status": "online|degraded|offline",
  "uptime": 99.97,
  "services": {
    "scanner": "online",
    "honeypot": "online",
    "mev": "maintenance",
    "database": "online"
  },
  "metrics": {...}
}
```

#### `GET /api/v1/system/metrics/realtime`

Real-time system metrics

```json
{
  "timestamp": "2024-01-15T14:45:00Z",
  "threatsDetected": 127,
  "contractsScanned": 1456,
  "activeConnections": 234,
  "responseTime": 45.6
}
```

### Auto-Scan Management

#### `POST /api/v1/monitoring/auto-scan`

Configure auto-scanning

```json
{
  "targets": [
    {
      "type": "contract",
      "address": "0x...",
      "interval": 300,
      "triggers": ["code-change", "high-volume", "price-impact"]
    }
  ],
  "globalSettings": {
    "enabled": true,
    "maxConcurrent": 10,
    "priorityQueue": true
  }
}
```

#### `GET /api/v1/monitoring/auto-scan/status`

Get auto-scan status

```json
{
  "enabled": true,
  "activeScans": 5,
  "queueLength": 12,
  "lastScan": "2024-01-15T14:40:00Z",
  "totalScans": 1247
}
```

---

## Analytics & Metrics APIs

### Dashboard Data

#### `GET /api/v1/analytics/dashboard`

Main dashboard analytics

```json
{
  "timeRange": "1h|24h|7d|30d",
  "metrics": {
    "threats": {...},
    "vulnerabilities": {...},
    "mev": {...},
    "performance": {...}
  },
  "charts": [...],
  "alerts": [...]
}
```

#### `GET /api/v1/analytics/charts/{chartType}`

Specific chart data

```json
{
  "chartType": "threat-trends|vulnerability-severity|mev-profits|scan-volume",
  "timeRange": "7d",
  "granularity": "hour|day|week",
  "filters": {...}
}
```

### Advanced Analytics

#### `POST /api/v1/analytics/custom-query`

Custom analytics query

```json
{
  "query": {
    "metrics": ["scan_count", "threat_level"],
    "dimensions": ["time", "contract_type"],
    "filters": {...},
    "aggregation": "sum|avg|max|min"
  },
  "visualization": "line|bar|pie|heatmap"
}
```

#### `GET /api/v1/analytics/reports/generate`

Generate comprehensive report

```json
{
  "type": "security|compliance|performance",
  "timeRange": "30d",
  "format": "pdf|csv|json",
  "includeCharts": true,
  "customSections": [...]
}
```

---

## User Management APIs

### Profile Management

#### `GET /api/v1/user/profile`

Get user profile

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "nickname": "Agent",
  "avatar": "https://...",
  "subscription": {...},
  "preferences": {...}
}
```

#### `PUT /api/v1/user/profile`

Update user profile

```json
{
  "nickname": "CyberAgent",
  "avatar": "data:image/...",
  "preferences": {
    "theme": "dark|light|auto",
    "notifications": {...},
    "dashboard": {...}
  }
}
```

### Settings Management

#### `GET /api/v1/settings/system`

Get system configuration

```json
{
  "profile": {...},
  "apis": {...},
  "security": {...},
  "integrations": {...}
}
```

#### `PUT /api/v1/settings/system`

Update system settings

```json
{
  "category": "ai_apis|rpc_urls|security",
  "key": "openai_api_key",
  "value": "sk-...",
  "encrypted": true
}
```

#### `POST /api/v1/settings/modules/{module}/test`

Test module configuration

```json
{
  "module": "openai|anthropic|ethereum_rpc",
  "config": {...}
}
```

---

## WebSocket Connections

### Real-time Data Streams

#### `ws://api.scorpius.dev/ws/realtime`

Real-time monitoring connection

```json
{
  "subscribe": [
    "threats",
    "scans",
    "mev-opportunities",
    "system-alerts"
  ],
  "filters": {...}
}
```

### Event Types

- `threat-detected` - New security threat identified
- `scan-completed` - Vulnerability scan finished
- `mev-opportunity` - New MEV opportunity found
- `honeypot-detected` - Honeypot analysis completed
- `system-alert` - System status change
- `user-notification` - User-specific notifications

#### `ws://api.scorpius.dev/ws/mempool`

Mempool monitoring

```json
{
  "chains": ["ethereum", "bsc"],
  "filters": {
    "minValue": "1.0",
    "types": ["swap", "approval"],
    "addresses": ["0x..."]
  }
}
```

#### `ws://api.scorpius.dev/ws/scanner`

Live scanning updates

```json
{
  "analysisId": "scan_123",
  "includeProgress": true,
  "includeIntermediate": false
}
```

---

## SDK Endpoints

### JavaScript/TypeScript SDK

#### `GET /api/v1/sdk/js/latest`

Get latest JavaScript SDK

```json
{
  "version": "2.1.0",
  "downloadUrl": "https://cdn.scorpius.dev/sdk/js/2.1.0/scorpius-sdk.min.js",
  "integrity": "sha384-...",
  "documentation": "https://docs.scorpius.dev/sdk/js"
}
```

### Python SDK

#### `GET /api/v1/sdk/python/latest`

Get latest Python SDK

```json
{
  "version": "2.1.0",
  "installCommand": "pip install scorpius-sdk==2.1.0",
  "documentation": "https://docs.scorpius.dev/sdk/python"
}
```

### SDK Authentication

#### `POST /api/v1/sdk/auth/api-key`

Generate SDK API key

```json
{
  "name": "Production Scanner",
  "permissions": ["scan", "analyze", "monitor"],
  "expiresIn": "never|30d|90d|1y"
}
```

---

## Plugin System APIs

### Plugin Management

#### `GET /api/v1/plugins`

List available plugins

```json
{
  "plugins": [
    {
      "id": "slither-enhanced",
      "name": "Slither Enhanced",
      "version": "1.2.0",
      "category": "static-analysis",
      "status": "active|disabled|error"
    }
  ]
}
```

#### `POST /api/v1/plugins/{pluginId}/install`

Install plugin

```json
{
  "version": "latest|1.2.0",
  "config": {...}
}
```

#### `PUT /api/v1/plugins/{pluginId}/config`

Update plugin configuration

```json
{
  "settings": {
    "timeout": 300,
    "maxMemory": "2GB",
    "customRules": [...]
  }
}
```

### Custom Plugins

#### `POST /api/v1/plugins/custom/upload`

Upload custom plugin

```json
{
  "name": "Custom Scanner",
  "description": "Enterprise-specific rules",
  "file": "base64-encoded-plugin",
  "metadata": {...}
}
```

---

## System Management APIs

### Logging & Audit Trail

#### `GET /api/v1/system/logs`

Get system logs

```json
{
  "level": "debug|info|warn|error",
  "service": "scanner|honeypot|mev|api",
  "timeRange": {
    "start": "2024-01-15T00:00:00Z",
    "end": "2024-01-15T23:59:59Z"
  },
  "search": "error message",
  "limit": 100
}
```

#### `GET /api/v1/system/audit`

Get audit trail

```json
{
  "userId": "user_123",
  "action": "login|scan|configure|delete",
  "resource": "contract|user|setting",
  "timeRange": {...}
}
```

### Performance Monitoring

#### `GET /api/v1/system/performance`

Get performance metrics

```json
{
  "metrics": [
    "cpu_usage",
    "memory_usage",
    "disk_io",
    "network_io",
    "queue_length",
    "response_time"
  ],
  "timeRange": "1h|24h|7d",
  "granularity": "minute|hour"
}
```

### Database Management

#### `GET /api/v1/system/database/stats`

Database statistics

```json
{
  "size": "15.2GB",
  "collections": {
    "vulnerabilities": 125000,
    "honeypots": 45000,
    "transactions": 2500000
  },
  "performance": {...}
}
```

#### `POST /api/v1/system/database/backup`

Create database backup

```json
{
  "type": "full|incremental",
  "compression": true,
  "encryption": true,
  "destination": "s3|local|gcs"
}
```

---

## Rate Limiting & Usage

### API Rate Limits

- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1,000 requests/hour
- **Enterprise**: 10,000 requests/hour
- **Custom**: Unlimited with SLA

### Usage Tracking

#### `GET /api/v1/usage/current`

Current usage statistics

```json
{
  "period": "current_hour|current_day|current_month",
  "requests": 245,
  "limit": 1000,
  "remaining": 755,
  "resetTime": "2024-01-15T15:00:00Z"
}
```

---

## Error Codes & Responses

### Standard HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error
- `503` - Service Unavailable

### Custom Error Codes

```json
{
  "error": {
    "code": "SCAN_TIMEOUT",
    "message": "Analysis timeout after 300 seconds",
    "details": {
      "analysisId": "scan_123",
      "timeoutAt": 300,
      "partialResults": true
    }
  }
}
```

---

## Environment Variables

### Required Configuration

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/scorpius
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-jwt-secret
API_ENCRYPTION_KEY=your-encryption-key

# External APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=ant-...
ETHERSCAN_API_KEY=your-etherscan-key

# Blockchain RPCs
ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/...
BSC_RPC_URL=https://bsc-dataseed.binance.org/
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/...

# Monitoring
GRAFANA_URL=http://localhost:3001
PROMETHEUS_URL=http://localhost:9090

# Plugins
SLITHER_PATH=/usr/local/bin/slither
MYTHRIL_PATH=/usr/local/bin/myth
MANTICORE_PATH=/usr/local/bin/manticore
```

This comprehensive API specification covers all the endpoints, WebSocket connections, and integrations needed for the SCORPIUS Security Platform, including all security analysis tools, real-time monitoring, user management, and system administration features.
