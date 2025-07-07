"""
Integration Documentation: Quantum Scanner + Scorpius Microservices

This document provides comprehensive guidance for integrating the Quantum Scanner
AI threat predictor with the Scorpius microservices scanner.
"""

# Quantum Scanner + Scorpius Integration Guide

## Overview

This integration enables the Scorpius microservices scanner to leverage the advanced AI threat prediction and anomaly detection capabilities of the Quantum Scanner platform. The integration is designed to be:

- **Non-intrusive**: Minimal changes required to existing Scorpius code
- **High-performance**: Async communication with connection pooling
- **Fault-tolerant**: Graceful degradation when services are unavailable
- **Scalable**: Support for high-volume scan operations

## Architecture

```
┌─────────────────┐    HTTP/REST    ┌──────────────────┐
│                 │    (async)      │                  │
│   Scorpius      │◄───────────────►│  Quantum Scanner │
│   Orchestrator  │                 │  AI Service      │
│                 │                 │                  │
└─────────────────┘                 └──────────────────┘
         │                                   │
         │                                   │
    ┌────▼────┐                         ┌────▼────┐
    │ Redis   │                         │ Redis   │
    │ Cache   │                         │ Cache   │
    └─────────┘                         └─────────┘
         │                                   │
         │                                   │
    ┌────▼────┐                         ┌────▼────┐
    │PostgreSQL│                         │PostgreSQL│
    │Database │                         │ Database │
    └─────────┘                         └─────────┘
```

## Quick Start

### 1. Deploy with Docker Compose

```bash
# From the quantum scanner directory
docker-compose up -d

# Verify services are running
curl http://localhost/quantum/health
curl http://localhost/scorpius/health
```

### 2. Install Integration Client

Copy the `integration/scorpius_client.py` file to your Scorpius project and install dependencies:

```bash
pip install aiohttp asyncio-timeout
```

### 3. Basic Integration Example

```python
from integration.scorpius_client import integrate_with_scorpius

# Your existing Scorpius scan results
scorpius_results = [
    {
        "asset_id": "web-app-001",
        "asset_type": "web_application",
        "vulnerabilities": [
            {"type": "weak_crypto", "severity": "high", "algorithm": "RSA-1024"}
        ],
        "quantum_risk_score": 0.85,
        "timestamp": "2024-01-15T10:30:00Z"
    }
]

# Get enhanced analysis with AI predictions
enhanced_results = await integrate_with_scorpius(scorpius_results)

print(f"Overall Risk: {enhanced_results['enhanced_risk_assessment']['overall_risk']}")
print(f"Risk Level: {enhanced_results['enhanced_risk_assessment']['risk_level']}")
```

## API Endpoints

### Quantum Scanner AI Endpoints

All endpoints are available at `http://quantum-scanner:8000/ai-threat-predictor/`

#### POST /predict
Predict threats based on scan results.

**Request:**
```json
{
  "scan_results": [
    {
      "asset_id": "string",
      "asset_type": "string",
      "vulnerabilities": [...],
      "quantum_risk_score": 0.85,
      "timestamp": "2024-01-15T10:30:00Z",
      "metadata": {}
    }
  ]
}
```

**Response:**
```json
{
  "predictions": [
    {
      "threat_score": 0.92,
      "threat_types": ["quantum_attack", "crypto_weakness"],
      "confidence": 0.88,
      "mitigation_steps": ["Upgrade to PQC", "Implement hybrid crypto"],
      "predicted_at": "2024-01-15T10:30:05Z"
    }
  ]
}
```

#### POST /detect-anomalies
Detect anomalies in scan patterns.

**Request:** Same as `/predict`

**Response:**
```json
{
  "anomalies": [
    {
      "is_anomaly": true,
      "anomaly_score": 0.75,
      "anomaly_types": ["unusual_vulnerability_pattern"],
      "confidence": 0.82,
      "detected_at": "2024-01-15T10:30:05Z"
    }
  ]
}
```

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

#### GET /model-info
Get AI model information.

**Response:**
```json
{
  "threat_predictor": {
    "version": "1.0.0",
    "accuracy": 0.94,
    "last_trained": "2024-01-10T00:00:00Z"
  },
  "anomaly_detector": {
    "version": "1.0.0",
    "accuracy": 0.91,
    "last_trained": "2024-01-10T00:00:00Z"
  }
}
```

## Integration Patterns

### 1. Simple Integration

For basic threat prediction on existing scan results:

```python
from integration.scorpius_client import QuantumScannerClient

async with QuantumScannerClient() as client:
    predictions = await client.predict_threats(scan_results)
    anomalies = await client.detect_anomalies(scan_results)
```

### 2. Enhanced Analysis Bridge

For comprehensive analysis combining both scanners:

