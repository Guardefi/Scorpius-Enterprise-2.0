"""
Hybrid Inspector Data Models.

Defines data structures for hybrid cryptography analysis and reporting.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from uuid import UUID, uuid4


class ProtocolType(str, Enum):
    """Types of protocols that can be analyzed."""
    TLS = "tls"
    SSH = "ssh"
    IPSEC = "ipsec"
    QUIC = "quic"
    HTTP2 = "http2"
    MQTT = "mqtt"
    COAP = "coap"
    WEBSOCKET = "websocket"
    CUSTOM = "custom"


class CryptoMechanism(str, Enum):
    """Cryptographic mechanisms in hybrid configurations."""
    KEY_EXCHANGE = "key_exchange"
    DIGITAL_SIGNATURE = "digital_signature"
    SYMMETRIC_ENCRYPTION = "symmetric_encryption"
    AUTHENTICATION = "authentication"
    INTEGRITY = "integrity"


class HybridRiskLevel(str, Enum):
    """Risk levels for hybrid configurations."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class HybridConfiguration(BaseModel):
    """Represents a hybrid cryptographic configuration."""
    
    mechanism: CryptoMechanism
    classical_algorithm: str
    pqc_algorithm: Optional[str] = None
    is_hybrid: bool = False
    fallback_enabled: bool = False
    negotiation_method: Optional[str] = None
    implementation_notes: List[str] = Field(default_factory=list)
    
    @property
    def is_quantum_safe(self) -> bool:
        """Check if configuration is quantum-safe."""
        return self.pqc_algorithm is not None
    
    @property
    def transition_ready(self) -> bool:
        """Check if configuration supports smooth transition."""
        return self.is_hybrid and self.fallback_enabled


class HybridMode(str, Enum):
    """Hybrid cryptographic modes."""
    PARALLEL = "parallel"
    SEQUENTIAL = "sequential"
    FALLBACK = "fallback"
    NESTED = "nested"


