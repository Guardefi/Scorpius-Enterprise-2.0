"""
Key Audit Service API Endpoints

FastAPI router for HSM/KMS quantum readiness assessment endpoints.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, BackgroundTasks
import structlog

from .models import (
    KeyAuditRequest,
    KeyAuditResult, 
    QuantumReadinessReport
)
from .scanner import KeyAuditScanner

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/key-audit", tags=["Key Audit"])
scanner = KeyAuditScanner()

# In-memory storage for demo purposes
audit_results = {}
readiness_reports = {}


@router.post("/audit", response_model=KeyAuditResult)
async def audit_key_store(request: KeyAuditRequest):
    """
    Perform quantum readiness audit of a key store.
    
    Assesses HSMs, KMS systems, and other key stores for 
    post-quantum cryptographic readiness.
    """
    try:
        logger.info("Received key audit request", target=request.target)
        
        result = await scanner.audit_key_store(request)
        audit_results[str(result.id)] = result
        
        logger.info(
            "Key audit completed successfully",
            audit_id=result.id,
            target=request.target,
            readiness_level=result.quantum_readiness
        )
        
        return result
        
    except Exception as e:
        logger.error("Key audit failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Audit failed: {str(e)}")


@router.get("/audit/{audit_id}", response_model=KeyAuditResult)
async def get_audit_result(audit_id: UUID):
    """Get specific audit result by ID."""
    result = audit_results.get(str(audit_id))
    if not result:
        raise HTTPException(status_code=404, detail="Audit result not found")
    return result


@router.get("/audits", response_model=List[KeyAuditResult])
async def list_audit_results():
    """List all audit results."""
    return list(audit_results.values())


@router.post("/report", response_model=QuantumReadinessReport)
async def generate_readiness_report(
    organization: str,
    audit_ids: List[UUID],
    background_tasks: BackgroundTasks
):
    """
    Generate comprehensive quantum readiness report.
    
    Combines multiple key store audits into an organizational
    quantum readiness assessment.
    """
    try:
        # Get audit results
        selected_results = []
        for audit_id in audit_ids:
            result = audit_results.get(str(audit_id))
            if not result:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Audit result {audit_id} not found"
                )
            selected_results.append(result)
        
        if not selected_results:
            raise HTTPException(
                status_code=400,
                detail="No valid audit results provided"
            )
        
        logger.info(
            "Generating quantum readiness report",
            organization=organization,
            audit_count=len(selected_results)
        )
        
        report = await scanner.generate_readiness_report(
            selected_results, 
            organization
        )
        
        readiness_reports[str(report.id)] = report
        
        logger.info(
            "Quantum readiness report generated",
            report_id=report.id,
            organization=organization,
            overall_readiness=report.overall_readiness
        )
        
        return report
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Report generation failed", error=str(e))
        raise HTTPException(
            status_code=500, 
            detail=f"Report generation failed: {str(e)}"
        )


@router.get("/report/{report_id}", response_model=QuantumReadinessReport)
async def get_readiness_report(report_id: UUID):
    """Get quantum readiness report by ID."""
    report = readiness_reports.get(str(report_id))
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/reports", response_model=List[QuantumReadinessReport])
async def list_readiness_reports():
    """List all quantum readiness reports."""
    return list(readiness_reports.values())


@router.delete("/audit/{audit_id}")
async def delete_audit_result(audit_id: UUID):
    """Delete audit result."""
    if str(audit_id) not in audit_results:
        raise HTTPException(status_code=404, detail="Audit result not found")
    
    del audit_results[str(audit_id)]
    return {"message": "Audit result deleted"}


@router.delete("/report/{report_id}")
async def delete_readiness_report(report_id: UUID):
    """Delete quantum readiness report."""
    if str(report_id) not in readiness_reports:
        raise HTTPException(status_code=404, detail="Report not found")
    
    del readiness_reports[str(report_id)]
    return {"message": "Report deleted"}


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "key-audit",
        "audits_stored": len(audit_results),
        "reports_stored": len(readiness_reports)
    }
