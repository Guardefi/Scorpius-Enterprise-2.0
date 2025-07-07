"""
Security analysis router with Slither, Manticore, and Mythril integration
"""
import asyncio
import subprocess
import tempfile
import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
import redis.asyncio as redis

from ..models.security import (
    SecurityScan, Vulnerability, ScanLog, ScanStatus, SeverityLevel,
    get_security_db
)
from ..routers.auth import get_verified_user
from ..models.user import User
from ..core.config import settings

router = APIRouter(prefix="/security", tags=["security"])

# Request/Response models
class ScanRequest(BaseModel):
    tool: str  # slither, manticore, mythril
    target_type: str  # contract, address, file
    target: str  # contract code, file path, or address
    config: Optional[dict] = None

class ScanResponse(BaseModel):
    id: int
    tool: str
    target_type: str
    status: str
    progress: float
    vulnerabilities_found: int
    warnings_found: int
    info_found: int
    created_at: str

class VulnerabilityResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    category: str
    file_path: Optional[str]
    line_number: Optional[int]
    function_name: Optional[str]
    recommendation: Optional[str]
    confidence: Optional[str]
    is_false_positive: bool

# Security analysis service
class SecurityAnalysisService:
    def __init__(self):
        self.redis_client = None
    
    async def get_redis(self):
        if not self.redis_client:
            self.redis_client = redis.from_url(settings.REDIS_URL)
        return self.redis_client
    
    async def run_slither_analysis(self, target: str, config: dict, scan_id: int):
        """Run Slither analysis on smart contract"""
        try:
            # Create temporary file for contract
            with tempfile.NamedTemporaryFile(mode='w', suffix='.sol', delete=False) as f:
                f.write(target)
                contract_path = f.name
            
            # Prepare Slither command
            cmd = [
                'slither', contract_path,
                '--json', '-',
                '--disable-color'
            ]
            
            # Add custom detectors if specified
            if config and 'detectors' in config:
                cmd.extend(['--detect', ','.join(config['detectors'])])
            
            # Run Slither
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            # Clean up temporary file
            os.unlink(contract_path)
            
            if process.returncode == 0:
                return json.loads(stdout.decode())
            else:
                raise Exception(f"Slither failed: {stderr.decode()}")
                
        except Exception as e:
            raise Exception(f"Slither analysis error: {str(e)}")
    
    async def run_manticore_analysis(self, target: str, config: dict, scan_id: int):
        """Run Manticore symbolic execution"""
        try:
            # Create temporary file for contract
            with tempfile.NamedTemporaryFile(mode='w', suffix='.sol', delete=False) as f:
                f.write(target)
                contract_path = f.name
            
            # Create Manticore Python script
            manticore_script = f"""
import json
from manticore.ethereum import ManticoreEVM
from manticore.core.smtlib import Operators

# Initialize Manticore
m = ManticoreEVM()

# Create account
user_account = m.create_account(balance=1000)

# Compile and deploy contract
with open('{contract_path}', 'r') as f:
    source_code = f.read()

contract_account = m.solidity_create_contract(source_code, owner=user_account)

# Run symbolic execution
m.run()

# Collect results
results = {{
    "vulnerabilities": [],
    "warnings": [],
    "info": []
}}

# Analyze findings
for state in m.terminated_states:
    if state.context.get('finding'):
        finding = state.context['finding']
        results["vulnerabilities"].append({{
            "title": finding.get("title", "Unknown vulnerability"),
            "description": finding.get("description", ""),
            "severity": finding.get("severity", "medium")
        }})

print(json.dumps(results))
"""
            
            # Write Manticore script
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(manticore_script)
                script_path = f.name
            
            # Run Manticore
            process = await asyncio.create_subprocess_exec(
                'python', script_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            # Clean up temporary files
            os.unlink(contract_path)
            os.unlink(script_path)
            
            if process.returncode == 0:
                return json.loads(stdout.decode())
            else:
                raise Exception(f"Manticore failed: {stderr.decode()}")
                
        except Exception as e:
            raise Exception(f"Manticore analysis error: {str(e)}")
    
    async def run_mythril_analysis(self, target: str, config: dict, scan_id: int):
        """Run Mythril analysis"""
        try:
            # Create temporary file for contract
            with tempfile.NamedTemporaryFile(mode='w', suffix='.sol', delete=False) as f:
                f.write(target)
                contract_path = f.name
            
            # Prepare Mythril command
            cmd = [
                'myth', 'analyze',
                contract_path,
                '-o', 'json'
            ]
            
            # Add execution timeout
            if config and 'timeout' in config:
                cmd.extend(['--execution-timeout', str(config['timeout'])])
            
            # Run Mythril
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            # Clean up temporary file
            os.unlink(contract_path)
            
            if process.returncode == 0:
                return json.loads(stdout.decode())
            else:
                raise Exception(f"Mythril failed: {stderr.decode()}")
                
        except Exception as e:
            raise Exception(f"Mythril analysis error: {str(e)}")
    
    async def process_scan_results(self, results: dict, scan_id: int, db: Session):
        """Process and store scan results"""
        scan = db.query(SecurityScan).filter(SecurityScan.id == scan_id).first()
        if not scan:
            return
        
        vulnerability_count = 0
        warning_count = 0
        info_count = 0
        
        # Process vulnerabilities from different tools
        vulnerabilities = []
        
        if scan.tool == "slither":
            vulnerabilities = results.get("results", {}).get("detectors", [])
        elif scan.tool == "manticore":
            vulnerabilities = results.get("vulnerabilities", [])
        elif scan.tool == "mythril":
            vulnerabilities = results.get("issues", [])
        
        # Store vulnerabilities
        for vuln_data in vulnerabilities:
            severity = self.map_severity(vuln_data.get("impact", "medium"))
            
            vulnerability = Vulnerability(
                scan_id=scan_id,
                title=vuln_data.get("title", vuln_data.get("check", "Unknown")),
                description=vuln_data.get("description", ""),
                severity=severity,
                category=vuln_data.get("check", vuln_data.get("type", "unknown")),
                file_path=vuln_data.get("elements", [{}])[0].get("source_mapping", {}).get("filename"),
                line_number=vuln_data.get("elements", [{}])[0].get("source_mapping", {}).get("lines", [None])[0],
                function_name=vuln_data.get("elements", [{}])[0].get("name"),
                confidence=vuln_data.get("confidence", "medium"),
                metadata=vuln_data
            )
            
            db.add(vulnerability)
            
            # Count by severity
            if severity == SeverityLevel.CRITICAL or severity == SeverityLevel.HIGH:
                vulnerability_count += 1
            elif severity == SeverityLevel.MEDIUM:
                warning_count += 1
            else:
                info_count += 1
        
        # Update scan results
        scan.vulnerabilities_found = vulnerability_count
        scan.warnings_found = warning_count
        scan.info_found = info_count
        scan.status = ScanStatus.COMPLETED
        scan.progress = 100.0
        
        db.commit()
        
        # Publish results to Redis for real-time updates
        redis_client = await self.get_redis()
        await redis_client.publish("scan_results", json.dumps({
            "scan_id": scan_id,
            "user_id": scan.user_id,
            "tool": scan.tool,
            "status": "completed",
            "vulnerabilities": vulnerability_count,
            "warnings": warning_count,
            "info": info_count
        }))
    
    def map_severity(self, impact: str) -> SeverityLevel:
        """Map tool-specific severity to our enum"""
        impact_lower = impact.lower()
        if impact_lower in ["critical", "high"]:
            return SeverityLevel.CRITICAL
        elif impact_lower in ["medium"]:
            return SeverityLevel.MEDIUM
        elif impact_lower in ["low"]:
            return SeverityLevel.LOW
        else:
            return SeverityLevel.INFO

# Initialize service
security_service = SecurityAnalysisService()

@router.post("/scan", response_model=ScanResponse)
async def start_security_scan(
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_security_db)
):
    """Start a security analysis scan"""
    
    # Validate tool
    if scan_request.tool not in ["slither", "manticore", "mythril"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tool. Must be one of: slither, manticore, mythril"
        )
    
    # Create scan record
    scan = SecurityScan(
        user_id=current_user.id,
        tool=scan_request.tool,
        target_type=scan_request.target_type,
        target=scan_request.target,
        scan_config=scan_request.config or {}
    )
    
    db.add(scan)
    db.commit()
    db.refresh(scan)
    
    # Start background scan
    background_tasks.add_task(run_scan_async, scan.id, scan_request)
    
    return ScanResponse(
        id=scan.id,
        tool=scan.tool,
        target_type=scan.target_type,
        status=scan.status.value,
        progress=scan.progress,
        vulnerabilities_found=scan.vulnerabilities_found,
        warnings_found=scan.warnings_found,
        info_found=scan.info_found,
        created_at=scan.created_at.isoformat()
    )

