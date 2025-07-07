"""
Firmware Scanner API Endpoints

FastAPI router for IoT/embedded device cryptographic analysis endpoints.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, BackgroundTasks
import structlog

from .models import (
    FirmwareScanRequest,
    FirmwareScanResult,
    FirmwareAnalysisReport
)
from .scanner import FirmwareScanner

logger = structlog.get_logger(__name__)
router = APIRouter(prefix="/firmware-scanner", tags=["Firmware Scanner"])
scanner = FirmwareScanner()

# In-memory storage for demo purposes
scan_results = {}
analysis_reports = {}


@router.post("/scan", response_model=FirmwareScanResult)
async def scan_firmware(request: FirmwareScanRequest):
    """
    Perform comprehensive firmware/device cryptographic scan.
    
    Analyzes IoT devices, embedded systems, and firmware images for
    cryptographic vulnerabilities and quantum readiness.
    """
    try:
        logger.info(
            "Received firmware scan request",
            target=request.target.name,
            device_type=request.target.device_type
        )
        
        result = await scanner.scan_firmware(request)
        scan_results[str(result.id)] = result
        
        logger.info(
            "Firmware scan completed successfully",
            scan_id=result.id,
            target=request.target.name,
            risk_score=result.quantum_risk_score
        )
        
        return result
        
    except Exception as e:
        logger.error("Firmware scan failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.get("/scan/{scan_id}", response_model=FirmwareScanResult)
async def get_scan_result(scan_id: UUID):
    """Get specific scan result by ID."""
    result = scan_results.get(str(scan_id))
    if not result:
        raise HTTPException(status_code=404, detail="Scan result not found")
    return result


@router.get("/scans", response_model=List[FirmwareScanResult])
async def list_scan_results():
    """List all scan results."""
    return list(scan_results.values())


@router.post("/report", response_model=FirmwareAnalysisReport)
async def generate_analysis_report(
    organization: str,
    scan_ids: List[UUID],
    background_tasks: BackgroundTasks
):
    """
    Generate comprehensive firmware analysis report.
    
    Combines multiple device scans into an organizational
    firmware security assessment.
    """
    try:
        # Get scan results
        selected_results = []
        for scan_id in scan_ids:
            result = scan_results.get(str(scan_id))
            if not result:
                raise HTTPException(
                    status_code=404,
                    detail=f"Scan result {scan_id} not found"
                )
            selected_results.append(result)
        
        if not selected_results:
            raise HTTPException(
                status_code=400,
                detail="No valid scan results provided"
            )
        
        logger.info(
            "Generating firmware analysis report",
            organization=organization,
            scan_count=len(selected_results)
        )
        
        report = await scanner.generate_analysis_report(
            selected_results,
            organization
        )
        
        analysis_reports[str(report.id)] = report
        
        logger.info(
            "Firmware analysis report generated",
            report_id=report.id,
            organization=organization,
            devices_scanned=report.devices_scanned
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


@router.get("/report/{report_id}", response_model=FirmwareAnalysisReport)
async def get_analysis_report(report_id: UUID):
    """Get firmware analysis report by ID."""
    report = analysis_reports.get(str(report_id))
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/reports", response_model=List[FirmwareAnalysisReport])
async def list_analysis_reports():
    """List all firmware analysis reports."""
    return list(analysis_reports.values())


@router.delete("/scan/{scan_id}")
async def delete_scan_result(scan_id: UUID):
    """Delete scan result."""
    if str(scan_id) not in scan_results:
        raise HTTPException(status_code=404, detail="Scan result not found")
    
    del scan_results[str(scan_id)]
    return {"message": "Scan result deleted"}


@router.delete("/report/{report_id}")
async def delete_analysis_report(report_id: UUID):
    """Delete analysis report."""
    if str(report_id) not in analysis_reports:
        raise HTTPException(status_code=404, detail="Report not found")
    
    del analysis_reports[str(report_id)]
    return {"message": "Report deleted"}


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "firmware-scanner",
        "scans_stored": len(scan_results),
        "reports_stored": len(analysis_reports)
    }
