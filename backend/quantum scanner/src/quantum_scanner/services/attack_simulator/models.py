"""Data models for Attack Simulator service."""

from datetime import datetime, timedelta
from enum import Enum
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class AttackType(str, Enum):
    """Types of quantum attacks."""
    SHORS_ALGORITHM = "shors_algorithm"
    GROVERS_ALGORITHM = "grovers_algorithm"
    QUANTUM_PERIOD_FINDING = "quantum_period_finding"
    QUANTUM_FOURIER_TRANSFORM = "quantum_fourier_transform"
    VARIATIONAL_QUANTUM_ATTACK = "variational_quantum_attack"


class QuantumHardware(str, Enum):
    """Types of quantum hardware platforms."""
    GATE_BASED = "gate_based"
    ANNEALING = "annealing"
    TOPOLOGICAL = "topological"
    PHOTONIC = "photonic"
    TRAPPED_ION = "trapped_ion"


class ThreatLevel(str, Enum):
    """Threat levels for quantum attacks."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AlgorithmVulnerability(BaseModel):
    """Vulnerability assessment for a cryptographic algorithm."""
    algorithm_name: str = Field(..., description="Name of the algorithm")
    key_size: int = Field(..., description="Key size in bits")
    attack_type: AttackType
    quantum_advantage: float = Field(..., description="Quantum vs classical speedup factor")
    logical_qubits_required: int = Field(..., description="Logical qubits needed")
    gate_depth: int = Field(..., description="Circuit depth required")
    estimated_time_classical: timedelta = Field(..., description="Classical attack time")
    estimated_time_quantum: timedelta = Field(..., description="Quantum attack time")
    vulnerability_score: float = Field(..., ge=0.0, le=1.0, description="Vulnerability score")


class QuantumCapability(BaseModel):
    """Current and projected quantum computing capabilities."""
    year: int = Field(..., description="Year of capability")
    logical_qubits: int = Field(..., description="Available logical qubits")
    gate_fidelity: float = Field(..., ge=0.0, le=1.0, description="Gate fidelity")
    coherence_time_ms: float = Field(..., description="Coherence time in milliseconds")
    gate_time_ns: float = Field(..., description="Gate time in nanoseconds")
    error_rate: float = Field(..., ge=0.0, le=1.0, description="Error rate")
    hardware_type: QuantumHardware


class TimelineEstimate(BaseModel):
    """Timeline estimate for quantum threat emergence."""
    id: UUID = Field(default_factory=uuid4)
    algorithm_name: str = Field(..., description="Target algorithm")
    key_size: int = Field(..., description="Key size")
    conservative_estimate: datetime = Field(..., description="Conservative break date")
    optimistic_estimate: datetime = Field(..., description="Optimistic break date")
    confidence_level: float = Field(..., ge=0.0, le=1.0, description="Confidence in estimate")
    assumptions: List[str] = Field(default_factory=list)
    risk_factors: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ThreatModel(BaseModel):
    """Threat model for quantum attacks."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Threat model name")
    adversary_type: str = Field(..., description="Type of adversary")
    resources: Dict[str, Any] = Field(default_factory=dict, description="Adversary resources")
    capabilities: List[QuantumCapability] = Field(default_factory=list)
    attack_scenarios: List[str] = Field(default_factory=list)
    threat_level: ThreatLevel
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AttackScenario(BaseModel):
    """Attack scenario specification."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Scenario name")
    description: str = Field(..., description="Scenario description")
    target_algorithm: str = Field(..., description="Target algorithm")
    attack_type: AttackType
    threat_model: ThreatModel
    prerequisites: List[str] = Field(default_factory=list)
    success_probability: float = Field(..., ge=0.0, le=1.0)
    impact_assessment: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QuantumAttack(BaseModel):
    """Quantum attack specification and parameters."""
    id: UUID = Field(default_factory=uuid4)
    scenario_id: UUID
    attack_type: AttackType
    target_algorithm: str = Field(..., description="Algorithm being attacked")
    target_key_size: int = Field(..., description="Key size in bits")
    quantum_resources: Dict[str, Any] = Field(default_factory=dict)
    classical_preprocessing: bool = Field(default=False)
    hybrid_approach: bool = Field(default=False)
    success_criteria: str = Field(..., description="Success criteria")
    estimated_duration: timedelta = Field(..., description="Estimated attack duration")
    resource_requirements: Dict[str, Any] = Field(default_factory=dict)


class AttackResult(BaseModel):
    """Results from quantum attack simulation."""
    id: UUID = Field(default_factory=uuid4)
    attack_id: UUID
    simulation_successful: bool = Field(..., description="Whether simulation completed")
    attack_successful: bool = Field(..., description="Whether attack would succeed")
    time_to_break: Optional[timedelta] = Field(None, description="Time to break the algorithm")
    quantum_resources_used: Dict[str, Any] = Field(default_factory=dict)
    success_probability: float = Field(..., ge=0.0, le=1.0)
    confidence_interval: Dict[str, float] = Field(default_factory=dict)
    limitations: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    completed_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SimulationRequest(BaseModel):
    """Request for quantum attack simulation."""
    target_algorithms: List[str] = Field(..., description="Algorithms to simulate attacks against")
    key_sizes: List[int] = Field(default_factory=list, description="Key sizes to test")
    attack_types: List[AttackType] = Field(default_factory=list)
    threat_models: List[ThreatModel] = Field(default_factory=list)
    include_timeline: bool = Field(default=True, description="Include timeline estimates")
    confidence_level: float = Field(default=0.95, ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SimulationReport(BaseModel):
    """Comprehensive attack simulation report."""
    id: UUID = Field(default_factory=uuid4)
    request_id: UUID
    vulnerabilities: List[AlgorithmVulnerability] = Field(default_factory=list)
    attack_results: List[AttackResult] = Field(default_factory=list)
    timeline_estimates: List[TimelineEstimate] = Field(default_factory=list)
    threat_assessment: Dict[str, Any] = Field(default_factory=dict)
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0)
    executive_summary: str = Field(..., description="Executive summary of findings")
    recommendations: List[str] = Field(default_factory=list)
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
