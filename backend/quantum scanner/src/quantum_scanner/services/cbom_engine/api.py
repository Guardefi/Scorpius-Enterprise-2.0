"""FastAPI router for CBOM Engine API endpoints."""

from typing import List, Dict, Any
from uuid import UUID
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from pydantic import BaseModel

from ...core.logging import get_logger
from ...core.exceptions import ScanError, ValidationError
from .models import Asset, CBOMConfig, CBOMReport, AssetType
from .scanner import QuantumCBOMScanner

logger = get_logger(__name__)

router = APIRouter(prefix="/cbom", tags=["CBOM Engine"])


class ScanRequest(BaseModel):
    """Request model for CBOM scanning."""
    assets: List[Asset]
    config: CBOMConfig = CBOMConfig()


class ScanResponse(BaseModel):
    """Response model for CBOM scanning."""
    scan_id: UUID
    status: str
    message: str


class CBOMSummary(BaseModel):
    """Summary model for CBOM reports."""
    total_components: int
    quantum_vulnerable: int
    quantum_vulnerable_percentage: float
    fips_compliant: int
    fips_compliant_percentage: float
    vulnerability_breakdown: Dict[str, int]


# In-memory storage for demo purposes (replace with proper database in production)
scan_results: Dict[UUID, CBOMReport] = {}
scan_status: Dict[UUID, str] = {}


async def get_cbom_scanner() -> QuantumCBOMScanner:
    """Dependency to get CBOM scanner instance."""
    config = CBOMConfig()
    return QuantumCBOMScanner(config)


@router.post("/scan", response_model=ScanResponse)
async def start_cbom_scan(
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    scanner: QuantumCBOMScanner = Depends(get_cbom_scanner)
):
    """Start a CBOM scanning operation."""
    try:
        # Validate scan request
        if not scan_request.assets:
            raise ValidationError("At least one asset must be provided for scanning")
        
        # Create a unique scan ID
        from uuid import uuid4
        scan_id = uuid4()
        
        # Set initial status
        scan_status[scan_id] = "started"
        
        # Start background scan
        background_tasks.add_task(
            perform_cbom_scan,
            scan_id,
            scan_request.assets,
            scan_request.config,
            scanner
        )
        
        logger.info("CBOM scan started", 
                   scan_id=str(scan_id), 
                   asset_count=len(scan_request.assets))
        
        return ScanResponse(
            scan_id=scan_id,
            status="started",
            message=f"CBOM scan started for {len(scan_request.assets)} assets"
        )
        
    except Exception as e:
        logger.error("Failed to start CBOM scan", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to start scan: {str(e)}")


@router.get("/scan/{scan_id}/status")
async def get_scan_status(scan_id: UUID):
    """Get the status of a CBOM scan."""
    if scan_id not in scan_status:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    status = scan_status[scan_id]
    response = {"scan_id": scan_id, "status": status}
    
    if status == "completed" and scan_id in scan_results:
        report = scan_results[scan_id]
        response["summary"] = CBOMSummary(
            total_components=report.total_components,
            quantum_vulnerable=report.quantum_vulnerable_count,
            quantum_vulnerable_percentage=report.summary.get("quantum_vulnerable_percentage", 0),
            fips_compliant=report.fips_compliant_count,
            fips_compliant_percentage=report.summary.get("fips_compliant_percentage", 0),
            vulnerability_breakdown=report.vulnerability_breakdown,
        )
    
    return response


@router.get("/scan/{scan_id}/report", response_model=CBOMReport)
async def get_cbom_report(scan_id: UUID):
    """Get the complete CBOM report for a scan."""
    if scan_id not in scan_results:
        if scan_id in scan_status:
            status = scan_status[scan_id]
            if status == "running":
                raise HTTPException(status_code=202, detail="Scan still in progress")
            elif status == "failed":
                raise HTTPException(status_code=500, detail="Scan failed")
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return scan_results[scan_id]


@router.get("/scan/{scan_id}/export/{format}")
async def export_cbom_report(scan_id: UUID, format: str = "cyclonedx"):
    """Export CBOM report in specified format."""
    if scan_id not in scan_results:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    report = scan_results[scan_id]
    
    if format.lower() == "cyclonedx":
        # Implementation would use CycloneDX exporter
        return {"message": "CycloneDX export not yet implemented", "report_id": scan_id}
    elif format.lower() == "json":
        return report
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported export format: {format}")


@router.get("/scans")
async def list_scans():
    """List all CBOM scans."""
    scans = []
    for scan_id, status in scan_status.items():
        scan_info = {
            "scan_id": scan_id,
            "status": status,
        }
        
        if scan_id in scan_results:
            report = scan_results[scan_id]
            scan_info.update({
                "created_at": report.generated_at,
                "asset_count": len(report.scanned_assets),
                "component_count": report.total_components,
            })
        
        scans.append(scan_info)
    
    return {"scans": scans}


@router.delete("/scan/{scan_id}")
async def delete_scan(scan_id: UUID):
    """Delete a CBOM scan and its results."""
    if scan_id not in scan_status:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Remove from storage
    scan_status.pop(scan_id, None)
    scan_results.pop(scan_id, None)
    
    logger.info("CBOM scan deleted", scan_id=str(scan_id))
    return {"message": "Scan deleted successfully"}


async def perform_cbom_scan(
    scan_id: UUID,
    assets: List[Asset],
    config: CBOMConfig,
    scanner: QuantumCBOMScanner
):
    """Perform the actual CBOM scanning operation in the background."""
    try:
        scan_status[scan_id] = "running"
        logger.info("Starting CBOM scan execution", scan_id=str(scan_id))
        
        # Perform the scan
        report = await scanner.generate_comprehensive_cbom(assets)
        report.scan_id = scan_id
        
        # Store the results
        scan_results[scan_id] = report
        scan_status[scan_id] = "completed"
        
        logger.info("CBOM scan completed successfully", 
                   scan_id=str(scan_id),
                   component_count=report.total_components)
        
    except Exception as e:
        scan_status[scan_id] = "failed"
        logger.error("CBOM scan failed", 
                    scan_id=str(scan_id), 
                    error=str(e))


# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint for the CBOM engine."""
    return {
        "service": "CBOM Engine",
        "status": "healthy",
        "version": "1.0.0"
    }
