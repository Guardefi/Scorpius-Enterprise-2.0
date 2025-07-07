"""Data models for the CBOM Engine."""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
try:
    from pydantic import BaseModel, Field
except ImportError:
    # Handle import gracefully
    class BaseModel:
        pass
    def Field(*args, **kwargs):
        return None
from uuid import UUID, uuid4


class AssetType(str, Enum):
    """Types of assets that can be scanned."""
    SOURCE_CODE = "source_code"
    BINARY = "binary"
    CONTAINER = "container"
    NETWORK_ENDPOINT = "network_endpoint"
    CERTIFICATE = "certificate"
    FIRMWARE = "firmware"
    CLOUD_SERVICE = "cloud_service"


class CryptoAlgorithmType(str, Enum):
    """Types of cryptographic algorithms."""
    SYMMETRIC = "symmetric"
    ASYMMETRIC = "asymmetric"
    HASH = "hash"
    KEM = "kem"  # Key Encapsulation Mechanism
    SIGNATURE = "signature"
    MAC = "mac"  # Message Authentication Code


class QuantumVulnerabilityLevel(str, Enum):
    """Quantum vulnerability assessment levels."""
    SAFE = "safe"  # Quantum-safe algorithm
    VULNERABLE = "vulnerable"  # Vulnerable to quantum attacks
    UNKNOWN = "unknown"  # Unable to determine quantum safety
    DEPRECATED = "deprecated"  # Algorithm is deprecated


class CBOMConfig(BaseModel):
    """Configuration for CBOM scanning operations."""
    
    deep_scan: bool = Field(default=True, description="Enable deep scanning")
    scan_dependencies: bool = Field(default=True, description="Scan transitive dependencies")
    include_network_traffic: bool = Field(default=False, description="Include network traffic analysis")
    fips_validation: bool = Field(default=True, description="Perform FIPS compliance validation")
    quantum_assessment: bool = Field(default=True, description="Perform quantum vulnerability assessment")
    output_format: str = Field(default="CycloneDX", description="Output format (CycloneDX, JSON, XML)")
    exclude_patterns: List[str] = Field(default_factory=list, description="Patterns to exclude from scanning")
    max_file_size_mb: int = Field(default=100, description="Maximum file size to scan in MB")
    timeout_seconds: int = Field(default=300, description="Scan timeout in seconds")


class Asset(BaseModel):
    """Represents an asset to be scanned."""
    
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Human-readable name of the asset")
    type: AssetType = Field(..., description="Type of the asset")
    location: str = Field(..., description="Location/path of the asset")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True


class CryptoComponent(BaseModel):
    """Represents a discovered cryptographic component."""
    
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Name/identifier of the cryptographic component")
    algorithm: str = Field(..., description="Cryptographic algorithm name")
    algorithm_type: CryptoAlgorithmType = Field(..., description="Type of cryptographic algorithm")
    key_size: Optional[int] = Field(None, description="Key size in bits")
    version: Optional[str] = Field(None, description="Version of the implementation")
    library: Optional[str] = Field(None, description="Cryptographic library used")
    file_path: Optional[str] = Field(None, description="File path where component was found")
    line_number: Optional[int] = Field(None, description="Line number in source code")
    usage_context: Optional[str] = Field(None, description="Context where crypto is used")
    configuration: Dict[str, Any] = Field(default_factory=dict, description="Algorithm configuration")
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True


class QuantumVulnerabilityAssessment(BaseModel):
    """Quantum vulnerability assessment for a cryptographic component."""
    
    vulnerability_level: QuantumVulnerabilityLevel = Field(..., description="Quantum vulnerability level")
    is_vulnerable: bool = Field(..., description="Whether component is quantum vulnerable")
    estimated_break_time: Optional[str] = Field(None, description="Estimated time to break with quantum computer")
    migration_priority: str = Field(..., description="Migration priority (Critical, High, Medium, Low)")
    recommended_replacement: Optional[str] = Field(None, description="Recommended quantum-safe replacement")
    compliance_notes: List[str] = Field(default_factory=list, description="Compliance-related notes")
    assessment_confidence: float = Field(..., description="Confidence level of assessment (0.0-1.0)")
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True


class CBOMEntry(BaseModel):
    """A single entry in the Crypto Bill of Materials."""
    
    id: UUID = Field(default_factory=uuid4)
    component: CryptoComponent = Field(..., description="Cryptographic component details")
    asset_id: UUID = Field(..., description="ID of the asset containing this component")
    asset_location: str = Field(..., description="Location of the containing asset")
    quantum_assessment: QuantumVulnerabilityAssessment = Field(..., description="Quantum vulnerability assessment")
    fips_compliant: bool = Field(..., description="Whether component is FIPS compliant")
    discovered_at: datetime = Field(default_factory=datetime.utcnow)
    last_verified: Optional[datetime] = Field(None, description="Last verification timestamp")
    tags: List[str] = Field(default_factory=list, description="Tags for categorization")
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True


class CBOMReport(BaseModel):
    """Complete CBOM report containing all discovered entries."""
    
    id: UUID = Field(default_factory=uuid4)
    scan_id: UUID = Field(default_factory=uuid4)
    title: str = Field(..., description="Report title")
    description: Optional[str] = Field(None, description="Report description")
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    scan_config: CBOMConfig = Field(..., description="Configuration used for scan")
    scanned_assets: List[Asset] = Field(..., description="Assets that were scanned")
    entries: List[CBOMEntry] = Field(..., description="CBOM entries discovered")
    summary: Dict[str, Any] = Field(default_factory=dict, description="Summary statistics")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    @property
    def total_components(self) -> int:
        """Get total number of cryptographic components discovered."""
        return len(self.entries)
    
    @property
    def quantum_vulnerable_count(self) -> int:
        """Get count of quantum-vulnerable components."""
        return sum(1 for entry in self.entries if entry.quantum_assessment.is_vulnerable)
    
    @property
    def fips_compliant_count(self) -> int:
        """Get count of FIPS-compliant components."""
        return sum(1 for entry in self.entries if entry.fips_compliant)
    
    @property
    def vulnerability_breakdown(self) -> Dict[str, int]:
        """Get breakdown of vulnerability levels."""
        breakdown = {}
        for entry in self.entries:
            level = entry.quantum_assessment.vulnerability_level
            breakdown[level] = breakdown.get(level, 0) + 1
        return breakdown
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True
