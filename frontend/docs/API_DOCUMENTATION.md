# SCORPIUS API Documentation

## Overview

SCORPIUS provides a comprehensive security platform with WebSocket real-time updates, REST APIs, and SDK access for all major security tools and features.

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://api.scorpius.security`

## Authentication

All API endpoints require authentication via Bearer token:

```bash
Authorization: Bearer <your-api-key>
```

## WebSocket Connection

Connect to real-time data streams:

```javascript
const ws = new WebSocket("ws://localhost:3000/api/ws");
```

### WebSocket Message Format

```typescript
{
  type: string;
  service: string;
  data: any;
  timestamp: string;
  id?: string;
}
```

### Subscribe to Services

```json
{
  "type": "subscribe",
  "service": "scanner",
  "data": { "action": "subscribe" },
  "timestamp": "2024-01-15T12:00:00Z"
}
```

Available services: `scanner`, `bytecode`, `simulation`, `events`, `bridge`

## REST API Endpoints

### Health Check

```http
GET /api/health
```

Returns system health status and available services.

### Scanner API

#### Start Security Scan

```http
POST /api/scanner/scan
Content-Type: application/json

{
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "scanTypes": ["slither", "mythril", "ai-enhanced"],
  "priority": "high"
}
```

Response:

```json
{
  "scanId": "scan_1234567890_abc123",
  "status": "pending",
  "message": "Scan queued successfully"
}
```

#### Get Scan Status

```http
GET /api/scanner/scan/{scanId}
```

#### Get All Scans

```http
GET /api/scanner/scans?page=1&limit=10&status=completed
```

#### Get Scanner Statistics

```http
GET /api/scanner/stats
```

#### Delete Scan

```http
DELETE /api/scanner/scan/{scanId}
```

### Bytecode Lab API

#### Start Bytecode Analysis

```http
POST /api/bytecode/analyze
Content-Type: application/json

{
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "blockNumber": "latest",
  "includeControlFlow": true,
  "includeDecompilation": true
}
```

#### Get Analysis Results

```http
GET /api/bytecode/analysis/{analysisId}
```

#### Get Control Flow Graph

```http
GET /api/bytecode/analysis/{analysisId}/control-flow
```

#### Get Decompiled Code

```http
GET /api/bytecode/analysis/{analysisId}/decompiled
```

#### Get Bytecode Statistics

```http
GET /api/bytecode/stats
```

### Simulation Engine API

#### Queue Simulation

```http
POST /api/simulation/queue
Content-Type: application/json

{
  "contractAddress": "0x1234567890123456789012345678901234567890",
  "exploitType": ["flash-loan", "reentrancy"],
  "blockNumber": "latest",
  "priority": "high",
  "parameters": {
    "loanAmount": "1000000000000000000000",
    "targetContract": "0x..."
  }
}
```

#### Get Simulation Status

```http
GET /api/simulation/{simulationId}
```

#### Get Queue Status

```http
GET /api/simulation-queue
```

#### Pause Simulation

```http
POST /api/simulation/{simulationId}/pause
```

#### Cancel Simulation

```http
POST /api/simulation/{simulationId}/cancel
```

#### Get Simulation Statistics

```http
GET /api/simulation-stats
```

### Event Stream API

#### Server-Sent Events Stream

```http
GET /api/events/stream
Accept: text/event-stream
```

Real-time blockchain events streamed as SSE.

### Bridge Monitor API

#### Get Bridge Transfers

```http
GET /api/bridge/transfers?page=1&limit=10
```

#### Get Bridge Statistics

```http
GET /api/bridge/stats
```

## SDK Usage

### Installation

```bash
npm install @scorpius/security-sdk
```

### Basic Usage

```typescript
import { ScorpiusSDK } from "@scorpius/security-sdk";

const client = new ScorpiusSDK({
  baseUrl: "http://localhost:3000",
  apiKey: "your-api-key",
  timeout: 30000,
  retryAttempts: 3,
});

// Authenticate
await client.authenticate("your-api-key");

// Start a security scan
const scan = await client.startScan({
  contractAddress: "0x1234567890123456789012345678901234567890",
  scanTypes: ["slither", "mythril"],
  priority: "high",
  waitForCompletion: true,
});

console.log("Scan results:", scan);
```

### Real-time Monitoring

```typescript
// Connect to WebSocket
await client.connectWebSocket();

// Subscribe to services
client.subscribeToService("scanner");
client.subscribeToService("bridge");

// Listen for updates
client.on("data_update", (message) => {
  console.log("Real-time update:", message);
});

// Connect to event stream
const eventSource = await client.connectEventStream();
client.on("event", (event) => {
  console.log("Blockchain event:", event);
});
```

### Bytecode Analysis