@router.get("/scans", response_model=List[ScanResponse])
async def get_user_scans(
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_security_db)
):
    """Get user's security scans"""
    scans = db.query(SecurityScan).filter(
        SecurityScan.user_id == current_user.id
    ).order_by(SecurityScan.created_at.desc()).all()
    
    return [
        ScanResponse(
            id=scan.id,
            tool=scan.tool,
            target_type=scan.target_type,
            status=scan.status.value,
            progress=scan.progress,
            vulnerabilities_found=scan.vulnerabilities_found,
            warnings_found=scan.warnings_found,
            info_found=scan.info_found,
            created_at=scan.created_at.isoformat()
        ) for scan in scans
    ]

@router.get("/scans/{scan_id}/vulnerabilities", response_model=List[VulnerabilityResponse])
async def get_scan_vulnerabilities(
    scan_id: int,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_security_db)
):
    """Get vulnerabilities for a specific scan"""
    # Verify scan belongs to user
    scan = db.query(SecurityScan).filter(
        SecurityScan.id == scan_id,
        SecurityScan.user_id == current_user.id
    ).first()
    
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan not found"
        )
    
    vulnerabilities = db.query(Vulnerability).filter(
        Vulnerability.scan_id == scan_id
    ).all()
    
    return [
        VulnerabilityResponse(
            id=vuln.id,
            title=vuln.title,
            description=vuln.description,
            severity=vuln.severity.value,
            category=vuln.category,
            file_path=vuln.file_path,
            line_number=vuln.line_number,
            function_name=vuln.function_name,
            recommendation=vuln.recommendation,
            confidence=vuln.confidence,
            is_false_positive=vuln.is_false_positive
        ) for vuln in vulnerabilities
    ]