```python
from integration.scorpius_client import ScorpiusQuantumBridge, QuantumScannerClient

async with QuantumScannerClient() as client:
    bridge = ScorpiusQuantumBridge(client)
    enhanced_results = await bridge.enhanced_scan_analysis(scorpius_results)
```

### 3. Batch Processing

For high-volume scanning operations:

```python
async def process_batch(batch_results):
    async with QuantumScannerClient() as client:
        # Process in chunks to avoid overwhelming the service
        chunk_size = 100
        all_predictions = []
        
        for i in range(0, len(batch_results), chunk_size):
            chunk = batch_results[i:i + chunk_size]
            predictions = await client.predict_threats(chunk)
            all_predictions.extend(predictions)
            
        return all_predictions
```

## Configuration

### Environment Variables

#### Quantum Scanner Service

```bash
# Core configuration
REDIS_URL=redis://redis:6379
DATABASE_URL=postgresql://quantum:quantum123@postgres:5432/quantum_scanner
LOG_LEVEL=INFO

# AI model configuration
AI_MODEL_PATH=/app/models
QUANTUM_THRESHOLD=0.7
CBOM_DEEP_SCAN=true

# Performance tuning
ASYNC_WORKERS=4
CACHE_TTL=3600
MAX_CONCURRENT_SCANS=50
```

#### Scorpius Integration

```bash
# Quantum Scanner connection
QUANTUM_SCANNER_URL=http://quantum-scanner:8000
QUANTUM_TIMEOUT=30
QUANTUM_MAX_RETRIES=3

# Enhanced analysis settings
ENABLE_AI_PREDICTION=true
ENABLE_ANOMALY_DETECTION=true
RISK_CALCULATION_WEIGHTS=0.4,0.4,0.2  # quantum,ai,anomaly
```

## Error Handling

The integration client provides robust error handling:

### Connection Errors
```python
try:
    async with QuantumScannerClient() as client:
        result = await client.predict_threats(scan_results)
except aiohttp.ClientError as e:
    logger.error(f"Connection failed: {e}")
    # Fallback to Scorpius-only analysis
    return scorpius_only_analysis(scan_results)
```

### Service Unavailable
```python
async with QuantumScannerClient() as client:
    if not await client.health_check():
        logger.warning("Quantum Scanner unavailable, using fallback")
        return fallback_analysis(scan_results)
```

### Timeout Handling
```python
# Configure timeouts
client = QuantumScannerClient(timeout=60)  # 60 second timeout
```

## Performance Optimization

### 1. Connection Pooling

The client uses aiohttp session pooling automatically:

```python
# Reuse client across multiple requests
async with QuantumScannerClient() as client:
    for batch in scan_batches:
        await client.predict_threats(batch)
```

### 2. Caching

Both services use Redis for caching:

- **Quantum Scanner**: Caches model predictions and analysis results
- **Scorpius**: Can cache enhanced analysis results

### 3. Async Processing

All integration methods are fully async:

```python
# Process multiple operations concurrently
predictions_task = client.predict_threats(results)
anomalies_task = client.detect_anomalies(results)

predictions, anomalies = await asyncio.gather(
    predictions_task, anomalies_task
)
```

## Monitoring and Observability

### Metrics

Both services expose Prometheus metrics:

- **Request latency**: How long API calls take
- **Error rates**: Failed requests and retries
- **Prediction accuracy**: ML model performance
- **Cache hit rates**: Caching effectiveness

### Logging

Structured logging with correlation IDs:

```python
logger.info(
    "AI prediction completed",
    correlation_id=request_id,
    asset_count=len(scan_results),
    prediction_time=elapsed_time,
    threat_score=avg_threat_score
)
```

### Health Checks

Regular health checks ensure service availability:

```bash
# Check individual services
curl http://localhost/quantum/health
curl http://localhost/scorpius/health

# Check integration endpoints
curl http://localhost/quantum/ai-threat-predictor/health
```

## Security Considerations

### 1. Network Security

- All services run in isolated Docker network
- Nginx provides reverse proxy with rate limiting
- TLS termination at proxy level

### 2. Authentication

For production deployments, implement:

```python
# Add authentication headers
headers = {"Authorization": f"Bearer {api_token}"}
async with QuantumScannerClient(headers=headers) as client:
    # Make authenticated requests
    pass
```

### 3. Data Protection

- Sensitive scan data is encrypted in transit
- Database encryption at rest
- Audit logging for all API calls

## Deployment Guide

### Prerequisites

1. Docker and Docker Compose installed
2. At least 8GB RAM and 4 CPU cores
3. 20GB disk space for containers and data

### Step-by-Step Deployment

1. **Clone and prepare directories:**
```bash
cd "C:\Users\ADMIN\Desktop\quantum scanner"

# Create required directories
mkdir -p logs models data
mkdir -p nginx/ssl
```

