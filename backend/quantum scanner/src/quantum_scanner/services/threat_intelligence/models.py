"""Data models for Threat Intelligence service."""

from datetime import datetime
from enum import Enum
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, HttpUrl


class SeverityLevel(str, Enum):
    """Threat severity levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ThreatType(str, Enum):
    """Types of quantum threats."""
    ALGORITHM_BREAK = "algorithm_break"
    IMPLEMENTATION_FLAW = "implementation_flaw"
    HARDWARE_VULNERABILITY = "hardware_vulnerability"
    RESEARCH_ADVANCEMENT = "research_advancement"
    POLICY_CHANGE = "policy_change"


class FeedType(str, Enum):
    """Types of threat intelligence feeds."""
    CVE_FEED = "cve_feed"
    RESEARCH_FEED = "research_feed"
    VENDOR_ADVISORY = "vendor_advisory"
    QUANTUM_NEWS = "quantum_news"
    NIST_UPDATES = "nist_updates"


class Vulnerability(BaseModel):
    """Cryptographic vulnerability information."""
    id: UUID = Field(default_factory=uuid4)
    cve_id: Optional[str] = Field(None, description="CVE identifier if available")
    title: str = Field(..., description="Vulnerability title")
    description: str = Field(..., description="Detailed description")
    affected_algorithms: List[str] = Field(default_factory=list)
    affected_implementations: List[str] = Field(default_factory=list)
    severity: SeverityLevel
    threat_type: ThreatType
    quantum_relevant: bool = Field(default=False, description="Quantum computing related")
    cvss_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    published_date: datetime = Field(..., description="Publication date")
    last_modified: datetime = Field(default_factory=datetime.utcnow)
    references: List[HttpUrl] = Field(default_factory=list)
    mitigation_advice: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ResearchAlert(BaseModel):
    """Research advancement alert."""
    id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., description="Research title")
    authors: List[str] = Field(default_factory=list)
    institution: str = Field(..., description="Research institution")
    publication: Optional[str] = Field(None, description="Publication venue")
    abstract: str = Field(..., description="Research abstract")
    quantum_impact: str = Field(..., description="Impact on quantum cryptography")
    algorithms_affected: List[str] = Field(default_factory=list)
    significance_score: float = Field(..., ge=0.0, le=1.0, description="Significance rating")
    published_date: datetime = Field(..., description="Publication date")
    arxiv_id: Optional[str] = Field(None, description="arXiv identifier")
    doi: Optional[str] = Field(None, description="DOI identifier")
    keywords: List[str] = Field(default_factory=list)
    summary: str = Field(..., description="Executive summary")
    implications: List[str] = Field(default_factory=list)


class ThreatFeed(BaseModel):
    """Threat intelligence feed configuration."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Feed name")
    feed_type: FeedType
    source_url: HttpUrl = Field(..., description="Feed source URL")
    description: str = Field(..., description="Feed description")
    update_frequency: int = Field(..., description="Update frequency in hours")
    last_updated: Optional[datetime] = Field(None)
    active: bool = Field(default=True)
    authentication_required: bool = Field(default=False)
    api_key_required: bool = Field(default=False)
    rate_limit_per_hour: Optional[int] = Field(None)
    filters: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ThreatIntelligence(BaseModel):
    """Aggregated threat intelligence item."""
    id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., description="Intelligence title")
    description: str = Field(..., description="Detailed description")
    threat_type: ThreatType
    severity: SeverityLevel
    confidence_level: float = Field(..., ge=0.0, le=1.0, description="Confidence in intelligence")
    source_feeds: List[str] = Field(default_factory=list, description="Source feed names")
    quantum_relevance: float = Field(..., ge=0.0, le=1.0, description="Quantum relevance score")
    affected_systems: List[str] = Field(default_factory=list)
    indicators: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    first_seen: datetime = Field(default_factory=datetime.utcnow)
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    tags: List[str] = Field(default_factory=list)
    references: List[HttpUrl] = Field(default_factory=list)


