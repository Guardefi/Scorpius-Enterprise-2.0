"""
Enterprise-Grade Secure API Gateway for Scorpius Platform
Features: JWT Auth, Rate Limiting, Security Headers, Monitoring, Audit Logging
"""

from fastapi import FastAPI, HTTPException, Request, Depends, status
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import logging
import structlog
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import os
import jwt
import hashlib
import time
import asyncio
from typing import Optional, Dict, Any, List
from collections import defaultdict
from dotenv import load_dotenv
import redis
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
import secrets
from pydantic import BaseModel
import json

load_dotenv()

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)

# Security configuration
JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_urlsafe(32))
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
RATE_LIMIT_WINDOW = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ERROR_COUNT = Counter('http_errors_total', 'Total HTTP errors', ['error_type'])
AUTH_FAILURES = Counter('auth_failures_total', 'Total authentication failures', ['reason'])

# Rate limiting storage
rate_limit_storage = defaultdict(list)
redis_client = None

try:
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = redis.from_url(redis_url, decode_responses=True)
    redis_client.ping()
    logger.info("Redis connection established")
except Exception as e:
    logger.warning("Redis not available, using in-memory rate limiting", error=str(e))

# Pydantic models
class UserInfo(BaseModel):
    user_id: str
    scopes: List[str] = []
    roles: List[str] = []

class AuditLog(BaseModel):
    timestamp: datetime
    user_id: Optional[str]
    action: str
    resource: str
    ip_address: str
    user_agent: str
    status: str

# Security headers middleware
class SecurityHeadersMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    headers = dict(message.get("headers", []))
                    # Add security headers
                    security_headers = {
                        b"x-content-type-options": b"nosniff",
                        b"x-frame-options": b"DENY",
                        b"x-xss-protection": b"1; mode=block",
                        b"strict-transport-security": b"max-age=31536000; includeSubDomains",
                        b"content-security-policy": b"default-src 'self'",
                        b"referrer-policy": b"strict-origin-when-cross-origin",
                        b"permissions-policy": b"geolocation=(), microphone=(), camera=()",
                        b"x-powered-by": b"Scorpius-Enterprise"
                    }
                    for key, value in security_headers.items():
                        headers[key] = value
                    message["headers"] = list(headers.items())
                await send(message)
            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)

# Request logging middleware
class RequestLoggingMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            start_time = time.time()
            
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    duration = time.time() - start_time
                    REQUEST_DURATION.observe(duration)
                    
                    status_code = message.get("status", 0)
                    method = scope.get("method", "")
                    path = scope.get("path", "")
                    
                    REQUEST_COUNT.labels(method=method, endpoint=path, status=status_code).inc()
                    
                    logger.info(
                        "HTTP request completed",
                        method=method,
                        path=path,
                        status_code=status_code,
                        duration=duration,
                        client_ip=scope.get("client", [""])[0]
                    )
                await send(message)
            
            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)

# Authentication
security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[UserInfo]:
    if not credentials:
        return None
    
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            AUTH_FAILURES.labels(reason="invalid_token").inc()
            return None
        
        return UserInfo(
            user_id=user_id,
            scopes=payload.get("scopes", []),
            roles=payload.get("roles", [])
        )
    except jwt.ExpiredSignatureError:
        AUTH_FAILURES.labels(reason="expired_token").inc()
        logger.warning("JWT token expired")
        return None
    except jwt.PyJWTError as e:
        AUTH_FAILURES.labels(reason="invalid_token").inc()
        logger.warning("JWT validation failed", error=str(e))
        return None

# Rate limiting
async def rate_limit_check(request: Request) -> bool:
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    window_start = current_time - RATE_LIMIT_WINDOW
    
    if redis_client:
        try:
            pipe = redis_client.pipeline()
            key = f"rate_limit:{client_ip}"
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zcard(key)
            pipe.zadd(key, {str(current_time): current_time})
            pipe.expire(key, RATE_LIMIT_WINDOW)
            results = pipe.execute()
            request_count = results[1]
            return request_count < RATE_LIMIT_REQUESTS
        except Exception as e:
            logger.error("Redis rate limiting failed", error=str(e))
    
    # Fallback to in-memory rate limiting
    requests = rate_limit_storage[client_ip]
    rate_limit_storage[client_ip] = [req_time for req_time in requests if req_time > window_start]
    
    if len(rate_limit_storage[client_ip]) >= RATE_LIMIT_REQUESTS:
        return False
    
    rate_limit_storage[client_ip].append(current_time)
    return True

