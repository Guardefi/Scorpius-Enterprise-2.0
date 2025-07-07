"""
Dashboard API Endpoints

FastAPI router for executive dashboard and visualization endpoints.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException
import structlog

from .models import (
    DashboardConfig,
    DashboardData,
    DashboardExport
)
from .generator import DashboardGenerator
from .visualizer import DataVisualizer

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])
generator = DashboardGenerator()
visualizer = DataVisualizer()

# In-memory storage for demo purposes
dashboards = {}
dashboard_data = {}


@router.post("/create", response_model=DashboardConfig)
async def create_dashboard(config: DashboardConfig):
    """
    Create a new executive dashboard.
    
    Configures dashboard layout, widgets, and data sources
    for executive-level risk visualization.
    """
    try:
        logger.info("Creating new dashboard", name=config.name)
        
        dashboards[str(config.id)] = config
        
        logger.info(
            "Dashboard created successfully",
            dashboard_id=config.id,
            name=config.name
        )
        
        return config
        
    except Exception as e:
        logger.error("Dashboard creation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Dashboard creation failed: {str(e)}")


@router.get("/data/{dashboard_id}", response_model=DashboardData)
async def get_dashboard_data(dashboard_id: UUID):
    """
    Get dashboard data for visualization.
    
    Returns executive metrics, risk assessments, compliance status,
    and trend analysis for the specified dashboard.
    """
    try:
        config = dashboards.get(str(dashboard_id))
        if not config:
            raise HTTPException(status_code=404, detail="Dashboard not found")
        
        logger.info("Generating dashboard data", dashboard_id=dashboard_id)
        
        # Check cache first
        cached_data = await generator.get_cached_data(dashboard_id)
        if cached_data:
            return cached_data
        
        # Generate fresh data
        data = await generator.generate_dashboard_data(config)
        generator.cache_data(dashboard_id, data)
        
        dashboard_data[str(dashboard_id)] = data
        
        logger.info(
            "Dashboard data generated successfully",
            dashboard_id=dashboard_id,
            alerts_count=len(data.alerts)
        )
        
        return data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Dashboard data generation failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Data generation failed: {str(e)}"
        )


@router.get("/config/{dashboard_id}", response_model=DashboardConfig)
async def get_dashboard_config(dashboard_id: UUID):
    """Get dashboard configuration."""
    config = dashboards.get(str(dashboard_id))
    if not config:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return config


@router.get("/list", response_model=List[DashboardConfig])
async def list_dashboards():
    """List all available dashboards."""
    return list(dashboards.values())


@router.put("/config/{dashboard_id}", response_model=DashboardConfig)
async def update_dashboard_config(dashboard_id: UUID, config: DashboardConfig):
    """Update dashboard configuration."""
    if str(dashboard_id) not in dashboards:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    config.id = dashboard_id
    dashboards[str(dashboard_id)] = config
    
    logger.info("Dashboard configuration updated", dashboard_id=dashboard_id)
    return config


@router.delete("/config/{dashboard_id}")
async def delete_dashboard(dashboard_id: UUID):
    """Delete dashboard."""
    if str(dashboard_id) not in dashboards:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    del dashboards[str(dashboard_id)]
    if str(dashboard_id) in dashboard_data:
        del dashboard_data[str(dashboard_id)]
    
    logger.info("Dashboard deleted", dashboard_id=dashboard_id)
    return {"message": "Dashboard deleted"}


@router.post("/export/{dashboard_id}")
async def export_dashboard(dashboard_id: UUID, export_config: DashboardExport):
    """
    Export dashboard data and visualizations.
    
    Supports multiple export formats including PDF reports,
    Excel spreadsheets, and PNG images.
    """
    try:
        config = dashboards.get(str(dashboard_id))
        if not config:
            raise HTTPException(status_code=404, detail="Dashboard not found")
        
        logger.info(
            "Exporting dashboard",
            dashboard_id=dashboard_id,
            format=export_config.format
        )
        
        # Simulate export generation
        export_url = f"/exports/dashboard_{dashboard_id}.{export_config.format}"
        
        return {
            "export_url": export_url,
            "format": export_config.format,
            "generated_at": "2024-01-15T10:30:00Z",
            "expires_at": "2024-01-22T10:30:00Z"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Dashboard export failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Export failed: {str(e)}"
        )


@router.get("/charts/{dashboard_id}")
async def get_dashboard_charts(dashboard_id: UUID):
    """Get formatted chart data for dashboard visualization."""
    try:
        data = dashboard_data.get(str(dashboard_id))
        if not data:
            # Generate data if not cached
            config = dashboards.get(str(dashboard_id))
            if not config:
                raise HTTPException(status_code=404, detail="Dashboard not found")
            data = await generator.generate_dashboard_data(config)
        
        # Format charts for frontend
        formatted_charts = []
        for chart in data.charts:
            formatted_chart = visualizer.format_chart_data(chart)
            formatted_charts.append(formatted_chart)
        
        return {"charts": formatted_charts}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Chart data formatting failed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Chart formatting failed: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "dashboard",
        "dashboards_configured": len(dashboards),
        "cached_data_count": len(dashboard_data)
    }