class ThreatReport(BaseModel):
    """Comprehensive threat intelligence report."""
    id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., description="Report title")
    report_period_start: datetime = Field(..., description="Report period start")
    report_period_end: datetime = Field(..., description="Report period end")
    vulnerabilities: List[Vulnerability] = Field(default_factory=list)
    research_alerts: List[ResearchAlert] = Field(default_factory=list)
    threat_intelligence: List[ThreatIntelligence] = Field(default_factory=list)
    trending_threats: List[str] = Field(default_factory=list)
    severity_breakdown: Dict[str, int] = Field(default_factory=dict)
    quantum_threat_level: float = Field(default=0.0, ge=0.0, le=1.0)
    key_findings: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    executive_summary: str = Field(..., description="Executive summary")
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class MonitoringConfig(BaseModel):
    """Configuration for threat monitoring."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Configuration name")
    enabled_feeds: List[UUID] = Field(default_factory=list)
    alert_thresholds: Dict[str, float] = Field(default_factory=dict)
    notification_channels: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    algorithms_of_interest: List[str] = Field(default_factory=list)
    minimum_severity: SeverityLevel = Field(default=SeverityLevel.MEDIUM)
    auto_analyze: bool = Field(default=True)
    retention_days: int = Field(default=365, gt=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ThreatAnalysis(BaseModel):
    """Analysis of threat intelligence."""
    id: UUID = Field(default_factory=uuid4)
    intelligence_id: UUID
    analysis_type: str = Field(..., description="Type of analysis performed")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Calculated risk score")
    impact_assessment: Dict[str, Any] = Field(default_factory=dict)
    affected_assets: List[str] = Field(default_factory=list)
    mitigation_strategies: List[str] = Field(default_factory=list)
    timeline_estimate: Optional[str] = Field(None, description="Threat timeline")
    confidence_level: float = Field(..., ge=0.0, le=1.0)
    analyst_notes: str = Field(default="", description="Analyst notes")
    automated_analysis: bool = Field(default=True)
    reviewed_by_human: bool = Field(default=False)
    analysis_date: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ThreatIntelligenceRequest(BaseModel):
    """Request model for threat intelligence scanning."""
    scan_id: UUID = Field(default_factory=uuid4)
    scan_type: str = Field(default="comprehensive", description="Type of scan to perform")
    feeds_to_check: List[str] = Field(default_factory=list, description="Specific feeds to check")
    lookback_days: int = Field(default=30, gt=0, description="How many days back to check")
    keywords: List[str] = Field(default_factory=list, description="Keywords to search for")
    minimum_severity: SeverityLevel = Field(default=SeverityLevel.LOW)
    include_research: bool = Field(default=True, description="Include research alerts")
    include_cves: bool = Field(default=True, description="Include CVE data")
    enable_monitoring: bool = Field(default=False, description="Enable continuous monitoring")
    monitoring_interval_hours: Optional[int] = Field(None, description="Monitoring interval")


class ThreatIntelligenceResponse(BaseModel):
    """Response model for threat intelligence scanning."""
    scan_id: UUID
    threats: List[ThreatIntelligence] = Field(default_factory=list)
    cve_alerts: List[Vulnerability] = Field(default_factory=list, alias="vulnerabilities") 
    research_alerts: List[ResearchAlert] = Field(default_factory=list)
    total_threats: int = Field(default=0)
    high_severity_count: int = Field(default=0)
    quantum_relevant_count: int = Field(default=0)
    scan_duration: str = Field(default="0s")
    next_scan: Optional[datetime] = Field(None)
    recommendations: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CVEAlert(BaseModel):
    """CVE alert model (alias for Vulnerability for API compatibility)."""
    id: UUID = Field(default_factory=uuid4)
    cve_id: Optional[str] = Field(None, description="CVE identifier")
    title: str = Field(..., description="CVE title")
    description: str = Field(..., description="CVE description")
    severity: SeverityLevel
    cvss_score: Optional[float] = Field(None, ge=0.0, le=10.0)
    published_date: datetime
    quantum_relevant: bool = Field(default=False)
    affected_algorithms: List[str] = Field(default_factory=list)
    references: List[HttpUrl] = Field(default_factory=list)


class ThreatLevel(str, Enum):
    """Threat level enumeration for compatibility."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlertConfiguration(BaseModel):
    """Alert configuration model."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Configuration name")
    enabled: bool = Field(default=True)
    severity_threshold: SeverityLevel = Field(default=SeverityLevel.MEDIUM)
    notification_channels: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    auto_escalate: bool = Field(default=False)
    escalation_threshold: SeverityLevel = Field(default=SeverityLevel.HIGH)
    quiet_hours_start: Optional[str] = Field(None, description="Quiet hours start (HH:MM)")
    quiet_hours_end: Optional[str] = Field(None, description="Quiet hours end (HH:MM)")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
