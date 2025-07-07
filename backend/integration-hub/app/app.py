"""
SCORPIUS INTEGRATION HUB API
FastAPI application providing unified API for all enterprise security modules.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Import Integration Hub components
from .integration_hub import IntegrationHub, initialize_integration_hub
from .plugin_marketplace import PluginMarketplace, initialize_plugin_marketplace, PluginType

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models for API requests/responses
class SecurityScanRequest(BaseModel):
    target: str = Field(..., description="Target for security scan")
    scan_type: str = Field(default="full", description="Type of scan to perform")
    options: Optional[Dict[str, Any]] = Field(default=None, description="Additional scan options")

class ThreatResponseRequest(BaseModel):
    threat_data: Dict[str, Any] = Field(..., description="Threat information to respond to")
    response_type: str = Field(default="automated", description="Type of response to execute")

class WorkflowRequest(BaseModel):
    workflow_id: str = Field(..., description="ID of workflow to execute")
    trigger_data: Dict[str, Any] = Field(..., description="Data that triggered the workflow")

class PluginExecutionRequest(BaseModel):
    plugin_id: str = Field(..., description="ID of plugin to execute")
    task_data: Dict[str, Any] = Field(..., description="Task data for plugin execution")

class QuantumEnvironmentRequest(BaseModel):
    environment_config: Dict[str, Any] = Field(..., description="Configuration for quantum environment")

class APICallRequest(BaseModel):
    module_name: str = Field(..., description="Name of module to call")
    function_name: str = Field(..., description="Name of function to call")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Parameters for function call")

# FastAPI app
app = FastAPI(
    title="Scorpius Integration Hub API",
    description="Unified API for all Scorpius enterprise security modules",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
integration_hub: Optional[IntegrationHub] = None
plugin_marketplace: Optional[PluginMarketplace] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the Integration Hub on startup."""
    global integration_hub, plugin_marketplace
    
    try:
        logger.info("Starting Integration Hub API...")
        
        # Initialize Integration Hub
        integration_hub = IntegrationHub()
        success = await integration_hub.initialize()
        
        if not success:
            logger.error("Failed to initialize Integration Hub")
            raise RuntimeError("Integration Hub initialization failed")
        
        # Initialize Plugin Marketplace
        plugin_marketplace = await initialize_plugin_marketplace()
        
        logger.info("Integration Hub API started successfully")
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Integration Hub API...")

def get_integration_hub() -> IntegrationHub:
    """Get Integration Hub instance."""
    if integration_hub is None:
        raise HTTPException(status_code=500, detail="Integration Hub not initialized")
    return integration_hub

def get_plugin_marketplace() -> PluginMarketplace:
    """Get Plugin Marketplace instance."""
    if plugin_marketplace is None:
        raise HTTPException(status_code=500, detail="Plugin Marketplace not initialized")
    return plugin_marketplace

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Integration Hub API"
    }

