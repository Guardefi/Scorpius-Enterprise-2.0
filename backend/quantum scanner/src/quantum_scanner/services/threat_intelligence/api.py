"""
Threat Intelligence API endpoints.

This module provides REST API endpoints for the Threat Intelligence service,
enabling CVE monitoring, threat feeds, and alert generation for post-quantum cryptography.
"""

from typing import List, Optional, Dict, Any

from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from pydantic import UUID4

from .models import (
    ThreatIntelligenceRequest,
    ThreatIntelligenceResponse,
    CVEAlert,
    ThreatFeed,
    AlertConfiguration,
)
from .scanner import ThreatIntelligenceEngine
from ...core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/threat-intelligence", tags=["threat-intelligence"])


# Initialize scanner
scanner = ThreatIntelligenceEngine()


@router.post("/scan", response_model=ThreatIntelligenceResponse)
async def scan_threat_landscape(
    request: ThreatIntelligenceRequest,
    background_tasks: BackgroundTasks,
) -> ThreatIntelligenceResponse:
    """
    Scan the threat landscape for quantum-related vulnerabilities and threats.
    
    This endpoint analyzes current threat intelligence feeds, CVE databases,
    and research publications to identify quantum-related security threats.
    """
    try:
        logger.info(
            "Starting threat intelligence scan",
            scan_id=request.scan_id,
            scan_type=request.scan_type,
        )
        
        # Start threat intelligence scan
        result = await scanner.scan_threats(request)
        
        # Schedule background monitoring if requested
        if request.enable_monitoring:
            background_tasks.add_task(
                _schedule_monitoring,
                request.scan_id,
                request.monitoring_interval_hours or 24
            )
        
        logger.info(
            "Threat intelligence scan completed",
            scan_id=request.scan_id,
            threats_found=len(result.threats),
            cve_alerts=len(result.cve_alerts),
        )
        
        return result
        
    except Exception as e:
        logger.error(
            "Threat intelligence scan failed",
            scan_id=request.scan_id,
            error=str(e),
        )
        raise HTTPException(
            status_code=500,
            detail=f"Threat intelligence scan failed: {str(e)}"
        )


@router.get("/cves", response_model=List[CVEAlert])
async def get_quantum_cves(
    severity: Optional[str] = Query(None, description="Filter by severity level"),
    days_back: int = Query(30, description="Number of days to look back"),
    quantum_related_only: bool = Query(True, description="Only quantum-related CVEs"),
) -> List[CVEAlert]:
    """
    Retrieve quantum-related CVE alerts from the database.
    
    This endpoint provides access to the CVE monitoring system's findings,
    with filters for severity, timeframe, and quantum relevance.
    """
    try:
        logger.info(
            "Retrieving CVE alerts",
            severity=severity,
            days_back=days_back,
            quantum_only=quantum_related_only,
        )
        
        cves = await scanner.get_cve_alerts(
            severity=severity,
            days_back=days_back,
            quantum_related_only=quantum_related_only,
        )
        
        logger.info("CVE alerts retrieved", count=len(cves))
        return cves
        
    except Exception as e:
        logger.error("Failed to retrieve CVE alerts", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve CVE alerts: {str(e)}"
        )


@router.get("/feeds", response_model=List[ThreatFeed])
async def get_threat_feeds(
    active_only: bool = Query(True, description="Only active threat feeds"),
    category: Optional[str] = Query(None, description="Filter by feed category"),
) -> List[ThreatFeed]:
    """
    Get configured threat intelligence feeds.
    
    This endpoint returns the list of threat intelligence feeds that are
    being monitored for quantum-related security threats.
    """
    try:
        feeds = await scanner.get_threat_feeds(
            active_only=active_only,
            category=category,
        )
        
        logger.info("Threat feeds retrieved", count=len(feeds))
        return feeds
        
    except Exception as e:
        logger.error("Failed to retrieve threat feeds", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve threat feeds: {str(e)}"
        )


@router.post("/feeds", response_model=ThreatFeed)
async def add_threat_feed(feed: ThreatFeed) -> ThreatFeed:
    """
    Add a new threat intelligence feed to monitor.
    
    This endpoint allows adding new threat intelligence sources
    for monitoring quantum-related security threats.
    """
    try:
        logger.info("Adding new threat feed", feed_name=feed.name, url=feed.url)
        
        result = await scanner.add_threat_feed(feed)
        
        logger.info("Threat feed added successfully", feed_id=result.id)
        return result
        
    except Exception as e:
        logger.error("Failed to add threat feed", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add threat feed: {str(e)}"
        )


@router.delete("/feeds/{feed_id}")
async def delete_threat_feed(feed_id: UUID4) -> Dict[str, str]:
    """
    Remove a threat intelligence feed from monitoring.
    
    This endpoint removes a threat intelligence feed from the
    monitoring system.
    """
    try:
        logger.info("Deleting threat feed", feed_id=feed_id)
        
        await scanner.delete_threat_feed(feed_id)
        
        logger.info("Threat feed deleted successfully", feed_id=feed_id)
        return {"status": "success", "message": f"Feed {feed_id} deleted"}
        
    except Exception as e:
        logger.error("Failed to delete threat feed", feed_id=feed_id, error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete threat feed: {str(e)}"
        )


@router.get("/alerts/config", response_model=AlertConfiguration)
async def get_alert_configuration() -> AlertConfiguration:
    """
    Get current alert configuration settings.
    
    This endpoint returns the current configuration for threat intelligence
    alerts, including thresholds, notification settings, and escalation rules.
    """
    try:
        config = await scanner.get_alert_configuration()
        return config
        
    except Exception as e:
        logger.error("Failed to get alert configuration", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get alert configuration: {str(e)}"
        )


@router.put("/alerts/config", response_model=AlertConfiguration)
async def update_alert_configuration(
    config: AlertConfiguration,
) -> AlertConfiguration:
    """
    Update alert configuration settings.
    
    This endpoint allows updating the threat intelligence alert configuration,
    including notification thresholds and escalation rules.
    """
    try:
        logger.info("Updating alert configuration")
        
        result = await scanner.update_alert_configuration(config)
        
        logger.info("Alert configuration updated successfully")
        return result
        
    except Exception as e:
        logger.error("Failed to update alert configuration", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update alert configuration: {str(e)}"
        )


@router.get("/status")
async def get_service_status() -> Dict[str, Any]:
    """
    Get threat intelligence service status and metrics.
    
    This endpoint provides status information about the threat intelligence
    service, including feed health, recent scan statistics, and system health.
    """
    try:
        status = await scanner.get_service_status()
        return status
        
    except Exception as e:
        logger.error("Failed to get service status", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get service status: {str(e)}"
        )


async def _schedule_monitoring(scan_id: UUID4, interval_hours: int) -> None:
    """
    Schedule background monitoring for continuous threat intelligence.
    
    Args:
        scan_id: The scan ID to associate with monitoring
        interval_hours: How often to check for new threats
    """
    try:
        logger.info(
            "Scheduling threat monitoring",
            scan_id=scan_id,
            interval_hours=interval_hours,
        )
        
        await scanner.schedule_monitoring(scan_id, interval_hours)
        
    except Exception as e:
        logger.error(
            "Failed to schedule monitoring",
            scan_id=scan_id,
            error=str(e),
        )
