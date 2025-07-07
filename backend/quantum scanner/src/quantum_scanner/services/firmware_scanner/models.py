"""
Firmware Scanner Service Data Models

Models for IoT/embedded device cryptographic analysis and firmware scanning.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class DeviceType(str, Enum):
    """Types of devices that can be scanned."""
    IOT_DEVICE = "iot_device"
    ROUTER = "router"
    SWITCH = "switch"
    CAMERA = "camera"
    SENSOR = "sensor"
    GATEWAY = "gateway"
    CONTROLLER = "controller"
    EMBEDDED_SYSTEM = "embedded_system"
    MOBILE_DEVICE = "mobile_device"
    AUTOMOTIVE = "automotive"
    INDUSTRIAL = "industrial"


class ScanMethod(str, Enum):
    """Methods for scanning firmware/devices."""
    BINARY_ANALYSIS = "binary_analysis"
    NETWORK_SCAN = "network_scan"
    FIRMWARE_EXTRACTION = "firmware_extraction"
    PROTOCOL_ANALYSIS = "protocol_analysis"
    CERTIFICATE_SCAN = "certificate_scan"
    STATIC_ANALYSIS = "static_analysis"
    DYNAMIC_ANALYSIS = "dynamic_analysis"


class CryptoImplementationType(str, Enum):
    """Types of cryptographic implementations."""
    LIBRARY = "library"
    HARDWARE = "hardware"
    CUSTOM = "custom"
    PROTOCOL = "protocol"
    CERTIFICATE = "certificate"
    KEY_MATERIAL = "key_material"


class VulnerabilitySeverity(str, Enum):
    """Vulnerability severity levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class FirmwareTarget(BaseModel):
    """Target device or firmware for scanning."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Device or firmware name")
    device_type: DeviceType = Field(..., description="Type of device")
    vendor: str = Field(..., description="Device vendor/manufacturer")
    model: str = Field(..., description="Device model")
    firmware_version: Optional[str] = Field(None, description="Firmware version")
    ip_address: Optional[str] = Field(None, description="IP address if network accessible")
    mac_address: Optional[str] = Field(None, description="MAC address")
    firmware_path: Optional[str] = Field(None, description="Path to firmware file")
    connection_info: Dict[str, Any] = Field(
        default_factory=dict,
        description="Connection parameters (SSH, SNMP, etc.)"
    )
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CryptoImplementation(BaseModel):
    """Detected cryptographic implementation."""
    id: UUID = Field(default_factory=uuid4)
    algorithm: str = Field(..., description="Cryptographic algorithm")
    implementation_type: CryptoImplementationType = Field(..., description="Implementation type")
    library_name: Optional[str] = Field(None, description="Cryptographic library name")
    library_version: Optional[str] = Field(None, description="Library version")
    key_size: Optional[int] = Field(None, description="Key size in bits")
    location: str = Field(..., description="Location in firmware/device")
    usage_context: str = Field(..., description="How the crypto is used")
    quantum_vulnerable: bool = Field(..., description="Vulnerable to quantum attacks")
    deprecated: bool = Field(default=False, description="Algorithm is deprecated")
    custom_implementation: bool = Field(default=False, description="Custom crypto implementation")
    performance_impact: Optional[str] = Field(None, description="Performance characteristics")
    compliance_notes: Optional[str] = Field(None, description="Compliance considerations")


class VulnerabilityFinding(BaseModel):
    """Security vulnerability found in firmware."""
    id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., description="Vulnerability title")
    description: str = Field(..., description="Detailed description")
    severity: VulnerabilitySeverity = Field(..., description="Severity level")
    cve_id: Optional[str] = Field(None, description="CVE identifier")
    crypto_related: bool = Field(..., description="Whether vulnerability is crypto-related")
    quantum_impact: Optional[str] = Field(None, description="Quantum attack implications")
    affected_component: str = Field(..., description="Affected component or location")
    remediation: str = Field(..., description="Recommended remediation")
    exploit_complexity: Optional[str] = Field(None, description="Exploit complexity")
    references: List[str] = Field(default_factory=list, description="Reference URLs")


class DeviceProfile(BaseModel):
    """Device profile with security characteristics."""
    device_info: FirmwareTarget = Field(..., description="Device information")
    operating_system: Optional[str] = Field(None, description="Operating system")
    architecture: Optional[str] = Field(None, description="Hardware architecture")
    open_ports: List[int] = Field(default_factory=list, description="Open network ports")
    services: List[str] = Field(default_factory=list, description="Running services")
    certificates: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="SSL/TLS certificates"
    )
    crypto_libraries: List[str] = Field(
        default_factory=list,
        description="Detected crypto libraries"
    )
    security_features: List[str] = Field(
        default_factory=list,
        description="Security features enabled"
    )
    update_mechanism: Optional[str] = Field(None, description="Firmware update mechanism")
    last_update: Optional[datetime] = Field(None, description="Last firmware update")


class FirmwareScanRequest(BaseModel):
    """Request for firmware/device scanning."""
    target: FirmwareTarget = Field(..., description="Target device or firmware")
    scan_methods: List[ScanMethod] = Field(..., description="Scanning methods to use")
    scan_depth: str = Field(
        default="standard",
        description="Scan depth (quick, standard, comprehensive)"
    )
    include_network_scan: bool = Field(
        default=True,
        description="Include network-based scanning"
    )
    include_binary_analysis: bool = Field(
        default=True,
        description="Include binary/firmware analysis"
    )
    check_certificates: bool = Field(
        default=True,
        description="Analyze SSL/TLS certificates"
    )
    custom_signatures: List[str] = Field(
        default_factory=list,
        description="Custom crypto signatures to look for"
    )
    compliance_frameworks: List[str] = Field(
        default_factory=list,
        description="Compliance frameworks to check"
    )


class FirmwareScanResult(BaseModel):
    """Results of firmware/device scanning."""
    id: UUID = Field(default_factory=uuid4)
    request_id: UUID = Field(..., description="Original request ID")
    target: FirmwareTarget = Field(..., description="Scanned target")
    device_profile: DeviceProfile = Field(..., description="Device security profile")
    crypto_implementations: List[CryptoImplementation] = Field(
        default_factory=list,
        description="Detected cryptographic implementations"
    )
    vulnerabilities: List[VulnerabilityFinding] = Field(
        default_factory=list,
        description="Security vulnerabilities found"
    )
    quantum_risk_score: float = Field(
        ...,
        ge=0.0,
        le=10.0,
        description="Quantum risk score (0-10)"
    )
    compliance_status: Dict[str, str] = Field(
        default_factory=dict,
        description="Compliance framework status"
    )
    remediation_recommendations: List[str] = Field(
        default_factory=list,
        description="Remediation recommendations"
    )
    scan_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Scan execution metadata"
    )
    scan_timestamp: datetime = Field(default_factory=datetime.utcnow)
    scan_duration: Optional[float] = Field(None, description="Scan duration in seconds")


class CryptoDiscoveryStats(BaseModel):
    """Statistics about cryptographic discovery."""
    total_implementations: int = Field(..., description="Total crypto implementations found")
    quantum_vulnerable_count: int = Field(..., description="Quantum-vulnerable implementations")
    deprecated_count: int = Field(..., description="Deprecated implementations")
    custom_crypto_count: int = Field(..., description="Custom crypto implementations")
    algorithm_breakdown: Dict[str, int] = Field(
        default_factory=dict,
        description="Breakdown by algorithm"
    )
    library_breakdown: Dict[str, int] = Field(
        default_factory=dict,
        description="Breakdown by library"
    )


class FirmwareAnalysisReport(BaseModel):
    """Comprehensive firmware analysis report."""
    id: UUID = Field(default_factory=uuid4)
    organization: str = Field(..., description="Organization name")
    report_date: datetime = Field(default_factory=datetime.utcnow)
    devices_scanned: int = Field(..., description="Number of devices scanned")
    scan_results: List[FirmwareScanResult] = Field(
        default_factory=list,
        description="Individual scan results"
    )
    crypto_discovery_stats: CryptoDiscoveryStats = Field(
        ...,
        description="Cryptographic discovery statistics"
    )
    risk_distribution: Dict[VulnerabilitySeverity, int] = Field(
        default_factory=dict,
        description="Risk distribution by severity"
    )
    device_type_breakdown: Dict[DeviceType, int] = Field(
        default_factory=dict,
        description="Breakdown by device type"
    )
    top_vulnerabilities: List[VulnerabilityFinding] = Field(
        default_factory=list,
        description="Top security vulnerabilities"
    )
    quantum_readiness_summary: Dict[str, Any] = Field(
        default_factory=dict,
        description="Quantum readiness summary"
    )
    executive_summary: str = Field(..., description="Executive summary")
    technical_recommendations: List[str] = Field(
        default_factory=list,
        description="Technical recommendations"
    )
    compliance_summary: Dict[str, str] = Field(
        default_factory=dict,
        description="Compliance summary by framework"
    )