```typescript
// Start analysis
const analysis = await client.startBytecodeAnalysis({
  contractAddress: "0x1234567890123456789012345678901234567890",
  includeControlFlow: true,
  includeDecompilation: true,
  waitForCompletion: true,
});

// Get control flow graph
const controlFlow = await client.getControlFlowGraph(analysis.analysisId);

// Get decompiled code
const code = await client.getDecompiledCode(analysis.analysisId);
```

### Simulation Engine

```typescript
// Queue simulation
const simulation = await client.queueSimulation({
  contractAddress: "0x1234567890123456789012345678901234567890",
  exploitType: ["flash-loan", "oracle-manip"],
  priority: "critical",
  waitForCompletion: true,
});

// Check queue status
const queueStatus = await client.getQueueStatus();
```

## Error Handling

All API endpoints return standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

Error Response Format:

```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "timestamp": "2024-01-15T12:00:00Z"
}
```

## Rate Limiting

API endpoints are rate limited:

- **Scanner**: 10 requests/minute
- **Bytecode**: 5 requests/minute
- **Simulation**: 3 requests/minute
- **General**: 100 requests/minute

## WebSocket Events

### Connection Events

- `connection_established` - WebSocket connected
- `auth_success` - Authentication successful
- `auth_error` - Authentication failed

### Data Events

- `data_update` - Real-time service data
- `subscription_confirmed` - Subscription active
- `subscription_cancelled` - Subscription cancelled

### System Events

- `heartbeat_response` - Heartbeat acknowledgment
- `error` - System error occurred

## Electron Desktop API

The desktop application provides additional native OS integration:

### Secure Storage

```typescript
// Store encrypted data
await electronAPI.secureStore.set("apiKey", "your-key");

// Retrieve encrypted data
const apiKey = await electronAPI.secureStore.get("apiKey");
```

### System Information

```typescript
const systemInfo = await electronAPI.system.getInfo();
const permissions = await electronAPI.system.checkPermissions();
```

### IPC Events

- `system-resumed` - System wake from sleep
- `lock-application` - Lock app for security
- `open-preferences` - Open settings
- `trigger-security-scan` - Start security scan

## Examples

### Complete Workflow Example

```typescript
import { ScorpiusSDK } from "@scorpius/security-sdk";

async function securityAnalysisWorkflow() {
  const client = new ScorpiusSDK({
    baseUrl: "http://localhost:3000",
    apiKey: process.env.SCORPIUS_API_KEY,
  });

  // 1. Start security scan
  const scan = await client.startScan({
    contractAddress: "0x1234567890123456789012345678901234567890",
    scanTypes: ["slither", "mythril", "ai-enhanced"],
    priority: "high",
  });

  // 2. Start bytecode analysis in parallel
  const analysis = await client.startBytecodeAnalysis({
    contractAddress: "0x1234567890123456789012345678901234567890",
    includeControlFlow: true,
    includeDecompilation: true,
  });

  // 3. Queue simulation if vulnerabilities found
  const scanResult = await client.waitForScanCompletion(scan.scanId);

  if (scanResult.vulnerabilities.length > 0) {
    const simulation = await client.queueSimulation({
      contractAddress: "0x1234567890123456789012345678901234567890",
      exploitType: ["reentrancy", "flash-loan"],
      priority: "critical",
    });

    console.log("Simulation queued:", simulation.simulationId);
  }

  // 4. Monitor real-time events
  await client.connectWebSocket();
  client.subscribeToService("events");

  client.on("data_update", (message) => {
    if (message.service === "events") {
      console.log("New blockchain event:", message.data);
    }
  });

  return {
    scan: scanResult,
    analysis: await client.waitForAnalysisCompletion(analysis.analysisId),
  };
}
```

### Bridge Monitoring Example

```typescript
async function monitorBridges() {
  const client = new ScorpiusSDK({
    baseUrl: "http://localhost:3000",
    apiKey: process.env.SCORPIUS_API_KEY,
  });

  // Get current bridge statistics
  const stats = await client.getBridgeStats();
  console.log("Bridge stats:", stats);

  // Monitor for suspicious transfers
  await client.connectWebSocket();
  client.subscribeToService("bridge");

  client.on("data_update", (message) => {
    if (message.service === "bridge") {
      const suspiciousTransfers = message.data.recentTransfers.filter(
        (transfer) => transfer.isSuspicious,
      );

      if (suspiciousTransfers.length > 0) {
        console.log(
          "🚨 Suspicious bridge transfers detected:",
          suspiciousTransfers,
        );
      }
    }
  });
}
```

## Support

For API support and documentation:

- **Documentation**: https://docs.scorpius.security
- **Issues**: https://github.com/scorpius/security/issues
- **Discord**: https://discord.gg/scorpius-security
- **Email**: api-support@scorpius.security