# Audit logging
async def log_audit_event(request: Request, user: Optional[UserInfo], action: str, resource: str, status: str):
    audit_log = AuditLog(
        timestamp=datetime.utcnow(),
        user_id=user.user_id if user else None,
        action=action,
        resource=resource,
        ip_address=request.client.host if request.client else "unknown",
        user_agent=request.headers.get("user-agent", "unknown"),
        status=status
    )
    
    logger.info("Audit event", **audit_log.dict())
    
    # Store in Redis for audit trail
    if redis_client:
        try:
            audit_key = f"audit:{datetime.utcnow().strftime('%Y-%m-%d')}"
            redis_client.lpush(audit_key, json.dumps(audit_log.dict(), default=str))
            redis_client.expire(audit_key, 86400 * 30)  # Keep for 30 days
        except Exception as e:
            logger.error("Failed to store audit log", error=str(e))

# Initialize FastAPI app
app = FastAPI(
    title="Scorpius Enterprise API Gateway",
    description="Enterprise-grade API Gateway with advanced security features",
    version="1.4.0",
    docs_url="/docs" if ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if ENVIRONMENT != "production" else None,
    openapi_url="/openapi.json" if ENVIRONMENT != "production" else None
)

# Add middleware in correct order
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=ALLOWED_HOSTS
)

# CORS middleware with secure defaults
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
    expose_headers=["X-RateLimit-Remaining", "X-RateLimit-Reset"]
)

# Service configuration
SERVICES = {
    "auth": {"url": os.getenv("AUTH_SERVICE_URL", "http://localhost:8001"), "health_check": "/health"},
    "scanner": {"url": os.getenv("SCANNER_SERVICE_URL", "http://localhost:8002"), "health_check": "/health"},
    "quantum": {"url": os.getenv("QUANTUM_SERVICE_URL", "http://localhost:8003"), "health_check": "/health"},
    "mev_protection": {"url": os.getenv("MEV_PROTECTION_SERVICE_URL", "http://localhost:8004"), "health_check": "/health"},
    "wallet_guard": {"url": os.getenv("WALLET_GUARD_SERVICE_URL", "http://localhost:8005"), "health_check": "/health"},
    "honeypot": {"url": os.getenv("HONEYPOT_SERVICE_URL", "http://localhost:8006"), "health_check": "/health"},
    "mempool": {"url": os.getenv("MEMPOOL_SERVICE_URL", "http://localhost:8007"), "health_check": "/health"},
    "bytecode": {"url": os.getenv("BYTECODE_SERVICE_URL", "http://localhost:8008"), "health_check": "/health"},
    "simulation": {"url": os.getenv("SIMULATION_SERVICE_URL", "http://localhost:8009"), "health_check": "/health"},
    "reporting": {"url": os.getenv("REPORTING_SERVICE_URL", "http://localhost:8010"), "health_check": "/health"},
    "ai_forensics": {"url": os.getenv("AI_FORENSICS_SERVICE_URL", "http://localhost:8011"), "health_check": "/health"},
    "time_machine": {"url": os.getenv("TIME_MACHINE_SERVICE_URL", "http://localhost:8012"), "health_check": "/health"},
    "exploit_testing": {"url": os.getenv("EXPLOIT_TESTING_SERVICE_URL", "http://localhost:8013"), "health_check": "/health"},
    "bridge": {"url": os.getenv("BRIDGE_SERVICE_URL", "http://localhost:8014"), "health_check": "/health"},
    "mev_bot": {"url": os.getenv("MEV_BOT_SERVICE_URL", "http://localhost:8015"), "health_check": "/health"},
    "quantum_crypto": {"url": os.getenv("QUANTUM_CRYPTO_SERVICE_URL", "http://localhost:8016"), "health_check": "/health"},
    "settings": {"url": os.getenv("SETTINGS_SERVICE_URL", "http://localhost:8017"), "health_check": "/health"},
    "dashboard": {"url": os.getenv("DASHBOARD_SERVICE_URL", "http://localhost:8018"), "health_check": "/health"},
    "monitoring": {"url": os.getenv("MONITORING_SERVICE_URL", "http://localhost:8019"), "health_check": "/health"},
    "integration_hub": {"url": os.getenv("INTEGRATION_HUB_SERVICE_URL", "http://localhost:8020"), "health_check": "/health"}
}

