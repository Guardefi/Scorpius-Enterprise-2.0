"""
Key Audit Service Data Models

Models for HSM/KMS quantum readiness assessment and key store evaluation.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class KeyStoreType(str, Enum):
    """Types of key stores that can be audited."""
    HSM = "hsm"
    KMS = "kms"
    SOFTWARE = "software"
    CLOUD_HSM = "cloud_hsm"
    HARDWARE_TOKEN = "hardware_token"


class QuantumReadinessLevel(str, Enum):
    """Quantum readiness assessment levels."""
    NOT_READY = "not_ready"
    PARTIALLY_READY = "partially_ready"
    READY = "ready"
    ADVANCED = "advanced"
    UNKNOWN = "unknown"


class CryptographicCapability(BaseModel):
    """Represents a cryptographic capability of a key store."""
    algorithm: str = Field(..., description="Cryptographic algorithm name")
    key_sizes: List[int] = Field(default_factory=list, description="Supported key sizes")
    quantum_safe: bool = Field(..., description="Whether algorithm is quantum-safe")
    fips_approved: bool = Field(default=False, description="FIPS 140-2/3 approval status")
    performance_rating: Optional[str] = Field(None, description="Performance assessment")


class KeyStore(BaseModel):
    """Represents a key store or cryptographic device."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Key store name")
    type: KeyStoreType = Field(..., description="Type of key store")
    vendor: str = Field(..., description="Vendor/manufacturer")
    model: str = Field(..., description="Model number or identifier")
    firmware_version: Optional[str] = Field(None, description="Firmware version")
    location: Optional[str] = Field(None, description="Physical or logical location")
    capabilities: List[CryptographicCapability] = Field(
        default_factory=list,
        description="Supported cryptographic capabilities"
    )
    metadata: Dict[str, Any] = Field(default_factory=dict)


class HSMCapability(BaseModel):
    """HSM-specific capability assessment."""
    fips_level: Optional[str] = Field(None, description="FIPS 140-2/3 certification level")
    common_criteria: Optional[str] = Field(None, description="Common Criteria certification")
    pqc_support: bool = Field(default=False, description="Post-quantum crypto support")
    key_generation: List[str] = Field(default_factory=list, description="Key generation algorithms")
    digital_signatures: List[str] = Field(default_factory=list, description="Signature algorithms")
    key_exchange: List[str] = Field(default_factory=list, description="Key exchange algorithms")
    hash_functions: List[str] = Field(default_factory=list, description="Hash functions")
    random_number_generation: bool = Field(default=False, description="Hardware RNG capability")


class KMSAssessment(BaseModel):
    """KMS-specific assessment results."""
    encryption_at_rest: bool = Field(default=False, description="Encryption at rest support")
    encryption_in_transit: bool = Field(default=False, description="Encryption in transit support")
    key_rotation: bool = Field(default=False, description="Automatic key rotation")
    access_controls: List[str] = Field(default_factory=list, description="Access control mechanisms")
    audit_logging: bool = Field(default=False, description="Audit logging capability")
    multi_tenancy: bool = Field(default=False, description="Multi-tenant support")
    api_security: List[str] = Field(default_factory=list, description="API security features")


class VulnerabilityFinding(BaseModel):
    """Security vulnerability or weakness finding."""
    id: UUID = Field(default_factory=uuid4)
    severity: str = Field(..., description="Vulnerability severity (critical, high, medium, low)")
    title: str = Field(..., description="Vulnerability title")
    description: str = Field(..., description="Detailed description")
    algorithm: Optional[str] = Field(None, description="Affected algorithm")
    quantum_impact: str = Field(..., description="Impact from quantum attacks")
    remediation: str = Field(..., description="Recommended remediation")
    cve_id: Optional[str] = Field(None, description="CVE identifier if available")


class MigrationRecommendation(BaseModel):
    """Post-quantum migration recommendation."""
    current_algorithm: str = Field(..., description="Current vulnerable algorithm")
    recommended_algorithm: str = Field(..., description="Recommended PQC algorithm")
    migration_effort: str = Field(..., description="Estimated migration effort")
    performance_impact: str = Field(..., description="Expected performance impact")
    compliance_notes: Optional[str] = Field(None, description="Compliance considerations")
    timeline: Optional[str] = Field(None, description="Recommended timeline")


class KeyAuditRequest(BaseModel):
    """Request for key store audit."""
    target: str = Field(..., description="Target key store identifier")
    store_type: KeyStoreType = Field(..., description="Type of key store")
    connection_params: Dict[str, Any] = Field(
        default_factory=dict,
        description="Connection parameters (credentials, endpoints, etc.)"
    )
    scan_depth: str = Field(
        default="standard",
        description="Audit depth (basic, standard, comprehensive)"
    )
    include_performance: bool = Field(
        default=False,
        description="Include performance benchmarking"
    )
    check_compliance: List[str] = Field(
        default_factory=list,
        description="Compliance frameworks to check against"
    )


class KeyAuditResult(BaseModel):
    """Results of key store quantum readiness audit."""
    id: UUID = Field(default_factory=uuid4)
    request_id: UUID = Field(..., description="Original request ID")
    key_store: KeyStore = Field(..., description="Audited key store details")
    quantum_readiness: QuantumReadinessLevel = Field(..., description="Overall readiness level")
    hsm_capabilities: Optional[HSMCapability] = Field(None, description="HSM-specific capabilities")
    kms_assessment: Optional[KMSAssessment] = Field(None, description="KMS-specific assessment")
    vulnerabilities: List[VulnerabilityFinding] = Field(
        default_factory=list,
        description="Identified vulnerabilities"
    )
    migration_recommendations: List[MigrationRecommendation] = Field(
        default_factory=list,
        description="PQC migration recommendations"
    )
    compliance_status: Dict[str, str] = Field(
        default_factory=dict,
        description="Compliance framework status"
    )
    performance_metrics: Dict[str, Any] = Field(
        default_factory=dict,
        description="Performance benchmark results"
    )
    scan_timestamp: datetime = Field(default_factory=datetime.utcnow)
    scan_duration: Optional[float] = Field(None, description="Scan duration in seconds")


class QuantumReadinessReport(BaseModel):
    """Comprehensive quantum readiness report for an organization."""
    id: UUID = Field(default_factory=uuid4)
    organization: str = Field(..., description="Organization name")
    report_date: datetime = Field(default_factory=datetime.utcnow)
    key_stores_audited: int = Field(..., description="Number of key stores audited")
    overall_readiness: QuantumReadinessLevel = Field(..., description="Overall readiness level")
    readiness_breakdown: Dict[QuantumReadinessLevel, int] = Field(
        default_factory=dict,
        description="Breakdown by readiness level"
    )
    critical_findings: List[VulnerabilityFinding] = Field(
        default_factory=list,
        description="Critical security findings"
    )
    migration_priority: List[str] = Field(
        default_factory=list,
        description="Prioritized migration recommendations"
    )
    estimated_migration_cost: Optional[str] = Field(
        None,
        description="Estimated migration cost and effort"
    )
    compliance_gaps: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Compliance gaps by framework"
    )
    executive_summary: str = Field(..., description="Executive summary")
    technical_recommendations: List[str] = Field(
        default_factory=list,
        description="Technical recommendations"
    )
