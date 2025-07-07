"""Data models for DevSecOps service."""

from datetime import datetime
from enum import Enum
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, HttpUrl


class PipelineStage(str, Enum):
    """CI/CD pipeline stages."""
    BUILD = "build"
    TEST = "test"
    SECURITY_SCAN = "security_scan"
    DEPLOY = "deploy"
    POST_DEPLOY = "post_deploy"


class ScanTrigger(str, Enum):
    """Scan trigger types."""
    ON_COMMIT = "on_commit"
    ON_MERGE = "on_merge"
    SCHEDULED = "scheduled"
    MANUAL = "manual"
    ON_RELEASE = "on_release"


class PolicyAction(str, Enum):
    """Actions for policy violations."""
    BLOCK = "block"
    WARN = "warn"
    LOG = "log"
    NOTIFY = "notify"


class ScanStatus(str, Enum):
    """Scan job status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ViolationSeverity(str, Enum):
    """Policy violation severity levels."""
    INFO = "info"
    LOW = "low" 
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class PipelineConfig(BaseModel):
    """CI/CD pipeline configuration for quantum security scanning."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Pipeline configuration name")
    repository_url: HttpUrl = Field(..., description="Repository URL")
    branch_patterns: List[str] = Field(default_factory=lambda: ["main", "master", "develop"])
    scan_triggers: List[ScanTrigger] = Field(default_factory=list)
    enabled_scans: List[str] = Field(default_factory=list, description="Enabled scan types")
    pipeline_stages: List[PipelineStage] = Field(default_factory=list)
    environment_variables: Dict[str, str] = Field(default_factory=dict)
    fail_on_violations: bool = Field(default=True)
    notification_channels: List[str] = Field(default_factory=list)
    scan_timeout_minutes: int = Field(default=30, gt=0)
    parallel_execution: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ScanJob(BaseModel):
    """CI/CD scan job execution."""
    id: UUID = Field(default_factory=uuid4)
    pipeline_config_id: UUID
    job_name: str = Field(..., description="Job name")
    repository_url: HttpUrl = Field(..., description="Repository URL")
    commit_hash: str = Field(..., description="Git commit hash")
    branch: str = Field(..., description="Git branch")
    trigger: ScanTrigger
    scan_types: List[str] = Field(default_factory=list)
    status: ScanStatus = Field(default=ScanStatus.PENDING)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    execution_time_seconds: Optional[float] = None
    artifacts_generated: List[str] = Field(default_factory=list)
    scan_results: Dict[str, Any] = Field(default_factory=dict)
    violations_found: int = Field(default=0, ge=0)
    critical_violations: int = Field(default=0, ge=0)
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PolicyRule(BaseModel):
    """Security policy rule."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Rule name")
    description: str = Field(..., description="Rule description")
    category: str = Field(..., description="Rule category")
    severity: ViolationSeverity
    action: PolicyAction
    enabled: bool = Field(default=True)
    conditions: Dict[str, Any] = Field(default_factory=dict)
    quantum_specific: bool = Field(default=False)
    algorithms_scope: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PolicyViolation(BaseModel):
    """Security policy violation."""
    id: UUID = Field(default_factory=uuid4)
    scan_job_id: UUID
    rule_id: UUID
    rule_name: str = Field(..., description="Violated rule name")
    severity: ViolationSeverity
    action_taken: PolicyAction
    violation_type: str = Field(..., description="Type of violation")
    description: str = Field(..., description="Violation description")
    file_path: Optional[str] = Field(None, description="File where violation found")
    line_number: Optional[int] = Field(None, description="Line number if applicable")
    code_snippet: Optional[str] = Field(None, description="Relevant code snippet")
    recommendation: str = Field(..., description="Remediation recommendation")
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0)
    quantum_impact: bool = Field(default=False)
    cve_references: List[str] = Field(default_factory=list)
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ComplianceFramework(str, Enum):
    """Supported compliance frameworks."""
    NIST_CSF = "nist_csf"
    FIPS_140 = "fips_140"
    COMMON_CRITERIA = "common_criteria"
    SOC2 = "soc2"
    ISO_27001 = "iso_27001"
    PCI_DSS = "pci_dss"
    NIST_PQC = "nist_pqc"


class ComplianceCheck(BaseModel):
    """Compliance framework check."""
    id: UUID = Field(default_factory=uuid4)
    framework: ComplianceFramework
    control_id: str = Field(..., description="Control identifier")
    control_name: str = Field(..., description="Control name")
    description: str = Field(..., description="Control description")
    requirement: str = Field(..., description="Compliance requirement")
    test_procedure: str = Field(..., description="How to test compliance")
    quantum_relevant: bool = Field(default=False)
    automation_supported: bool = Field(default=False)
    severity: ViolationSeverity = Field(default=ViolationSeverity.MEDIUM)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ComplianceResult(BaseModel):
    """Result of compliance check."""
    id: UUID = Field(default_factory=uuid4)
    scan_job_id: UUID
    check_id: UUID
    framework: ComplianceFramework
    control_id: str = Field(..., description="Control identifier")
    status: str = Field(..., description="Compliance status")
    compliant: bool = Field(..., description="Whether check passed")
    evidence: List[str] = Field(default_factory=list)
    findings: List[str] = Field(default_factory=list)
    remediation_steps: List[str] = Field(default_factory=list)
    risk_level: ViolationSeverity = Field(default=ViolationSeverity.LOW)
    tested_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ScanConfiguration(BaseModel):
    """Configuration for automated scanning."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Scan configuration name")
    scan_types: List[str] = Field(default_factory=list)
    policy_rules: List[UUID] = Field(default_factory=list)
    compliance_checks: List[UUID] = Field(default_factory=list)
    exclusions: List[str] = Field(default_factory=list, description="Files/paths to exclude")
    custom_rules: Dict[str, Any] = Field(default_factory=dict)
    reporting_config: Dict[str, Any] = Field(default_factory=dict)
    integration_settings: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class IntegrationWebhook(BaseModel):
    """Webhook for external integrations."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Webhook name")
    url: HttpUrl = Field(..., description="Webhook URL")
    events: List[str] = Field(default_factory=list, description="Events to trigger webhook")
    headers: Dict[str, str] = Field(default_factory=dict)
    authentication: Dict[str, str] = Field(default_factory=dict)
    active: bool = Field(default=True)
    retry_attempts: int = Field(default=3, ge=0)
    timeout_seconds: int = Field(default=30, gt=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PipelineReport(BaseModel):
    """Comprehensive pipeline security report."""
    id: UUID = Field(default_factory=uuid4)
    scan_job_id: UUID
    repository_url: HttpUrl
    commit_hash: str = Field(..., description="Git commit hash")
    branch: str = Field(..., description="Git branch")
    scan_summary: Dict[str, Any] = Field(default_factory=dict)
    violations: List[PolicyViolation] = Field(default_factory=list)
    compliance_results: List[ComplianceResult] = Field(default_factory=list)
    quantum_findings: Dict[str, Any] = Field(default_factory=dict)
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0)
    recommendations: List[str] = Field(default_factory=list)
    executive_summary: str = Field(..., description="Executive summary")
    artifacts: List[str] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class DevSecOpsRequest(BaseModel):
    """Request model for DevSecOps pipeline scanning."""
    scan_id: UUID = Field(default_factory=uuid4)
    pipeline_config: Dict[str, Any] = Field(..., description="Pipeline configuration")
    repository_url: Optional[str] = Field(None, description="Repository URL")
    branch: str = Field(default="main", description="Git branch to scan")
    commit_hash: Optional[str] = Field(None, description="Specific commit hash")
    scan_triggers: List[ScanTrigger] = Field(default_factory=list)
    enable_monitoring: bool = Field(default=False, description="Enable continuous monitoring")
    monitoring_interval_hours: Optional[int] = Field(None, description="Monitoring interval")
    compliance_frameworks: List[str] = Field(default_factory=list, description="Compliance frameworks to check")
    security_policies: Dict[str, Any] = Field(default_factory=dict, description="Security policies")


class PipelineIntegration(BaseModel):
    """CI/CD pipeline integration configuration."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Integration name")
    platform: str = Field(..., description="CI/CD platform (e.g., github, gitlab, jenkins)")
    integration_type: str = Field(..., description="Integration type")
    repository_url: Optional[HttpUrl] = Field(None, description="Repository URL")
    webhook_url: Optional[HttpUrl] = Field(None, description="Webhook endpoint")
    api_credentials: Dict[str, Any] = Field(default_factory=dict, description="API credentials")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Platform-specific config")
    enabled: bool = Field(default=True, description="Integration enabled status")
    last_sync: Optional[datetime] = Field(None, description="Last synchronization time")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SecurityCheck(BaseModel):
    """Security check definition."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Check name")
    category: str = Field(..., description="Check category")
    description: str = Field(..., description="Check description")
    severity: ViolationSeverity = Field(..., description="Check severity level")
    quantum_related: bool = Field(default=False, description="Quantum security related")
    automated: bool = Field(default=True, description="Automated check")
    required_tools: List[str] = Field(default_factory=list, description="Required scanning tools")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Check configuration")
    enabled: bool = Field(default=True, description="Check enabled status")


class CheckResult(BaseModel):
    """Result of a security check."""
    id: UUID = Field(default_factory=uuid4)
    check_id: UUID = Field(..., description="Security check ID")
    scan_id: UUID = Field(..., description="Scan ID")
    status: ScanStatus = Field(..., description="Check execution status")
    passed: bool = Field(default=False, description="Check passed status")
    score: float = Field(default=0.0, ge=0.0, le=1.0, description="Check score")
    findings: List[str] = Field(default_factory=list, description="Security findings")
    violations: List[PolicyViolation] = Field(default_factory=list, description="Policy violations found")
    execution_time: float = Field(default=0.0, ge=0.0, description="Execution time in seconds")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    artifacts: List[str] = Field(default_factory=list, description="Generated artifacts")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class AutomationRule(BaseModel):
    """Automation rule for DevSecOps workflows."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Rule name")
    description: str = Field(..., description="Rule description")
    trigger: ScanTrigger = Field(..., description="Rule trigger condition")
    conditions: Dict[str, Any] = Field(default_factory=dict, description="Rule conditions")
    actions: List[PolicyAction] = Field(default_factory=list, description="Actions to execute")
    target_pipelines: List[str] = Field(default_factory=list, description="Target pipeline patterns")
    enabled: bool = Field(default=True, description="Rule enabled status")
    priority: int = Field(default=100, ge=1, le=1000, description="Rule priority")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DevSecOpsResponse(BaseModel):
    """Response model for DevSecOps pipeline scanning."""
    scan_id: UUID
    pipeline_integrations: List[PipelineIntegration] = Field(default_factory=list)
    security_checks: List[SecurityCheck] = Field(default_factory=list)
    check_results: List[CheckResult] = Field(default_factory=list)
    policy_violations: List[PolicyViolation] = Field(default_factory=list)
    automation_rules: List[AutomationRule] = Field(default_factory=list)
    security_score: float = Field(..., ge=0.0, le=1.0, description="Overall security score")
    compliance_status: str = Field(default="unknown", description="Compliance status")
    recommendations: List[str] = Field(default_factory=list, description="Security recommendations")
    scan_duration: str = Field(default="0s", description="Scan duration")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
