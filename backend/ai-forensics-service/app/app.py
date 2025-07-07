"""
SCORPIUS AI BLOCKCHAIN FORENSICS API
FastAPI application for advanced blockchain forensics and investigation capabilities.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import uvicorn

# Import AI Forensics components
from .ai_blockchain_forensics import (
    BlockchainForensicsEngine, 
    initialize_blockchain_forensics,
    ForensicsEventType,
    RiskLevel,
    ComplianceStandard,
    ForensicsAlert,
    TransactionPattern,
    AddressProfile,
    InvestigationCase
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic models for API requests/responses
class AddressInvestigationRequest(BaseModel):
    address: str = Field(..., description="Blockchain address to investigate")
    depth: int = Field(default=3, ge=1, le=10, description="Investigation depth (1-10)")
    include_patterns: bool = Field(default=True, description="Include pattern detection")
    include_compliance: bool = Field(default=True, description="Include compliance checks")

class TransactionAnalysisRequest(BaseModel):
    transactions: List[Dict[str, Any]] = Field(..., description="List of transactions to analyze")
    analysis_type: str = Field(default="anomaly", description="Type of analysis to perform")
    threshold: float = Field(default=0.7, ge=0.0, le=1.0, description="Alert threshold")

class PatternDetectionRequest(BaseModel):
    address_graph: Dict[str, Any] = Field(..., description="Address graph data for pattern detection")
    pattern_types: List[str] = Field(default=["layering", "smurfing", "roundtrip", "mixer"], description="Pattern types to detect")
    time_window: int = Field(default=30, description="Time window in days")

class InvestigationCaseRequest(BaseModel):
    title: str = Field(..., description="Case title")
    description: str = Field(..., description="Case description") 
    investigator: str = Field(..., description="Investigator name")
    priority: str = Field(default="medium", description="Case priority (low, medium, high, critical)")
    tags: List[str] = Field(default_factory=list, description="Case tags")

class EvidenceRequest(BaseModel):
    evidence_type: str = Field(..., description="Type of evidence")
    evidence_data: Dict[str, Any] = Field(..., description="Evidence data")
    notes: str = Field(default="", description="Additional notes")

class ComplianceCheckRequest(BaseModel):
    address: str = Field(..., description="Address to check for compliance")
    standards: List[str] = Field(default=["AML", "KYC", "OFAC"], description="Compliance standards to check")
    include_sanctions: bool = Field(default=True, description="Include sanctions list check")

# FastAPI app
app = FastAPI(
    title="Scorpius AI Blockchain Forensics API",
    description="Advanced AI-powered blockchain forensics and investigation platform",
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

# Global forensics engine instance
forensics_engine: Optional[BlockchainForensicsEngine] = None

@app.on_event("startup")
async def startup_event():
    """Initialize the AI Forensics engine on startup."""
    global forensics_engine
    
    try:
        logger.info("Starting AI Blockchain Forensics API...")
        
        # Initialize forensics engine
        forensics_engine = BlockchainForensicsEngine()
        success = await initialize_blockchain_forensics()
        
        if not success:
            logger.error("Failed to initialize AI Forensics engine")
            raise RuntimeError("AI Forensics engine initialization failed")
        
        logger.info("AI Blockchain Forensics API started successfully")
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down AI Blockchain Forensics API...")

def get_forensics_engine() -> BlockchainForensicsEngine:
    """Get forensics engine instance."""
    if forensics_engine is None:
        raise HTTPException(status_code=500, detail="Forensics engine not initialized")
    return forensics_engine

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "AI Blockchain Forensics API"
    }

# Forensics statistics endpoint
@app.get("/statistics")
async def get_forensics_statistics(
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """Get forensics engine statistics."""
    try:
        stats = await engine.get_forensics_statistics()
        return JSONResponse(content=stats)
    except Exception as e:
        logger.error(f"Error getting forensics statistics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Address investigation endpoint
@app.post("/investigate/address")
async def investigate_address(
    request: AddressInvestigationRequest,
    background_tasks: BackgroundTasks,
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """Investigate a blockchain address for suspicious activity."""
    try:
        result = await engine.investigate_address(
            address=request.address,
            depth=request.depth
        )
        
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error investigating address: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Transaction analysis endpoint
@app.post("/analyze/transactions")
async def analyze_transactions(
    request: TransactionAnalysisRequest,
    background_tasks: BackgroundTasks,
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """Analyze transactions for anomalies and suspicious patterns."""
    try:
        # Use the AI engine for transaction analysis
        anomalies = await engine.ai_engine.analyze_transaction_anomalies(request.transactions)
        
        # Filter by threshold
        filtered_anomalies = [
            anomaly for anomaly in anomalies 
            if anomaly.get("anomaly_score", 0) >= request.threshold
        ]
        
        return JSONResponse(content={
            "total_transactions": len(request.transactions),
            "anomalies_detected": len(filtered_anomalies),
            "threshold_used": request.threshold,
            "anomalies": filtered_anomalies,
            "analysis_timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error analyzing transactions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Pattern detection endpoint
@app.post("/detect/patterns")
async def detect_patterns(
    request: PatternDetectionRequest,
    background_tasks: BackgroundTasks,
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """Detect money laundering and suspicious patterns in address graph."""
    try:
        patterns = await engine.ai_engine.detect_money_laundering_patterns(request.address_graph)
        
        # Filter by requested pattern types
        filtered_patterns = []
        for pattern in patterns:
            if any(pattern_type in pattern.pattern_type.lower() for pattern_type in request.pattern_types):
                filtered_patterns.append({
                    "pattern_type": pattern.pattern_type,
                    "description": pattern.description,
                    "addresses": pattern.addresses,
                    "transactions": pattern.transactions,
                    "time_span_days": pattern.time_span.days,
                    "frequency": pattern.frequency,
                    "total_value": pattern.total_value,
                    "risk_indicators": pattern.risk_indicators,
                    "confidence": pattern.confidence
                })
        
        return JSONResponse(content={
            "patterns_detected": len(filtered_patterns),
            "pattern_types_requested": request.pattern_types,
            "time_window_days": request.time_window,
            "patterns": filtered_patterns,
            "analysis_timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error detecting patterns: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Compliance check endpoint
@app.post("/compliance/check")
async def check_compliance(
    request: ComplianceCheckRequest,
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """Check address compliance against various standards."""
    try:
        # Build basic address profile for compliance check
        profile = await engine._build_address_profile(request.address, depth=1)
        
        # Check compliance violations
        violations = await engine._check_compliance_violations(request.address, profile)
        
        # Check sanctions list if requested
        sanctions_hit = False
        if request.include_sanctions:
            sanctions_hit = await engine._check_sanctions_list(request.address)
        
        return JSONResponse(content={
            "address": request.address,
            "standards_checked": request.standards,
            "violations_found": len(violations),
            "sanctions_hit": sanctions_hit,
            "compliance_status": "FAIL" if violations or sanctions_hit else "PASS",
            "violations": violations,
            "check_timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error checking compliance: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Investigation case management endpoints
@app.post("/cases/create")
async def create_investigation_case(
    request: InvestigationCaseRequest,
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """Create a new investigation case."""
    try:
        # Map priority string to RiskLevel enum
        priority_map = {
            "low": RiskLevel.LOW,
            "medium": RiskLevel.MEDIUM,
            "high": RiskLevel.HIGH,
            "critical": RiskLevel.CRITICAL
        }
        priority = priority_map.get(request.priority.lower(), RiskLevel.MEDIUM)
        
        case_id = await engine.create_investigation_case(
            title=request.title,
            description=request.description,
            investigator=request.investigator,
            priority=priority
        )
        
        return JSONResponse(content={
            "case_id": case_id,
            "title": request.title,
            "investigator": request.investigator,
            "priority": request.priority,
            "created_at": datetime.now().isoformat(),
            "status": "active"
        })
    except Exception as e:
        logger.error(f"Error creating investigation case: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cases")
async def list_investigation_cases(
    status: Optional[str] = Query(None, description="Filter by case status"),
    investigator: Optional[str] = Query(None, description="Filter by investigator"),
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """List investigation cases with optional filtering."""
    try:
        # Get all cases (in real implementation, this would be from database)
        cases = []
        for case_id, case in engine.investigation_cases.items():
            case_data = {
                "case_id": case_id,
                "title": case.title,
                "description": case.description,
                "investigator": case.investigator,
                "status": case.status,
                "priority": case.priority.name.lower(),
                "created_at": case.created_at.isoformat(),
                "updated_at": case.updated_at.isoformat(),
                "alert_count": len(case.alerts),
                "tags": case.tags
            }
            
            # Apply filters
            if status and case.status != status:
                continue
            if investigator and case.investigator != investigator:
                continue
            
            cases.append(case_data)
        
        return JSONResponse(content={
            "total_cases": len(cases),
            "cases": cases,
            "filters_applied": {
                "status": status,
                "investigator": investigator
            }
        })
    except Exception as e:
        logger.error(f"Error listing investigation cases: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cases/{case_id}")
async def get_investigation_case(
    case_id: str,
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """Get detailed investigation case information."""
    try:
        if case_id not in engine.investigation_cases:
            raise HTTPException(status_code=404, detail="Case not found")
        
        case = engine.investigation_cases[case_id]
        
        # Get associated alerts
        alerts = []
        for alert_id in case.alerts:
            if alert_id in engine.alerts:
                alert = engine.alerts[alert_id]
                alerts.append({
                    "id": alert.id,
                    "event_type": alert.event_type.value,
                    "risk_level": alert.risk_level.name.lower(),
                    "confidence": alert.confidence,
                    "description": alert.description,
                    "timestamp": alert.timestamp.isoformat()
                })
        
        return JSONResponse(content={
            "case_id": case_id,
            "title": case.title,
            "description": case.description,
            "investigator": case.investigator,
            "status": case.status,
            "priority": case.priority.name.lower(),
            "created_at": case.created_at.isoformat(),
            "updated_at": case.updated_at.isoformat(),
            "alerts": alerts,
            "evidence_count": len(case.evidence),
            "timeline_events": len(case.timeline),
            "suspects": case.suspects,
            "tags": case.tags,
            "notes": case.notes
        })
    except Exception as e:
        logger.error(f"Error getting investigation case: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cases/{case_id}/evidence")
async def add_evidence_to_case(
    case_id: str,
    request: EvidenceRequest,
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """Add evidence to an investigation case."""
    try:
        success = await engine.add_evidence_to_case(
            case_id=case_id,
            evidence_type=request.evidence_type,
            evidence_data=request.evidence_data
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="Failed to add evidence")
        
        return JSONResponse(content={
            "message": "Evidence added successfully",
            "case_id": case_id,
            "evidence_type": request.evidence_type,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Error adding evidence to case: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cases/{case_id}/report")
async def generate_investigation_report(
    case_id: str,
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """Generate comprehensive investigation report."""
    try:
        report = await engine.generate_investigation_report(case_id)
        return JSONResponse(content=report)
    except Exception as e:
        logger.error(f"Error generating investigation report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Alert management endpoints
@app.get("/alerts")
async def get_forensics_alerts(
    risk_level: Optional[str] = Query(None, description="Filter by risk level"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of alerts to return"),
    engine: BlockchainForensicsEngine = Depends(get_forensics_engine)
):
    """Get forensics alerts with optional filtering."""
    try:
        alerts = []
        count = 0
        
        for alert_id, alert in engine.alerts.items():
            if count >= limit:
                break
            
            # Apply filters
            if risk_level and alert.risk_level.name.lower() != risk_level.lower():
                continue
            if event_type and alert.event_type.value != event_type:
                continue
            
            alerts.append({
                "id": alert.id,
                "event_type": alert.event_type.value,
                "risk_level": alert.risk_level.name.lower(),
                "confidence": alert.confidence,
                "description": alert.description,
                "transaction_count": len(alert.transaction_hashes),
                "address_count": len(alert.addresses_involved),
                "timestamp": alert.timestamp.isoformat(),
                "follow_up_required": alert.follow_up_required
            })
            count += 1
        
        return JSONResponse(content={
            "total_alerts": len(alerts),
            "alerts": alerts,
            "filters_applied": {
                "risk_level": risk_level,
                "event_type": event_type,
                "limit": limit
            }
        })
    except Exception as e:
        logger.error(f"Error getting forensics alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8009,
        reload=True,
        log_level="info"
    ) 