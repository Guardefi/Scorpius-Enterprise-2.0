# Python Backend Integration Guide

This document provides comprehensive instructions for integrating SCORPIUS with a Python backend.

## Overview

SCORPIUS now supports multiple backend modes:

- **Express** (development): Current Node.js/Express server
- **Python** (production): FastAPI/Flask Python backend
- **Mock** (testing): Simulated responses for UI development

## Backend Configuration

### Environment Variables

Set these environment variables to configure the Python backend:

```bash
# Backend Mode
VITE_BACKEND_MODE=python                    # or 'express', 'mock'

# Python Backend URLs
VITE_PYTHON_API_URL=http://localhost:8000   # Python API base URL
VITE_PYTHON_WS_URL=ws://localhost:8000      # Python WebSocket URL

# Authentication (optional)
VITE_PYTHON_API_TOKEN=your_api_token_here   # Bearer token for auth
```

### Electron Configuration

For Electron apps, the backend is automatically configured to use Python mode with these defaults:

- API URL: `http://localhost:8000`
- WebSocket URL: `ws://localhost:8000`
- Auto-detection of Python backend health

## Python Backend Requirements

Your Python backend should implement the following API endpoints:

### Health & Status

```
GET  /api/health           # Health check
GET  /api/status           # Detailed status
```

### Scanner API

```
POST /api/v1/scanner/scan           # Start contract scan
GET  /api/v1/scanner/results/{id}   # Get scan results
GET  /api/v1/scanner/history        # Get scan history
POST /api/v1/scanner/cancel/{id}    # Cancel scan (optional)
```

### Honeypot API

```
POST /api/v1/honeypot/analyze         # Start honeypot analysis
GET  /api/v1/honeypot/results         # Get all results
GET  /api/v1/honeypot/analysis/{id}   # Get specific analysis
```

### Time Machine API

```
POST /api/v1/time-machine/query    # Execute historical query
GET  /api/v1/time-machine/history  # Get query history
```

### Exploit Replay API

```
GET  /api/v1/exploits/list              # List available exploits
POST /api/v1/exploits/replay/start      # Start replay
POST /api/v1/exploits/replay/control    # Control replay (pause/resume/stop)
GET  /api/v1/exploits/replay/status     # Get replay status
```

### Forensics API

```
POST /api/v1/forensics/analyze    # Start forensics analysis
GET  /api/v1/forensics/results    # Get analysis results
```

### Mempool API

```
GET  /api/v1/mempool/current       # Get current mempool data
POST /api/v1/mempool/analyze       # Analyze mempool transactions
POST /api/v1/mempool/subscribe     # Subscribe to mempool updates
```

### Quantum API

```
POST /api/v1/quantum/analyze       # Analyze quantum resistance
```

### Bridge & MEV APIs (Python only)

```
POST /api/v1/bridge/analyze           # Analyze bridge transactions
GET  /api/v1/bridge/opportunities     # Get bridge opportunities
GET  /api/v1/mev/opportunities        # Get MEV opportunities
POST /api/v1/mev/analyze              # Analyze MEV strategies
GET  /api/v1/mev/strategies           # Get MEV strategies
```

### WebSocket API

```
WS   /api/v1/ws              # Main WebSocket endpoint
POST /api/v1/ws/auth         # WebSocket authentication (optional)
```

## Response Format

All API responses should follow this format:

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      /* optional error details */
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## WebSocket Protocol

### Connection

```javascript
// Client connects to ws://localhost:8000/api/v1/ws
```

### Authentication (if required)

