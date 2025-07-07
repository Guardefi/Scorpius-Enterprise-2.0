"""Simplified FastAPI application for the Quantum Security Platform."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Quantum Security Platform",
    version="1.0.0",
    description="Enterprise Quantum-Ready Vulnerability Scanner",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with basic information."""
    return {
        "message": "Quantum Security Platform API",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "api": "/api/v1"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "quantum-security-platform",
        "timestamp": "2025-07-06T12:00:00Z"
    }

@app.get("/api/v1/status")
async def api_status():
    """API status endpoint."""
    return {
        "api_version": "v1",
        "services": {
            "cbom_engine": "available",
            "quantum_agility_tester": "in_development",
            "attack_simulator": "in_development",
            "threat_intelligence": "planned",
            "hybrid_inspector": "planned",
            "key_audit": "planned",
            "firmware_scanner": "planned",
            "compliance_mapper": "planned",
            "dashboard": "planned",
            "devsecops": "planned"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
