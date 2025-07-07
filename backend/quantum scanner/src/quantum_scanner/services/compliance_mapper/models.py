"""
Compliance Mapper Service Data Models

Models for regulatory framework mapping and compliance assessment.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class ComplianceFrameworkType(str, Enum):
    """Supported compliance frameworks."""
    NIST_CSF = "nist_csf"
    NIST_800_53 = "nist_800_53"
    FIPS_140 = "fips_140"
    SOX = "sox"
    HIPAA = "hipaa"
    GDPR = "gdpr"
    PCI_DSS = "pci_dss"
    ISO_27001 = "iso_27001"
    COMMON_CRITERIA = "common_criteria"
    QUANTUM_SAFE = "quantum_safe"


class RequirementSeverity(str, Enum):
    """Compliance requirement severity levels."""
    MANDATORY = "mandatory"
    RECOMMENDED = "recommended"
    OPTIONAL = "optional"


class ComplianceStatus(str, Enum):
    """Compliance status levels."""
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    PARTIALLY_COMPLIANT = "partially_compliant"
    NOT_APPLICABLE = "not_applicable"
    REQUIRES_ASSESSMENT = "requires_assessment"


class GapSeverity(str, Enum):
    """Compliance gap severity levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ComplianceFramework(BaseModel):
    """Represents a compliance framework."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Framework name")
    framework_type: ComplianceFrameworkType = Field(..., description="Framework type")
    version: str = Field(..., description="Framework version")
    description: str = Field(..., description="Framework description")
    issuing_authority: str = Field(..., description="Issuing authority/organization")
    applicability: List[str] = Field(
        default_factory=list,
        description="Industries/sectors where applicable"
    )
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    quantum_considerations: bool = Field(
        default=False,
        description="Whether framework includes quantum-specific requirements"
    )


class ComplianceRequirement(BaseModel):
    """Individual compliance requirement."""
    id: UUID = Field(default_factory=uuid4)
    framework_id: UUID = Field(..., description="Parent framework ID")
    control_id: str = Field(..., description="Control identifier (e.g., AC-3)")
    title: str = Field(..., description="Requirement title")
    description: str = Field(..., description="Detailed description")
    severity: RequirementSeverity = Field(..., description="Requirement severity")
    category: str = Field(..., description="Requirement category")
    cryptographic_relevance: bool = Field(
        default=False,
        description="Whether requirement relates to cryptography"
    )
    quantum_relevance: bool = Field(
        default=False,
        description="Whether requirement relates to quantum threats"
    )
    implementation_guidance: Optional[str] = Field(
        None,
        description="Implementation guidance"
    )
    assessment_criteria: List[str] = Field(
        default_factory=list,
        description="Criteria for assessing compliance"
    )
    references: List[str] = Field(
        default_factory=list,
        description="Reference documents"
    )


class VulnerabilityMapping(BaseModel):
    """Maps vulnerabilities to compliance requirements."""
    vulnerability_id: UUID = Field(..., description="Vulnerability ID")
    vulnerability_type: str = Field(..., description="Type of vulnerability")
    affected_requirements: List[UUID] = Field(
        default_factory=list,
        description="Affected compliance requirements"
    )
    compliance_impact: str = Field(..., description="Impact on compliance")
    remediation_priority: str = Field(..., description="Remediation priority")


class ComplianceMappingRequest(BaseModel):
    """Request for compliance mapping analysis."""
    organization: str = Field(..., description="Organization name")
    frameworks: List[ComplianceFrameworkType] = Field(
        ...,
        description="Frameworks to assess against"
    )
    scan_results: List[UUID] = Field(
        ...,
        description="Scan result IDs to assess"
    )
    assessment_scope: str = Field(
        default="comprehensive",
        description="Assessment scope (basic, standard, comprehensive)"
    )
    include_quantum_requirements: bool = Field(
        default=True,
        description="Include quantum-specific requirements"
    )
    custom_requirements: List[str] = Field(
        default_factory=list,
        description="Custom compliance requirements"
    )


class GapAnalysis(BaseModel):
    """Compliance gap analysis."""
    requirement_id: UUID = Field(..., description="Compliance requirement ID")
    requirement_title: str = Field(..., description="Requirement title")
    current_status: ComplianceStatus = Field(..., description="Current compliance status")
    gap_description: str = Field(..., description="Description of compliance gap")
    gap_severity: GapSeverity = Field(..., description="Severity of gap")
    affected_assets: List[str] = Field(
        default_factory=list,
        description="Assets affected by gap"
    )
    business_impact: str = Field(..., description="Business impact of gap")
    technical_impact: str = Field(..., description="Technical impact of gap")
    remediation_effort: str = Field(..., description="Estimated remediation effort")
    estimated_cost: Optional[str] = Field(None, description="Estimated remediation cost")
    recommended_timeline: str = Field(..., description="Recommended remediation timeline")


class RemediationAction(BaseModel):
    """Specific remediation action."""
    id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., description="Action title")
    description: str = Field(..., description="Detailed description")
    priority: str = Field(..., description="Action priority (critical, high, medium, low)")
    owner: Optional[str] = Field(None, description="Responsible party")
    estimated_effort: str = Field(..., description="Estimated effort")
    dependencies: List[str] = Field(
        default_factory=list,
        description="Dependencies on other actions"
    )
    success_criteria: List[str] = Field(
        default_factory=list,
        description="Criteria for successful completion"
    )
    deadline: Optional[datetime] = Field(None, description="Target completion date")


class RemediationPlan(BaseModel):
    """Comprehensive remediation plan."""
    id: UUID = Field(default_factory=uuid4)
    organization: str = Field(..., description="Organization name")
    plan_date: datetime = Field(default_factory=datetime.utcnow)
    framework: ComplianceFrameworkType = Field(..., description="Target framework")
    total_gaps: int = Field(..., description="Total compliance gaps")
    critical_gaps: int = Field(..., description="Critical compliance gaps")
    actions: List[RemediationAction] = Field(
        default_factory=list,
        description="Remediation actions"
    )
    estimated_timeline: str = Field(..., description="Overall timeline")
    estimated_budget: Optional[str] = Field(None, description="Estimated budget")
    key_milestones: List[str] = Field(
        default_factory=list,
        description="Key project milestones"
    )
    risk_considerations: List[str] = Field(
        default_factory=list,
        description="Risk considerations"
    )


class ComplianceMappingResult(BaseModel):
    """Results of compliance mapping analysis."""
    id: UUID = Field(default_factory=uuid4)
    request_id: UUID = Field(..., description="Original request ID")
    organization: str = Field(..., description="Organization name")
    frameworks_assessed: List[ComplianceFrameworkType] = Field(
        ...,
        description="Frameworks assessed"
    )
    overall_compliance_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Overall compliance score (0-100%)"
    )
    framework_scores: Dict[ComplianceFrameworkType, float] = Field(
        default_factory=dict,
        description="Compliance scores by framework"
    )
    vulnerability_mappings: List[VulnerabilityMapping] = Field(
        default_factory=list,
        description="Vulnerability to requirement mappings"
    )
    gap_analyses: List[GapAnalysis] = Field(
        default_factory=list,
        description="Detailed gap analyses"
    )
    compliance_status_summary: Dict[ComplianceStatus, int] = Field(
        default_factory=dict,
        description="Summary of compliance statuses"
    )
    quantum_readiness_compliance: Dict[str, Any] = Field(
        default_factory=dict,
        description="Quantum readiness compliance assessment"
    )
    remediation_plans: List[RemediationPlan] = Field(
        default_factory=list,
        description="Framework-specific remediation plans"
    )
    assessment_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Assessment execution metadata"
    )
    assessment_timestamp: datetime = Field(default_factory=datetime.utcnow)
    assessment_duration: Optional[float] = Field(None, description="Assessment duration in seconds")


class ComplianceMetrics(BaseModel):
    """Compliance metrics and KPIs."""
    total_requirements_assessed: int = Field(..., description="Total requirements assessed")
    compliant_requirements: int = Field(..., description="Compliant requirements")
    non_compliant_requirements: int = Field(..., description="Non-compliant requirements")
    partially_compliant_requirements: int = Field(..., description="Partially compliant requirements")
    compliance_percentage: float = Field(..., description="Overall compliance percentage")
    critical_gaps: int = Field(..., description="Critical compliance gaps")
    high_priority_actions: int = Field(..., description="High priority remediation actions")
    estimated_remediation_time: str = Field(..., description="Estimated total remediation time")


class ComplianceReport(BaseModel):
    """Comprehensive compliance assessment report."""
    id: UUID = Field(default_factory=uuid4)
    organization: str = Field(..., description="Organization name")
    report_date: datetime = Field(default_factory=datetime.utcnow)
    reporting_period: str = Field(..., description="Reporting period")
    frameworks_covered: List[ComplianceFrameworkType] = Field(
        ...,
        description="Frameworks covered in report"
    )
    executive_summary: str = Field(..., description="Executive summary")
    compliance_metrics: ComplianceMetrics = Field(..., description="Compliance metrics")
    framework_assessments: List[ComplianceMappingResult] = Field(
        default_factory=list,
        description="Individual framework assessments"
    )
    key_findings: List[str] = Field(
        default_factory=list,
        description="Key compliance findings"
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="High-level recommendations"
    )
    quantum_readiness_status: Dict[str, Any] = Field(
        default_factory=dict,
        description="Quantum readiness compliance status"
    )
    risk_assessment: Dict[str, str] = Field(
        default_factory=dict,
        description="Compliance risk assessment"
    )
    next_assessment_date: Optional[datetime] = Field(
        None,
        description="Recommended next assessment date"
    )
    attestation: Optional[str] = Field(
        None,
        description="Management attestation statement"
    )