class SecurityLevel(str, Enum):
    """Security levels for hybrid implementations."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class CryptoProtocol(str, Enum):
    """Cryptographic protocols."""
    TLS = "tls"
    SSH = "ssh"
    IPSEC = "ipsec"
    QUIC = "quic"
    HTTP2 = "http2"
    MQTT = "mqtt"
    COAP = "coap"
    OTHER = "other"


class HybridInspectorRequest(BaseModel):
    """Request model for hybrid inspector scanning."""
    scan_id: UUID = Field(default_factory=uuid4)
    targets: List[str] = Field(..., description="Targets to scan (files, directories, URLs)")
    assess_agility: bool = Field(default=True, description="Assess cryptographic agility")
    deep_analysis: bool = Field(default=False, description="Perform deep analysis")
    enable_monitoring: bool = Field(default=False, description="Enable continuous monitoring")
    monitoring_interval_hours: Optional[int] = Field(None, description="Monitoring interval")
    protocols_to_analyze: List[str] = Field(default_factory=list, description="Specific protocols to analyze")
    scan_configuration: Dict[str, Any] = Field(default_factory=dict, description="Scan configuration")


class HybridAnalysisRequest(BaseModel):
    """Request model for hybrid analysis (alias for compatibility)."""
    scan_id: UUID = Field(default_factory=uuid4)
    targets: List[str] = Field(..., description="Targets to analyze")
    deep_analysis: bool = Field(default=False, description="Perform deep analysis")
    protocols_focus: List[str] = Field(default_factory=list, description="Focus on specific protocols")


class HybridImplementation(BaseModel):
    """Detected hybrid cryptographic implementation."""
    id: str = Field(..., description="Unique identifier")
    name: str = Field(..., description="Implementation name")
    location: str = Field(..., description="File or system location")
    line_number: Optional[int] = Field(None, description="Line number in source code")
    traditional_algorithm: str = Field(..., description="Traditional cryptographic algorithm")
    pqc_algorithm: str = Field(..., description="Post-quantum cryptographic algorithm")
    hybrid_mode: HybridMode = Field(..., description="Hybrid implementation mode")
    security_level: SecurityLevel = Field(..., description="Security level assessment")
    implementation_details: Dict[str, Any] = Field(default_factory=dict, description="Implementation details")
    strengths: List[str] = Field(default_factory=list, description="Implementation strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Implementation weaknesses")
    recommendations: List[str] = Field(default_factory=list, description="Improvement recommendations")


class ProtocolAnalysis(BaseModel):
    """Analysis of a cryptographic protocol."""
    id: str = Field(..., description="Unique identifier")
    protocol: CryptoProtocol = Field(..., description="Protocol type")
    version: str = Field(..., description="Protocol version")
    location: str = Field(..., description="Location or endpoint")
    algorithms_detected: List[str] = Field(default_factory=list, description="Detected algorithms")
    quantum_vulnerability: str = Field(..., description="Quantum vulnerability level")
    hybrid_support: bool = Field(default=False, description="Hybrid cryptography support")
    cipher_suites: List[str] = Field(default_factory=list, description="Supported cipher suites")
    key_exchange_methods: List[str] = Field(default_factory=list, description="Key exchange methods")
    signature_algorithms: List[str] = Field(default_factory=list, description="Signature algorithms")
    recommendations: List[str] = Field(default_factory=list, description="Security recommendations")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class CryptoAgility(BaseModel):
    """Cryptographic agility assessment."""
    algorithm_flexibility: float = Field(..., ge=0.0, le=1.0, description="Algorithm flexibility score")
    key_management_agility: float = Field(..., ge=0.0, le=1.0, description="Key management agility score")
    protocol_agility: float = Field(..., ge=0.0, le=1.0, description="Protocol agility score")
    overall_score: float = Field(..., ge=0.0, le=1.0, description="Overall agility score")
    quantum_readiness: str = Field(..., description="Quantum readiness level")
    migration_complexity: str = Field(..., description="Migration complexity assessment")
    recommendations: List[str] = Field(default_factory=list, description="Agility improvement recommendations")
    gaps_identified: List[str] = Field(default_factory=list, description="Agility gaps identified")
    strengths: List[str] = Field(default_factory=list, description="Current agility strengths")
    timeline_estimate: Optional[str] = Field(None, description="Migration timeline estimate")


class HybridReport(BaseModel):
    """Comprehensive hybrid cryptography analysis report."""
    
    id: str = Field(..., description="Unique report identifier")
    target: str
    scan_timestamp: datetime
    protocols_analyzed: List[ProtocolAnalysis]
    overall_risk_level: HybridRiskLevel
    quantum_readiness_score: float = Field(ge=0.0, le=1.0)
    
    # Summary statistics
    total_protocols: int = 0
    pqc_enabled_protocols: int = 0
    hybrid_protocols: int = 0
    vulnerable_protocols: int = 0
    
    # Detailed findings
    recommendations: List[str] = Field(default_factory=list)
    critical_issues: List[str] = Field(default_factory=list)
    migration_priorities: List[str] = Field(default_factory=list)
    compliance_notes: List[str] = Field(default_factory=list)
    
    # Metadata
    scan_duration_seconds: float = 0.0
    scanner_version: str = "1.0.0"
    
    def __init__(self, **data):
        super().__init__(**data)
        self._calculate_summary_stats()
        self._generate_recommendations()
    
    def _calculate_summary_stats(self):
        """Calculate summary statistics from protocol analyses."""
        self.total_protocols = len(self.protocols_analyzed)
        self.pqc_enabled_protocols = sum(
            1 for p in self.protocols_analyzed if p.pqc_support
        )
        self.hybrid_protocols = sum(
            1 for p in self.protocols_analyzed if p.hybrid_mode
        )
        self.vulnerable_protocols = sum(
            1 for p in self.protocols_analyzed 
            if p.risk_level in [HybridRiskLevel.HIGH, HybridRiskLevel.CRITICAL]
        )
        
        # Calculate overall quantum readiness score
        if self.protocols_analyzed:
            self.quantum_readiness_score = sum(
                p.quantum_readiness_score for p in self.protocols_analyzed
            ) / len(self.protocols_analyzed)
        
        # Determine overall risk level
        risk_levels = [p.risk_level for p in self.protocols_analyzed]
        if HybridRiskLevel.CRITICAL in risk_levels:
            self.overall_risk_level = HybridRiskLevel.CRITICAL
        elif HybridRiskLevel.HIGH in risk_levels:
            self.overall_risk_level = HybridRiskLevel.HIGH
        elif HybridRiskLevel.MEDIUM in risk_levels:
            self.overall_risk_level = HybridRiskLevel.MEDIUM
        else:
            self.overall_risk_level = HybridRiskLevel.LOW
    
    def _generate_recommendations(self):
        """Generate actionable recommendations based on analysis."""
        self.recommendations = []
        self.critical_issues = []
        self.migration_priorities = []
        
        for protocol in self.protocols_analyzed:
            if protocol.risk_level == HybridRiskLevel.CRITICAL:
                self.critical_issues.append(
                    f"{protocol.protocol_type.upper()} on {protocol.endpoint}:{protocol.port} "
                    f"has no quantum-safe cryptography configured"
                )
                self.migration_priorities.append(
                    f"Immediately migrate {protocol.protocol_type.upper()} "
                    f"on {protocol.endpoint} to hybrid PQC mode"
                )
            
            elif protocol.risk_level == HybridRiskLevel.HIGH:
                self.recommendations.append(
                    f"Enable hybrid PQC mode for {protocol.protocol_type.upper()} "
                    f"on {protocol.endpoint}:{protocol.port}"
                )
            
            if not protocol.pqc_support:
                self.recommendations.append(
                    f"Add post-quantum cryptography support to "
                    f"{protocol.protocol_type.upper()} configuration"
                )
            
            if protocol.hybrid_mode and not any(
                config.fallback_enabled for config in protocol.configurations
            ):
                self.recommendations.append(
                    f"Enable fallback mechanisms for {protocol.protocol_type.upper()} "
                    f"hybrid configuration on {protocol.endpoint}"
                )
    
    @property
    def executive_summary(self) -> str:
        """Generate executive summary of findings."""
        return (
            f"Hybrid cryptography analysis of {self.target} revealed "
            f"{self.total_protocols} protocols analyzed with "
            f"{self.quantum_readiness_score:.1%} quantum readiness. "
            f"{self.vulnerable_protocols} protocols require immediate attention. "
            f"Overall risk level: {self.overall_risk_level.upper()}."
        )
    
    @property
    def is_transition_ready(self) -> bool:
        """Check if the target is ready for quantum transition."""
        return (
            self.quantum_readiness_score >= 0.7 and
            self.overall_risk_level in [HybridRiskLevel.LOW, HybridRiskLevel.MEDIUM]
        )


class HybridInspectorResponse(BaseModel):
    """Response model for hybrid inspector scanning."""
    scan_id: UUID
    hybrid_implementations: List[HybridImplementation] = Field(default_factory=list)
    protocol_analyses: List[ProtocolAnalysis] = Field(default_factory=list)
    agility_assessment: Optional[CryptoAgility] = Field(None, description="Cryptographic agility assessment")
    security_score: float = Field(..., ge=0.0, le=1.0, description="Overall security score")
    recommendations: List[str] = Field(default_factory=list, description="Overall recommendations")
    summary: str = Field(default="", description="Executive summary")
    scan_duration: str = Field(default="0s", description="Scan duration")
    targets_scanned: int = Field(default=0, description="Number of targets scanned")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