# HTTP client with security
client = httpx.AsyncClient(
    timeout=30.0,
    limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
)

# Enhanced proxy function with security
async def secure_proxy_request(
    service_name: str, 
    path: str, 
    request: Request, 
    method: str = "GET", 
    body: Optional[Dict] = None,
    user: Optional[UserInfo] = None,
    require_auth: bool = False
):
    # Rate limiting check
    if not await rate_limit_check(request):
        await log_audit_event(request, user, f"{method} {path}", service_name, "RATE_LIMITED")
        raise HTTPException(
            status_code=429, 
            detail="Rate limit exceeded",
            headers={"Retry-After": str(RATE_LIMIT_WINDOW)}
        )
    
    # Authentication check
    if require_auth and not user:
        await log_audit_event(request, user, f"{method} {path}", service_name, "UNAUTHORIZED")
        raise HTTPException(status_code=401, detail="Authentication required")
    
    if service_name not in SERVICES:
        await log_audit_event(request, user, f"{method} {path}", service_name, "SERVICE_NOT_FOUND")
        raise HTTPException(status_code=404, detail=f"Service {service_name} not found")
    
    service_url = SERVICES[service_name]["url"]
    full_url = f"{service_url}{path}"
    
    logger.info(f"Proxying {method} {path} to {full_url}", user_id=user.user_id if user else None)
    
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)
    
    # Add user context to headers
    if user:
        headers["X-User-ID"] = user.user_id
        headers["X-User-Scopes"] = ",".join(user.scopes)
        headers["X-User-Roles"] = ",".join(user.roles)
    
    try:
        if method == "GET":
            response = await client.get(full_url, headers=headers, params=dict(request.query_params))
        elif method == "POST":
            response = await client.post(full_url, headers=headers, json=body)
        elif method == "PUT":
            response = await client.put(full_url, headers=headers, json=body)
        elif method == "DELETE":
            response = await client.delete(full_url, headers=headers)
        elif method == "PATCH":
            response = await client.patch(full_url, headers=headers, json=body)
        else:
            raise HTTPException(status_code=405, detail="Method not allowed")
        
        await log_audit_event(request, user, f"{method} {path}", service_name, f"SUCCESS_{response.status_code}")
        logger.info(f"Service response: {response.status_code}")
        
        return JSONResponse(content=response.json(), status_code=response.status_code)
        
    except httpx.TimeoutException:
        await log_audit_event(request, user, f"{method} {path}", service_name, "TIMEOUT")
        ERROR_COUNT.labels(error_type="timeout").inc()
        logger.error(f"Timeout connecting to {service_name}")
        raise HTTPException(status_code=504, detail=f"Timeout connecting to {service_name} service")
    except httpx.RequestError as e:
        await log_audit_event(request, user, f"{method} {path}", service_name, "CONNECTION_ERROR")
        ERROR_COUNT.labels(error_type="connection").inc()
        logger.error(f"Error connecting to {service_name}: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Error connecting to {service_name} service")
    except Exception as e:
        await log_audit_event(request, user, f"{method} {path}", service_name, "INTERNAL_ERROR")
        ERROR_COUNT.labels(error_type="internal").inc()
        logger.error(f"Unexpected error proxying to {service_name}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal error proxying to {service_name} service")

# Root endpoint
@app.get("/")
async def root():
    return {
        "service": "Scorpius Enterprise API Gateway",
        "version": "1.4.0",
        "status": "active",
        "environment": ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat()
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    service_status = {}
    
    for service_name, service_config in SERVICES.items():
        try:
            response = await client.get(f"{service_config['url']}{service_config['health_check']}", timeout=5.0)
            service_status[service_name] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "response_time": response.elapsed.total_seconds() if response.elapsed else 0
            }
        except Exception as e:
            service_status[service_name] = {
                "status": "unavailable",
                "error": str(e)
            }
    
    overall_health = all(s.get("status") == "healthy" for s in service_status.values())
    
    return {
        "status": "healthy" if overall_health else "degraded",
        "services": service_status,
        "timestamp": datetime.utcnow().isoformat()
    }

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Authentication endpoints (public)
@app.post("/api/auth/register")
async def register(request: Request):
    body = await request.json()
    return await secure_proxy_request("auth", "/register", request, "POST", body, require_auth=False)