# System status endpoint
@app.get("/status")
async def get_system_status(hub: IntegrationHub = Depends(get_integration_hub)):
    """Get overall system status."""
    try:
        status = await hub.get_system_status()
        return JSONResponse(content=status)
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Integration metrics endpoint
@app.get("/metrics")
async def get_integration_metrics(hub: IntegrationHub = Depends(get_integration_hub)):
    """Get integration metrics."""
    try:
        metrics = await hub.get_integration_metrics()
        return JSONResponse(content=metrics)
    except Exception as e:
        logger.error(f"Error getting integration metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Generic API call endpoint
@app.post("/api/call")
async def make_api_call(
    request: APICallRequest,
    hub: IntegrationHub = Depends(get_integration_hub)
):
    """Make a generic API call to any integrated module."""
    try:
        result = await hub.api_call(
            module_name=request.module_name,
            function_name=request.function_name,
            **request.parameters
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error making API call: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Security scan endpoint
@app.post("/security/scan")
async def comprehensive_security_scan(
    request: SecurityScanRequest,
    background_tasks: BackgroundTasks,
    hub: IntegrationHub = Depends(get_integration_hub)
):
    """Perform comprehensive security scan."""
    try:
        result = await hub.comprehensive_security_scan(
            target=request.target,
            scan_type=request.scan_type
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error performing security scan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Threat response endpoint
@app.post("/security/threat-response")
async def automated_threat_response(
    request: ThreatResponseRequest,
    background_tasks: BackgroundTasks,
    hub: IntegrationHub = Depends(get_integration_hub)
):
    """Execute automated threat response."""
    try:
        result = await hub.automated_threat_response(request.threat_data)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error executing threat response: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Quantum environment deployment endpoint
@app.post("/quantum/deploy")
async def deploy_quantum_environment(
    request: QuantumEnvironmentRequest,
    background_tasks: BackgroundTasks,
    hub: IntegrationHub = Depends(get_integration_hub)
):
    """Deploy quantum-secured environment."""
    try:
        result = await hub.deploy_quantum_secured_environment(request.environment_config)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error deploying quantum environment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Workflow execution endpoint
@app.post("/workflow/execute")
async def execute_workflow(
    request: WorkflowRequest,
    background_tasks: BackgroundTasks,
    hub: IntegrationHub = Depends(get_integration_hub)
):
    """Execute a workflow."""
    try:
        result = await hub.execute_workflow(
            workflow_id=request.workflow_id,
            trigger_data=request.trigger_data
        )
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error executing workflow: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Plugin marketplace endpoints
@app.get("/plugins")
async def list_plugins(
    plugin_type: Optional[str] = None,
    marketplace: PluginMarketplace = Depends(get_plugin_marketplace)
):
    """List available plugins."""
    try:
        plugin_type_enum = None
        if plugin_type:
            plugin_type_enum = PluginType(plugin_type)
        
        plugins = await marketplace.list_plugins(plugin_type_enum)
        return JSONResponse(content=[
            {
                "plugin_id": p.plugin_id,
                "name": p.name,
                "description": p.description,
                "version": p.version,
                "plugin_type": p.plugin_type.value,
                "author": p.author,
                "status": p.status.value,
                "rating": p.rating,
                "install_date": p.install_date.isoformat() if p.install_date else None
            }
            for p in plugins
        ])
    except Exception as e:
        logger.error(f"Error listing plugins: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/plugins/{plugin_id}")
async def get_plugin_details(
    plugin_id: str,
    marketplace: PluginMarketplace = Depends(get_plugin_marketplace)
):
    """Get plugin details."""
    try:
        plugin = await marketplace.get_plugin(plugin_id)
        if not plugin:
            raise HTTPException(status_code=404, detail="Plugin not found")
        
        return JSONResponse(content={
            "plugin_id": plugin.plugin_id,
            "name": plugin.name,
            "description": plugin.description,
            "version": plugin.version,
            "plugin_type": plugin.plugin_type.value,
            "author": plugin.author,
            "status": plugin.status.value,
            "dependencies": plugin.dependencies,
            "config": plugin.config,
            "rating": plugin.rating,
            "install_date": plugin.install_date.isoformat() if plugin.install_date else None,
            "last_updated": plugin.last_updated.isoformat() if plugin.last_updated else None,
            "execution_count": plugin.execution_count
        })
    except Exception as e:
        logger.error(f"Error getting plugin details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plugins/{plugin_id}/install")
async def install_plugin(
    plugin_id: str,
    config: Optional[Dict[str, Any]] = None,
    marketplace: PluginMarketplace = Depends(get_plugin_marketplace)
):
    """Install a plugin."""
    try:
        success = await marketplace.install_plugin(plugin_id, config)
        if not success:
            raise HTTPException(status_code=400, detail="Plugin installation failed")
        
        return JSONResponse(content={"message": f"Plugin {plugin_id} installed successfully"})
    except Exception as e:
        logger.error(f"Error installing plugin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/plugins/{plugin_id}/execute")
async def execute_plugin(
    plugin_id: str,
    request: PluginExecutionRequest,
    marketplace: PluginMarketplace = Depends(get_plugin_marketplace)
):
    """Execute a plugin."""
    try:
        result = await marketplace.execute_plugin(plugin_id, request.task_data)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error executing plugin: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/plugins/stats")
async def get_marketplace_stats(
    marketplace: PluginMarketplace = Depends(get_plugin_marketplace)
):
    """Get marketplace statistics."""
    try:
        stats = await marketplace.get_marketplace_stats()
        return JSONResponse(content=stats)
    except Exception as e:
        logger.error(f"Error getting marketplace stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8014,
        reload=True,
        log_level="info"
    ) 