2. **Configure environment:**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration
notepad .env
```

3. **Deploy services:**
```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f quantum-scanner
docker-compose logs -f scorpius-orchestrator
```

4. **Verify integration:**
```bash
# Test Quantum Scanner
curl http://localhost/quantum/health

# Test integration endpoint
curl -X POST http://localhost/quantum/ai-threat-predictor/predict \
  -H "Content-Type: application/json" \
  -d '{"scan_results": []}'
```

### Scaling Considerations

For high-volume deployments:

1. **Horizontal scaling:**
```yaml
# In docker-compose.yml
quantum-scanner:
  deploy:
    replicas: 3
```

2. **Resource limits:**
```yaml
quantum-scanner:
  deploy:
    resources:
      limits:
        memory: 2G
        cpus: '1.0'
```

3. **Load balancing:**
```nginx
upstream quantum_scanner {
    server quantum-scanner-1:8000;
    server quantum-scanner-2:8000;
    server quantum-scanner-3:8000;
}
```

## Troubleshooting

### Common Issues

#### 1. Service Connection Refused
```
Error: Connection refused to quantum-scanner:8000
```

**Solution:**
```bash
# Check service status
docker-compose ps quantum-scanner

# Check logs
docker-compose logs quantum-scanner

# Restart service
docker-compose restart quantum-scanner
```

#### 2. High Memory Usage
```
Warning: quantum-scanner using 90% memory
```

**Solution:**
```bash
# Check resource usage
docker stats

# Increase memory limits in docker-compose.yml
# Or reduce ASYNC_WORKERS environment variable
```

#### 3. Slow Response Times
```
Warning: AI prediction taking >30 seconds
```

**Solution:**
```bash
# Check Redis cache
docker-compose exec redis redis-cli ping

# Monitor database performance
docker-compose exec postgres pg_top

# Consider scaling workers or optimizing queries
```

### Debug Mode

Enable debug logging:

```bash
# Set environment variable
LOG_LEVEL=DEBUG

# Restart services
docker-compose restart
```

## Advanced Features

### 1. Model Retraining

Retrain AI models with new data:

```python
async with QuantumScannerClient() as client:
    training_result = await client.train_model(
        training_data=new_scan_results,
        model_type="threat_predictor"
    )
    print(f"Training completed: {training_result}")
```

### 2. Custom Risk Calculations

Override default risk calculations:

```python
class CustomQuantumBridge(ScorpiusQuantumBridge):
    def _calculate_enhanced_risk(self, scan_results, predictions, anomalies):
        # Custom risk calculation logic
        return custom_risk_assessment
```

### 3. Webhook Integration

Set up webhooks for real-time notifications:

```python
# In Scorpius service
@app.post("/webhooks/quantum-analysis")
async def handle_quantum_results(results: dict):
    # Process real-time AI analysis results
    await notify_security_team(results)
```

## API Reference

### Complete Client Methods

```python
class QuantumScannerClient:
    async def predict_threats(self, scan_results: List[ScanResult]) -> List[ThreatPrediction]
    async def detect_anomalies(self, scan_results: List[ScanResult]) -> List[AnomalyDetection]
    async def get_model_info(self) -> Dict[str, Any]
    async def health_check(self) -> bool
    async def train_model(self, training_data: List[ScanResult], model_type: str) -> Dict[str, Any]
```

### Data Models

```python
@dataclass
class ScanResult:
    asset_id: str
    asset_type: str
    vulnerabilities: List[Dict[str, Any]]
    quantum_risk_score: float
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class ThreatPrediction:
    threat_score: float
    threat_types: List[str]
    confidence: float
    mitigation_steps: List[str]
    predicted_at: datetime

@dataclass
class AnomalyDetection:
    is_anomaly: bool
    anomaly_score: float
    anomaly_types: List[str]
    confidence: float
    detected_at: datetime
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Model Updates**: Retrain AI models monthly with new threat data
2. **Cache Cleanup**: Clear old cache entries weekly
3. **Log Rotation**: Archive logs older than 30 days
4. **Database Optimization**: Run VACUUM and ANALYZE weekly
5. **Security Updates**: Update container images monthly

### Monitoring Checklist

- [ ] All services responding to health checks
- [ ] API response times < 1 second (95th percentile)
- [ ] Error rate < 1%
- [ ] Cache hit rate > 80%
- [ ] Database connections < 80% of limit
- [ ] Memory usage < 80%
- [ ] Disk space usage < 70%

### Getting Help

1. **Check logs**: Start with service logs for errors
2. **Monitor metrics**: Review Grafana dashboards
3. **Test endpoints**: Verify API endpoints manually
4. **Check resources**: Ensure adequate CPU/memory/disk
5. **Review configuration**: Validate environment variables

This integration provides a robust, scalable solution for enhancing Scorpius vulnerability scanning with advanced AI threat prediction capabilities from the Quantum Scanner platform.
