"""
Compliance Mapper API Endpoints

FastAPI router for regulatory framework mapping and compliance assessment.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException
import structlog

from .models import (
    ComplianceMappingRequest,
    ComplianceMappingResult,
    ComplianceReport
)
from .mapper import ComplianceMapper

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/compliance-mapper", tags=["Compliance Mapper"])
mapper = ComplianceMapper()

# In-memory storage for demo purposes
compliance_results = {}
compliance_reports = {}


@router.post("/assess", response_model=ComplianceMappingResult)
async def assess_compliance(request: ComplianceMappingRequest):
    """
    Assess compliance against regulatory frameworks.
    
    Maps cryptographic vulnerabilities and security findings to
    specific compliance requirements and generates gap analysis.
    """
    try:
        logger.info(
            "Received compliance assessment request",
            organization=request.organization,
            frameworks=request.frameworks
        )
        
        result = await mapper.assess_compliance(request)
        compliance_results[str(result.id)] = result
        
        logger.info(
            "Compliance assessment completed",
            assessment_id=result.id,
            organization=request.organization,
            overall_score=result.overall_compliance_score
        )
        
        return result
        
    except Exception as e:
        logger.error("Compliance assessment failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Assessment failed: {str(e)}")


@router.get("/assessment/{assessment_id}", response_model=ComplianceMappingResult)
async def get_compliance_assessment(assessment_id: UUID):
    """Get specific compliance assessment by ID."""
    result = compliance_results.get(str(assessment_id))
    if not result:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return result


@router.get("/assessments", response_model=List[ComplianceMappingResult])
async def list_compliance_assessments():
    """List all compliance assessments."""
    return list(compliance_results.values())


@router.delete("/assessment/{assessment_id}")
async def delete_compliance_assessment(assessment_id: UUID):
    """Delete compliance assessment."""
    if str(assessment_id) not in compliance_results:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    del compliance_results[str(assessment_id)]
    return {"message": "Assessment deleted"}


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "compliance-mapper",
        "assessments_stored": len(compliance_results),
        "reports_stored": len(compliance_reports)
    }
