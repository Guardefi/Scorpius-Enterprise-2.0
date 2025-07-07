"""Main application factory for the Quantum Security Platform."""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

from .core.config import settings
from .core.logging import get_logger
from .core.cache import QuantumCache
from .core.tasks import TaskQueue  
from .core.profiling import get_monitor, Metric, MetricType

# Import main service routers (fully implemented)
from .services.cbom_engine.api import router as cbom_router
from .services.quantum_agility_tester.api import router as agility_router
from .services.attack_simulator.api import router as attack_router
from .services.threat_intelligence.api import router as threat_router
from .services.hybrid_inspector.api import router as hybrid_router
from .services.key_audit.api import router as key_audit_router
from .services.firmware_scanner.api import router as firmware_router
from .services.compliance_mapper.api import router as compliance_router
from .services.dashboard.api import router as dashboard_router
from .services.devsecops.api import router as devsecops_router
from .services.ai_threat_predictor.api import router as ai_threat_router

logger = get_logger(__name__)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        description="Enterprise Quantum-Ready Vulnerability Scanner",
        docs_url="/docs" if not settings.is_production() else None,
        redoc_url="/redoc" if not settings.is_production() else None,
    )
    
    # Initialize core systems
    cache_manager = QuantumCache()
    task_manager = TaskQueue()
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add performance monitoring middleware
    @app.middleware("http")
    async def performance_middleware(request: Request, call_next):
        """Add performance monitoring to all requests."""
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log performance metrics
        performance_monitor = get_monitor()
        metric = Metric(
            name="request_duration",
            value=process_time,
            metric_type=MetricType.TIMER,
            tags={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code
            }
        )
        performance_monitor.record_metric(metric)
        
        response.headers["X-Process-Time"] = str(process_time)
        return response
    
    # Startup event
    @app.on_event("startup")
    async def startup_event():
        """Initialize systems on startup."""
        logger.info("Starting Quantum Security Platform...")
        
        # Initialize cache
        await cache_manager.initialize()
        logger.info("Cache system initialized")
        
        # Initialize task manager
        await task_manager.start()
        logger.info("Task management system initialized")
        
        # Store managers in app state for access in routes
        app.state.cache_manager = cache_manager
        app.state.task_manager = task_manager
        
        logger.info("All core systems initialized successfully")
    
    # Shutdown event
    @app.on_event("shutdown")
    async def shutdown_event():
        """Cleanup on shutdown."""
        logger.info("Shutting down Quantum Security Platform...")
        
        # Cleanup task manager
        await task_manager.stop()
        logger.info("Task manager shutdown complete")
        
        # Cleanup cache (if it has a cleanup method)
        if hasattr(cache_manager, 'cleanup'):
            await cache_manager.cleanup()
            logger.info("Cache cleanup complete")
        
        logger.info("Shutdown complete")
    
    # Include routers for all 10 pillars
    app.include_router(cbom_router, prefix="/api/v1")
    app.include_router(agility_router, prefix="/api/v1")
    app.include_router(attack_router, prefix="/api/v1")
    app.include_router(threat_router, prefix="/api/v1")
    app.include_router(hybrid_router, prefix="/api/v1")
    app.include_router(key_audit_router, prefix="/api/v1")
    app.include_router(firmware_router, prefix="/api/v1")
    app.include_router(compliance_router, prefix="/api/v1")
    app.include_router(dashboard_router, prefix="/api/v1")
    app.include_router(devsecops_router, prefix="/api/v1")
    app.include_router(ai_threat_router, prefix="/api/v1")
    
    # Root endpoint
    @app.get("/")
    async def root():
        """Root endpoint with basic information."""
        return {
            "name": settings.app_name,
            "version": settings.version,
            "status": "operational",
            "environment": settings.environment,
        }
    
    # Health check endpoint
    @app.get("/health")
    async def health():
        """Health check endpoint."""
        return {
            "status": "healthy",
            "version": settings.version,
            "environment": settings.environment,
        }
    
    # Service status endpoint
    @app.get("/status")
    async def status():
        """Platform status with all services."""
        # Get performance metrics summary
        performance_monitor = get_monitor()
        metrics_summary = performance_monitor.get_summary()
        
        return {
            "platform": "Quantum Security Platform",
            "version": settings.version,
            "environment": settings.environment,
            "status": "operational",
            "services": {
                "cbom_engine": "active",
                "quantum_agility_tester": "active", 
                "attack_simulator": "active",
                "threat_intelligence": "active",
                "hybrid_inspector": "active",
                "key_audit": "active",
                "firmware_scanner": "active",
                "compliance_mapper": "active",
                "dashboard": "active",
                "devsecops": "active",
                "ai_threat_predictor": "active"
            },
            "core_systems": {
                "cache": "active",
                "task_queue": "active", 
                "profiling": "active"
            },
            "metrics": {
                "requests_processed": metrics_summary.get("total_requests", 0),
                "avg_response_time": metrics_summary.get("avg_response_time", 0),
                "system_uptime": metrics_summary.get("uptime_seconds", 0)
            }
        }
    
    # Platform status endpoint
    @app.get("/status")
    async def platform_status():
        """Get comprehensive platform status including all core systems."""
        try:
            cache_status = "healthy" if hasattr(app.state, 'cache_manager') else "not_initialized"
            tasks_status = "healthy" if hasattr(app.state, 'task_manager') else "not_initialized"
            
            # Get performance metrics summary
            performance_monitor = get_monitor()
            metrics_summary = performance_monitor.get_summary()
            
            return {
                "status": "operational",
                "version": settings.version,
                "environment": settings.environment,
                "core_systems": {
                    "cache": cache_status,
                    "task_manager": tasks_status,
                    "profiling": "active"
                },
                "performance_metrics": metrics_summary,
                "services": {
                    "cbom_engine": "active",
                    "quantum_agility_tester": "active", 
                    "attack_simulator": "active",
                    "threat_intelligence": "active",
                    "hybrid_inspector": "active",
                    "key_audit": "active",
                    "firmware_scanner": "active",
                    "compliance_mapper": "active",
                    "dashboard": "active",
                    "devsecops": "active",
                    "ai_threat_predictor": "active"
                }
            }
        except Exception as e:
            logger.error("Error getting platform status", error=str(e))
            return {
                "status": "degraded",
                "error": str(e)
            }
    
    logger.info("Quantum Security Platform initialized", 
               version=settings.version,
               environment=settings.environment)
    
    return app


# Create the app instance
app = create_app()