```json
{
  "type": "authenticate",
  "service": "auth",
  "data": { "token": "your_bearer_token" },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

Response:

```json
{
  "type": "auth_success",
  "service": "auth",
  "data": { "authenticated": true },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Service Subscription

```json
{
  "type": "subscribe",
  "service": "scanner|honeypot|mempool|forensics",
  "data": { "action": "subscribe" },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Heartbeat

The client sends periodic heartbeats:

```json
{
  "type": "heartbeat",
  "service": "system",
  "data": { "timestamp": "2024-01-01T00:00:00Z" },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

Expected response:

```json
{
  "type": "heartbeat_response",
  "service": "system",
  "data": { "timestamp": "2024-01-01T00:00:00Z" },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## FastAPI Example

Here's a minimal FastAPI implementation:

```python
from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import asyncio
import json
from datetime import datetime

app = FastAPI(title="SCORPIUS Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[dict] = None
    timestamp: str

@app.get("/api/health")
async def health_check():
    return ApiResponse(
        success=True,
        data={"status": "healthy", "mode": "python"},
        timestamp=datetime.utcnow().isoformat()
    )

@app.post("/api/v1/scanner/scan")
async def start_scan(request: dict):
    # Implement your scanning logic here
    scan_id = f"scan_{int(datetime.now().timestamp())}"

    return ApiResponse(
        success=True,
        data={
            "scanId": scan_id,
            "status": "scanning",
            "progress": 0,
            "vulnerabilities": [],
            "securityScore": 0,
            "gasOptimization": 0,
            "timestamp": datetime.utcnow().isoformat(),
            "plugins": request.get("plugins", []),
            "currentPlugin": request.get("plugins", [None])[0] if request.get("plugins") else None
        },
        timestamp=datetime.utcnow().isoformat()
    )

# WebSocket connections
active_connections = set()

@app.websocket("/api/v1/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)

    # Send welcome message
    await websocket.send_text(json.dumps({
        "type": "connection_established",
        "service": "system",
        "data": {
            "message": "Connected to Python WebSocket server",
            "serverMode": "python"
        },
        "timestamp": datetime.utcnow().isoformat()
    }))

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            # Handle different message types
            if message["type"] == "heartbeat":
                await websocket.send_text(json.dumps({
                    "type": "heartbeat_response",
                    "service": "system",
                    "data": {"timestamp": datetime.utcnow().isoformat()},
                    "timestamp": datetime.utcnow().isoformat()
                }))
            elif message["type"] == "subscribe":
                # Handle subscription
                await websocket.send_text(json.dumps({
                    "type": "subscription_confirmed",
                    "service": message["service"],
                    "data": {"service": message["service"], "subscribed": True},
                    "timestamp": datetime.utcnow().isoformat()
                }))

    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        active_connections.remove(websocket)

# Broadcast function for sending updates
async def broadcast_message(message: dict):
    if active_connections:
        message_str = json.dumps(message)
        await asyncio.gather(
            *[ws.send_text(message_str) for ws in active_connections],
            return_exceptions=True
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Flask Example

For Flask with SocketIO:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
CORS(app, origins=["http://localhost:8080", "http://localhost:3000"])
socketio = SocketIO(app, cors_allowed_origins="*")

def api_response(success=True, data=None, error=None):
    return {
        "success": success,
        "data": data,
        "error": error,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.route('/api/health')
def health_check():
    return jsonify(api_response(
        data={"status": "healthy", "mode": "python"}
    ))

@app.route('/api/v1/scanner/scan', methods=['POST'])
def start_scan():
    data = request.get_json()
    scan_id = f"scan_{int(datetime.now().timestamp())}"

    return jsonify(api_response(data={
        "scanId": scan_id,
        "status": "scanning",
        "progress": 0,
        "vulnerabilities": [],
        "securityScore": 0,
        "gasOptimization": 0,
        "timestamp": datetime.utcnow().isoformat(),
        "plugins": data.get("plugins", [])
    }))

@socketio.on('connect')
def handle_connect():
    emit('connection_established', {
        "type": "connection_established",
        "service": "system",
        "data": {
            "message": "Connected to Python WebSocket server",
            "serverMode": "python"
        },
        "timestamp": datetime.utcnow().isoformat()
    })

@socketio.on('message')
def handle_message(data):
    if data.get('type') == 'heartbeat':
        emit('heartbeat_response', {
            "type": "heartbeat_response",
            "service": "system",
            "data": {"timestamp": datetime.utcnow().isoformat()},
            "timestamp": datetime.utcnow().isoformat()
        })

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)
```

## Testing

### Test Backend Connectivity

```bash
# Test health endpoint
curl http://localhost:8000/api/health

# Test scanner endpoint
curl -X POST http://localhost:8000/api/v1/scanner/scan \
  -H "Content-Type: application/json" \
  -d '{"contractAddress": "0x123...", "plugins": ["slither"]}'
```

### Test WebSocket

```javascript
const ws = new WebSocket("ws://localhost:8000/api/v1/ws");
ws.onopen = () => {
  ws.send(
    JSON.stringify({
      type: "heartbeat",
      service: "system",
      data: {},
      timestamp: new Date().toISOString(),
    }),
  );
};
```

## Production Deployment

### Docker Compose Example

```yaml
version: "3.8"
services:
  python-backend:
    build: ./python-backend
    ports:
      - "8000:8000"
    environment:
      - PYTHONPATH=/app
      - ENV=production
    volumes:
      - ./logs:/app/logs

  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_BACKEND_MODE=python
      - VITE_PYTHON_API_URL=http://python-backend:8000
      - VITE_PYTHON_WS_URL=ws://python-backend:8000
    depends_on:
      - python-backend
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure Python backend is running on port 8000
2. **CORS Errors**: Check CORS configuration in Python backend
3. **WebSocket Connection Failed**: Verify WebSocket endpoint and protocols
4. **Authentication Errors**: Check API token configuration

### Debug Mode

Set `VITE_BACKEND_MODE=mock` to use mock responses for UI development without a backend.

### Health Monitoring

The frontend automatically monitors backend health and displays connection status. Check the browser console for connection logs.
