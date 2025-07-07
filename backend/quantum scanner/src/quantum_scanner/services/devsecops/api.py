"""
DevSecOps API endpoints.

This module provides REST API endpoints for the DevSecOps service,
enabling CI/CD integration, pipeline security scanning, and automated quantum-safe validation.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query, Body
from pydantic import UUID4

from .models import (
    DevSecOpsRequest,
    DevSecOpsResponse,
    PipelineIntegration,
    SecurityCheck,
    CheckResult,
    PolicyViolation,
    AutomationRule,
)
from .integrator import DevSecOpsIntegrator
from ...core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/devsecops", tags=["devsecops"])


# Initialize integrator
integrator = DevSecOpsIntegrator()


@router.post("/scan", response_model=DevSecOpsResponse)
async def scan_pipeline_security(
    request: DevSecOpsRequest,
    background_tasks: BackgroundTasks,
) -> DevSecOpsResponse:
    """
    Scan CI/CD pipeline for quantum security vulnerabilities.
    
    This endpoint analyzes CI/CD pipelines, build processes, and deployment
    configurations for quantum-safe security practices.
    """
    try:
        logger.info(
            "Starting DevSecOps pipeline scan",
            scan_id=request.scan_id,
            pipeline=request.pipeline_config.get("name", "unknown"),
        )
        
        # Perform pipeline security scan
        result = await integrator.scan_pipeline_security(request)
        
        # Schedule monitoring if requested
        if request.enable_monitoring:
            background_tasks.add_task(
                _schedule_pipeline_monitoring,
                request.scan_id,
                request.monitoring_interval_hours or 24
            )
        
        logger.info(
            "DevSecOps pipeline scan completed",
            scan_id=request.scan_id,
            violations_found=len(result.policy_violations),
            security_score=result.security_score,
        )
        
        return result
        
    except Exception as e:
        logger.error(
            "DevSecOps pipeline scan failed",
            scan_id=request.scan_id,
            error=str(e),
        )
        raise HTTPException(
            status_code=500,
            detail=f"Pipeline security scan failed: {str(e)}"
        )


@router.post("/integrations", response_model=PipelineIntegration)
async def create_pipeline_integration(
    integration: PipelineIntegration,
) -> PipelineIntegration:
    """
    Create a new CI/CD pipeline integration.
    
    This endpoint sets up integration with CI/CD platforms like
    GitHub Actions, GitLab CI, Jenkins, Azure DevOps, etc.
    """
    try:
        logger.info(
            "Creating pipeline integration",
            name=integration.name,
            platform=integration.platform,
            type=integration.integration_type,
        )
        
        result = await integrator.create_integration(integration)
        
        logger.info(
            "Pipeline integration created",
            integration_id=result.id,
            name=result.name,
        )
        
        return result
        
    except Exception as e:
        logger.error("Failed to create pipeline integration", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create pipeline integration: {str(e)}"
        )


@router.get("/integrations", response_model=List[PipelineIntegration])
async def get_pipeline_integrations(
    platform: Optional[str] = Query(None, description="Filter by platform"),
    active_only: bool = Query(True, description="Only active integrations"),
) -> List[PipelineIntegration]:
    """
    Get configured CI/CD pipeline integrations.
    
    This endpoint returns the list of configured pipeline integrations
    with optional filtering by platform and status.
    """
    try:
        integrations = await integrator.get_integrations(
            platform=platform,
            active_only=active_only,
        )
        
        logger.info("Pipeline integrations retrieved", count=len(integrations))
        return integrations
        
    except Exception as e:
        logger.error("Failed to retrieve pipeline integrations", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve pipeline integrations: {str(e)}"
        )


@router.put("/integrations/{integration_id}", response_model=PipelineIntegration)
async def update_pipeline_integration(
    integration_id: UUID4,
    integration: PipelineIntegration,
) -> PipelineIntegration:
    """
    Update an existing pipeline integration.
    
    This endpoint allows updating configuration of existing
    CI/CD pipeline integrations.
    """
    try:
        logger.info("Updating pipeline integration", integration_id=integration_id)
        
        result = await integrator.update_integration(integration_id, integration)
        
        logger.info("Pipeline integration updated", integration_id=integration_id)
        return result
        
    except Exception as e:
        logger.error(
            "Failed to update pipeline integration",
            integration_id=integration_id,
            error=str(e)
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update pipeline integration: {str(e)}"
        )


@router.delete("/integrations/{integration_id}")
async def delete_pipeline_integration(integration_id: UUID4) -> Dict[str, str]:
    """
    Delete a pipeline integration.
    
    This endpoint removes a CI/CD pipeline integration
    from the system.
    """
    try:
        logger.info("Deleting pipeline integration", integration_id=integration_id)
        
        await integrator.delete_integration(integration_id)
        
        logger.info("Pipeline integration deleted", integration_id=integration_id)
        return {"status": "success", "message": f"Integration {integration_id} deleted"}
        
    except Exception as e:
        logger.error(
            "Failed to delete pipeline integration",
            integration_id=integration_id,
            error=str(e)
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete pipeline integration: {str(e)}"
        )


@router.post("/checks/validate", response_model=List[CheckResult])
async def validate_security_checks(
    checks: List[SecurityCheck] = Body(..., description="Security checks to validate"),
) -> List[CheckResult]:
    """
    Validate quantum-safe security checks.
    
    This endpoint validates a list of security checks against
    quantum-safe security policies and best practices.
    """
    try:
        logger.info("Validating security checks", check_count=len(checks))
        
        results = await integrator.validate_security_checks(checks)
        
        passed_checks = sum(1 for result in results if result.passed)
        logger.info(
            "Security checks validated",
            total_checks=len(checks),
            passed=passed_checks,
            failed=len(checks) - passed_checks,
        )
        
        return results
        
    except Exception as e:
        logger.error("Failed to validate security checks", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to validate security checks: {str(e)}"
        )


@router.get("/policies/violations", response_model=List[PolicyViolation])
async def get_policy_violations(
    severity: Optional[str] = Query(None, description="Filter by severity"),
    pipeline: Optional[str] = Query(None, description="Filter by pipeline"),
    days_back: int = Query(7, description="Number of days to look back"),
) -> List[PolicyViolation]:
    """
    Get quantum-safe policy violations.
    
    This endpoint returns policy violations detected in CI/CD pipelines,
    with filtering options for severity, pipeline, and timeframe.
    """
    try:
        logger.info(
            "Retrieving policy violations",
            severity=severity,
            pipeline=pipeline,
            days_back=days_back,
        )
        
        violations = await integrator.get_policy_violations(
            severity=severity,
            pipeline=pipeline,
            days_back=days_back,
        )
        
        logger.info("Policy violations retrieved", count=len(violations))
        return violations
        
    except Exception as e:
        logger.error("Failed to retrieve policy violations", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve policy violations: {str(e)}"
        )


@router.post("/automation/rules", response_model=AutomationRule)
async def create_automation_rule(rule: AutomationRule) -> AutomationRule:
    """
    Create a new automation rule.
    
    This endpoint creates automation rules for quantum-safe security
    enforcement in CI/CD pipelines.
    """
    try:
        logger.info(
            "Creating automation rule",
            name=rule.name,
            trigger=rule.trigger,
        )
        
        result = await integrator.create_automation_rule(rule)
        
        logger.info("Automation rule created", rule_id=result.id)
        return result
        
    except Exception as e:
        logger.error("Failed to create automation rule", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create automation rule: {str(e)}"
        )


@router.get("/automation/rules", response_model=List[AutomationRule])
async def get_automation_rules(
    active_only: bool = Query(True, description="Only active rules"),
) -> List[AutomationRule]:
    """
    Get configured automation rules.
    
    This endpoint returns the list of automation rules configured
    for quantum-safe security enforcement.
    """
    try:
        rules = await integrator.get_automation_rules(active_only=active_only)
        
        logger.info("Automation rules retrieved", count=len(rules))
        return rules
        
    except Exception as e:
        logger.error("Failed to retrieve automation rules", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve automation rules: {str(e)}"
        )


@router.post("/webhook/{integration_id}")
async def handle_webhook(
    integration_id: UUID4,
    background_tasks: BackgroundTasks,
    payload: Dict[str, Any] = Body(...),
) -> Dict[str, str]:
    """
    Handle CI/CD webhook events.
    
    This endpoint receives webhook events from CI/CD platforms
    and triggers appropriate quantum-safe security scans.
    """
    try:
        logger.info(
            "Handling webhook",
            integration_id=integration_id,
            event_type=payload.get("event_type", "unknown"),
        )
        
        # Process webhook in background
        background_tasks.add_task(
            _process_webhook,
            integration_id,
            payload
        )
        
        return {"status": "accepted", "message": "Webhook processing initiated"}
        
    except Exception as e:
        logger.error(
            "Failed to handle webhook",
            integration_id=integration_id,
            error=str(e)
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to handle webhook: {str(e)}"
        )


@router.get("/reports/security-score/{pipeline_id}")
async def get_pipeline_security_score(pipeline_id: str) -> Dict[str, Any]:
    """
    Get security score for a specific pipeline.
    
    This endpoint returns the quantum-safe security score and
    related metrics for a specific CI/CD pipeline.
    """
    try:
        logger.info("Getting pipeline security score", pipeline_id=pipeline_id)
        
        score_data = await integrator.get_pipeline_security_score(pipeline_id)
        
        logger.info("Pipeline security score retrieved", pipeline_id=pipeline_id)
        return score_data
        
    except Exception as e:
        logger.error(
            "Failed to get pipeline security score",
            pipeline_id=pipeline_id,
            error=str(e)
        )
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get pipeline security score: {str(e)}"
        )


@router.get("/status")
async def get_service_status() -> Dict[str, Any]:
    """
    Get DevSecOps service status and metrics.
    
    This endpoint provides status information about the DevSecOps
    service, including integration health and scan statistics.
    """
    try:
        status = {
            "service_name": "DevSecOps Integration",
            "status": "healthy",
            "version": "1.0.0",
            "capabilities": [
                "pipeline_security_scanning",
                "ci_cd_integration",
                "policy_enforcement",
                "automation_rules",
                "webhook_processing",
            ],
            "statistics": {
                "active_integrations": 0,  # Would be retrieved from database
                "total_scans": 0,
                "policy_violations": 0,
                "automation_rules": 0,
            },
            "integrations": {
                "supported_platforms": [
                    "github_actions",
                    "gitlab_ci",
                    "jenkins",
                    "azure_devops",
                    "circleci",
                    "teamcity",
                ],
                "active_count": 0,
            },
            "last_updated": "2024-01-01T00:00:00Z",
        }
        
        return status
        
    except Exception as e:
        logger.error("Failed to get service status", error=str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get service status: {str(e)}"
        )


async def _schedule_pipeline_monitoring(scan_id: UUID4, interval_hours: int) -> None:
    """
    Schedule background monitoring for pipeline security.
    
    Args:
        scan_id: The scan ID to associate with monitoring
        interval_hours: How often to check for security issues
    """
    try:
        logger.info(
            "Scheduling pipeline monitoring",
            scan_id=scan_id,
            interval_hours=interval_hours,
        )
        
        # This would set up periodic monitoring
        # For now, just log the request
        logger.info("Pipeline monitoring scheduled", scan_id=scan_id)
        
    except Exception as e:
        logger.error(
            "Failed to schedule pipeline monitoring",
            scan_id=scan_id,
            error=str(e),
        )


async def _process_webhook(integration_id: UUID4, payload: Dict[str, Any]) -> None:
    """
    Process webhook payload from CI/CD platform.
    
    Args:
        integration_id: ID of the integration that received the webhook
        payload: Webhook payload data
    """
    try:
        logger.info(
            "Processing webhook payload",
            integration_id=integration_id,
            event_type=payload.get("event_type", "unknown"),
        )
        
        await integrator.process_webhook(integration_id, payload)
        
        logger.info("Webhook processed successfully", integration_id=integration_id)
        
    except Exception as e:
        logger.error(
            "Failed to process webhook",
            integration_id=integration_id,
            error=str(e),
        )