@app.post("/api/auth/login")
async def login(request: Request):
    body = await request.json()
    return await secure_proxy_request("auth", "/login", request, "POST", body, require_auth=False)

# Protected endpoints - require authentication
@app.post("/api/auth/logout")
async def logout(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("auth", "/logout", request, "POST", user=user, require_auth=True)

@app.get("/api/auth/me")
async def get_current_user_info(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("auth", "/me", request, user=user, require_auth=True)

# Scanner Service Endpoints (protected)
@app.post("/api/scanner/scan")
async def scan_contract(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("scanner", "/scan", request, "POST", body, user, require_auth=True)

@app.get("/api/scanner/scan/{scan_id}")
async def get_scan_result(scan_id: str, request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("scanner", f"/scan/{scan_id}", request, user=user, require_auth=True)

@app.get("/api/scanner/scans")
async def list_scans(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("scanner", "/scans", request, user=user, require_auth=True)

@app.post("/api/scanner/batch")
async def batch_scan(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("scanner", "/batch", request, "POST", body, user, require_auth=True)

@app.get("/api/scanner/vulnerabilities")
async def get_vulnerabilities(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("scanner", "/vulnerabilities", request, user=user, require_auth=True)

# Reporting Service Endpoints - Comprehensive SDK
@app.post("/api/reports/generate")
async def generate_report(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("reporting", "/generate", request, "POST", body, user, require_auth=True)

@app.get("/api/reports/{report_id}")
async def get_report(report_id: str, request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("reporting", f"/{report_id}", request, user=user, require_auth=True)

@app.get("/api/reports")
async def list_reports(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("reporting", "/", request, user=user, require_auth=True)

@app.get("/api/reports/export/{report_id}")
async def export_report(report_id: str, request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("reporting", f"/export/{report_id}", request, user=user, require_auth=True)

@app.post("/api/reports/templates")
async def create_report_template(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("reporting", "/templates", request, "POST", body, user, require_auth=True)

@app.get("/api/reports/templates")
async def list_report_templates(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("reporting", "/templates", request, user=user, require_auth=True)

@app.post("/api/reports/formats/pdf")
async def generate_pdf_report(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("reporting", "/formats/pdf", request, "POST", body, user, require_auth=True)

@app.post("/api/reports/formats/excel")
async def generate_excel_report(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("reporting", "/formats/excel", request, "POST", body, user, require_auth=True)

@app.post("/api/reports/formats/csv")
async def generate_csv_report(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("reporting", "/formats/csv", request, "POST", body, user, require_auth=True)

@app.post("/api/reports/schedule")
async def schedule_report(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("reporting", "/schedule", request, "POST", body, user, require_auth=True)

@app.get("/api/reports/scheduled")
async def list_scheduled_reports(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("reporting", "/scheduled", request, user=user, require_auth=True)

# Quantum Service Endpoints - Extended
@app.post("/api/quantum/analyze")
async def quantum_analyze(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("quantum", "/analyze", request, "POST", body, user, require_auth=True)

@app.get("/api/quantum/analysis/{analysis_id}")
async def get_quantum_analysis(analysis_id: str, request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", f"/analysis/{analysis_id}", request, user=user, require_auth=True)

@app.post("/api/quantum/simulate")
async def quantum_simulate(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("quantum", "/simulate", request, "POST", body, user, require_auth=True)

@app.get("/api/quantum/metrics")
async def get_quantum_metrics(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", "/metrics", request, user=user, require_auth=True)

@app.post("/api/quantum/resistance/test")
async def test_quantum_resistance(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("quantum", "/resistance/test", request, "POST", body, user, require_auth=True)

# MEV Protection & Bot Endpoints - Extended
@app.post("/api/mev/protect")
async def protect_transaction(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("mev_protection", "/protect", request, "POST", body, user, require_auth=True)

@app.get("/api/mev/status/{tx_hash}")
async def get_mev_protection_status(tx_hash: str, request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("mev_protection", f"/status/{tx_hash}", request, user=user, require_auth=True)

@app.post("/api/mevbot/strategy")
async def create_mev_strategy(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("mev_bot", "/strategy", request, "POST", body, user, require_auth=True)

@app.get("/api/mevbot/opportunities")
async def get_mev_opportunities(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("mev_bot", "/opportunities", request, user=user, require_auth=True)

@app.post("/api/mevbot/execute")
async def execute_mev_strategy(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("mev_bot", "/execute", request, "POST", body, user, require_auth=True)

# AI Forensics Service Endpoints - Extended
@app.post("/api/forensics/analyze")
async def analyze_forensics(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("ai_forensics", "/analyze", request, "POST", body, user, require_auth=True)

@app.get("/api/forensics/investigation/{case_id}")
async def get_investigation(case_id: str, request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("ai_forensics", f"/investigation/{case_id}", request, user=user, require_auth=True)

@app.post("/api/forensics/predict")
async def predict_attack(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("ai_forensics", "/predict", request, "POST", body, user, require_auth=True)

@app.post("/api/forensics/cases")
async def create_forensics_case(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("ai_forensics", "/cases", request, "POST", body, user, require_auth=True)

@app.get("/api/forensics/cases")
async def list_forensics_cases(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("ai_forensics", "/cases", request, user=user, require_auth=True)

# ============================================================================
# CORE DASHBOARD ENDPOINTS - Complete Integration
# ============================================================================

# Static Scanner Summary
@app.get("/api/v1/static-scan")
async def static_scan_summary(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("scanner", "/scans/latest", request, user=user, require_auth=True)

# Bytecode Lab Quick-Peek
@app.get("/api/v1/bytecode-lab/{address}")
async def bytecode_lab_peek(address: str, request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("bytecode", f"/bytecode/{address}", request, user=user, require_auth=True)

# Simulation Engine Dashboard
@app.get("/api/v1/simulations")
async def list_simulations(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("simulation", "/jobs", request, user=user, require_auth=True)

@app.post("/api/v1/simulations")
async def create_simulation(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("simulation", "/jobs", request, "POST", body, user, require_auth=True)

# Cross-Chain Bridge Monitor
@app.get("/api/v1/bridge-monitor")
async def bridge_monitor(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("bridge", "/flows", request, user=user, require_auth=True)

# Exploit Rehearsal Kit Launcher
@app.post("/api/v1/exploit-rehearsal")
async def exploit_rehearsal(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("exploit_testing", "/launch", request, "POST", body, user, require_auth=True)

# Time Machine Cards
@app.get("/api/v1/time-machine/cards")
async def time_machine_cards(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("time_machine", "/cards", request, user=user, require_auth=True)

# ============================================================================
# NOTIFICATION ENDPOINTS
# ============================================================================

# Telegram Notifications
@app.post("/api/v1/notifications/telegram")
async def send_telegram_notification(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("integration_hub", "/notifications/telegram", request, "POST", body, user, require_auth=True)

# Slack Notifications
@app.post("/api/v1/notifications/slack")
async def send_slack_notification(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("integration_hub", "/notifications/slack", request, "POST", body, user, require_auth=True)

# ============================================================================
# INFRASTRUCTURE / UTILITY ENDPOINTS
# ============================================================================

# Computing Page
@app.get("/api/v1/computing/status")
async def computing_status(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("monitoring", "/computing/status", request, user=user, require_auth=True)

@app.get("/api/v1/computing/jobs")
async def computing_jobs(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("monitoring", "/computing/jobs", request, user=user, require_auth=True)

# Analytics Page
@app.get("/api/v1/analytics/overview")
async def analytics_overview(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("dashboard", "/analytics/overview", request, user=user, require_auth=True)

@app.get("/api/v1/analytics/detail")
async def analytics_detail(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("dashboard", "/analytics/detail", request, user=user, require_auth=True)

# Grafana Dashboard Page
@app.get("/api/v1/grafana/dashboard")
async def grafana_dashboard(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("monitoring", "/grafana/dashboard", request, user=user, require_auth=True)

# ============================================================================
# QUANTUM PAGE ENDPOINTS - Complete Integration
# ============================================================================

# Key Inventory
@app.get("/api/v1/quantum/keys")
async def quantum_list_keys(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", "/keys", request, user=user, require_auth=True)

# Key Detail
@app.get("/api/v1/quantum/keys/{key_id}")
async def quantum_get_key(key_id: str, request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", f"/keys/{key_id}", request, user=user, require_auth=True)

# Re-Test Key
@app.post("/api/v1/quantum/keys/{key_id}/retest")
async def quantum_retest_key(key_id: str, request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", f"/keys/{key_id}/retest", request, "POST", {}, user, require_auth=True)

# Migration Tasks List
@app.get("/api/v1/quantum/migration/tasks")
async def quantum_migration_tasks(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", "/migration/tasks", request, user=user, require_auth=True)

# Create Migration Task
@app.post("/api/v1/quantum/migration/tasks")
async def quantum_create_migration_task(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("quantum", "/migration/tasks", request, "POST", body, user, require_auth=True)

# Generate PQC Key
@app.post("/api/v1/quantum/keys/generate")
async def quantum_generate_key(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("quantum", "/keys/generate", request, "POST", body, user, require_auth=True)

# Threat Forecast
@app.get("/api/v1/quantum/forecast")
async def quantum_threat_forecast(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", "/forecast", request, user=user, require_auth=True)

# Vendor Feed
@app.get("/api/v1/quantum/vendor-feed")
async def quantum_vendor_feed(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", "/vendor-feed", request, user=user, require_auth=True)

# TLS Cert Scanner
@app.get("/api/v1/quantum/certs")
async def quantum_scan_certs(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", "/certs", request, user=user, require_auth=True)

# Mempool Heatmap Data
@app.get("/api/v1/quantum/heatmap")
async def quantum_heatmap_data(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", "/heatmap", request, user=user, require_auth=True)

# Alerts List
@app.get("/api/v1/quantum/alerts")
async def quantum_list_alerts(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", "/alerts", request, user=user, require_auth=True)

# Create Alert
@app.post("/api/v1/quantum/alerts")
async def quantum_create_alert(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("quantum", "/alerts", request, "POST", body, user, require_auth=True)

# Export Compliance Report
@app.get("/api/v1/quantum/compliance-report")
async def quantum_compliance_report(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("quantum", "/compliance-report", request, user=user, require_auth=True)

# ============================================================================
# HONEYPOT PAGE ENDPOINTS - Complete Integration
# ============================================================================

# Honeypot Summary
@app.get("/api/v1/honeypot/summary")
async def honeypot_summary(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("honeypot", "/summary", request, user=user, require_auth=True)

# Multi-Method Detection
@app.post("/api/v1/honeypot/detect")
async def honeypot_detect(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("honeypot", "/detect", request, "POST", body, user, require_auth=True)

# Simulation Log
@app.get("/api/v1/honeypot/simulations")
async def honeypot_simulations(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("honeypot", "/simulations", request, user=user, require_auth=True)

# Liquidity Snapshot
@app.get("/api/v1/honeypot/liquidity-snapshot")
async def honeypot_liquidity_snapshot(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("honeypot", "/liquidity-snapshot", request, user=user, require_auth=True)

# Bytecode Diff
@app.get("/api/v1/honeypot/bytecode-diff")
async def honeypot_bytecode_diff(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("honeypot", "/bytecode-diff", request, user=user, require_auth=True)

# Community Reputation
@app.get("/api/v1/honeypot/reputation")
async def honeypot_reputation(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("honeypot", "/reputation", request, user=user, require_auth=True)

# Watchlist
@app.get("/api/v1/honeypot/watchlist")
async def honeypot_get_watchlist(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("honeypot", "/watchlist", request, user=user, require_auth=True)

@app.post("/api/v1/honeypot/watchlist")
async def honeypot_add_watchlist(request: Request, user: UserInfo = Depends(get_current_user)):
    body = await request.json()
    return await secure_proxy_request("honeypot", "/watchlist", request, "POST", body, user, require_auth=True)

@app.delete("/api/v1/honeypot/watchlist/{address}")
async def honeypot_remove_watchlist(address: str, request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("honeypot", f"/watchlist/{address}", request, "DELETE", user=user, require_auth=True)

# Export Results
@app.get("/api/v1/honeypot/export")
async def honeypot_export(request: Request, user: UserInfo = Depends(get_current_user)):
    return await secure_proxy_request("honeypot", "/export", request, user=user, require_auth=True)

# Error handling
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request.headers.get("x-request-id", "unknown")
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    ERROR_COUNT.labels(error_type="unhandled").inc()
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat(),
            "request_id": request.headers.get("x-request-id", "unknown")
        }
    )

# Lifespan management
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Scorpius Enterprise API Gateway")
    yield
    # Shutdown
    logger.info("Shutting down Scorpius Enterprise API Gateway")
    await client.aclose()

app.router.lifespan_context = lifespan

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=int(os.getenv("PORT", "8080")),
        reload=ENVIRONMENT == "development"
    )