@router.patch("/vulnerabilities/{vuln_id}")
async def update_vulnerability(
    vuln_id: int,
    is_false_positive: Optional[bool] = None,
    is_acknowledged: Optional[bool] = None,
    current_user: User = Depends(get_verified_user),
    db: Session = Depends(get_security_db)
):
    """Update vulnerability status"""
    # Verify vulnerability belongs to user's scan
    vulnerability = db.query(Vulnerability).join(SecurityScan).filter(
        Vulnerability.id == vuln_id,
        SecurityScan.user_id == current_user.id
    ).first()
    
    if not vulnerability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vulnerability not found"
        )
    
    if is_false_positive is not None:
        vulnerability.is_false_positive = is_false_positive
    
    if is_acknowledged is not None:
        vulnerability.is_acknowledged = is_acknowledged
    
    db.commit()
    
    return {"message": "Vulnerability updated successfully"}

async def run_scan_async(scan_id: int, scan_request: ScanRequest):
    """Run security scan asynchronously"""
    from ..models.security import get_security_db
    
    db = next(get_security_db())
    
    try:
        # Update scan status
        scan = db.query(SecurityScan).filter(SecurityScan.id == scan_id).first()
        scan.status = ScanStatus.RUNNING
        scan.progress = 0.0
        db.commit()
        
        # Run appropriate tool
        if scan_request.tool == "slither":
            results = await security_service.run_slither_analysis(
                scan_request.target, scan_request.config or {}, scan_id
            )
        elif scan_request.tool == "manticore":
            results = await security_service.run_manticore_analysis(
                scan_request.target, scan_request.config or {}, scan_id
            )
        elif scan_request.tool == "mythril":
            results = await security_service.run_mythril_analysis(
                scan_request.target, scan_request.config or {}, scan_id
            )
        else:
            raise Exception(f"Unknown tool: {scan_request.tool}")
        
        # Process results
        await security_service.process_scan_results(results, scan_id, db)
        
    except Exception as e:
        # Update scan as failed
        scan = db.query(SecurityScan).filter(SecurityScan.id == scan_id).first()
        scan.status = ScanStatus.FAILED
        db.commit()
        
        # Log error
        log_entry = ScanLog(
            scan_id=scan_id,
            level="error",
            message=str(e),
            component=scan_request.tool
        )
        db.add(log_entry)
        db.commit()
        
        print(f"Scan {scan_id} failed: {e}")
    
    finally:
        db.close()
