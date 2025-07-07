"""Data models for Quantum-Agility Tester service."""

from datetime import datetime
from enum import Enum
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class AlgorithmType(str, Enum):
    """Supported cryptographic algorithm types."""
    KEY_EXCHANGE = "key_exchange"
    DIGITAL_SIGNATURE = "digital_signature" 
    SYMMETRIC_ENCRYPTION = "symmetric_encryption"
    HASH_FUNCTION = "hash_function"


class TestType(str, Enum):
    """Performance test types."""
    THROUGHPUT = "throughput"
    LATENCY = "latency"
    MEMORY_USAGE = "memory_usage"
    CPU_USAGE = "cpu_usage"
    BATTERY_IMPACT = "battery_impact"


class BenchmarkConfig(BaseModel):
    """Configuration for performance benchmarks."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Benchmark configuration name")
    test_types: List[TestType] = Field(default_factory=list)
    iterations: int = Field(default=1000, gt=0)
    warmup_iterations: int = Field(default=100, ge=0)
    parallel_workers: int = Field(default=1, gt=0)
    data_sizes: List[int] = Field(default_factory=lambda: [1024, 4096, 16384])
    timeout_seconds: int = Field(default=300, gt=0)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PerformanceBenchmark(BaseModel):
    """Performance benchmark specification."""
    id: UUID = Field(default_factory=uuid4)
    algorithm_name: str = Field(..., description="Algorithm being tested")
    algorithm_type: AlgorithmType
    classical_variant: Optional[str] = Field(None, description="Classical equivalent")
    pqc_variant: Optional[str] = Field(None, description="Post-quantum variant")
    config: BenchmarkConfig
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PerformanceMetrics(BaseModel):
    """Performance metrics for a single test run."""
    throughput_ops_per_sec: Optional[float] = None
    latency_ms: Optional[float] = None
    memory_usage_mb: Optional[float] = None
    cpu_usage_percent: Optional[float] = None
    battery_impact_mw: Optional[float] = None
    key_size_bytes: Optional[int] = None
    signature_size_bytes: Optional[int] = None
    success_rate: float = Field(default=1.0, ge=0.0, le=1.0)


class PerformanceResult(BaseModel):
    """Results from a performance test."""
    id: UUID = Field(default_factory=uuid4)
    benchmark_id: UUID
    algorithm_name: str
    test_type: TestType
    data_size: int
    metrics: PerformanceMetrics
    environment_info: Dict[str, Any] = Field(default_factory=dict)
    execution_time: float = Field(..., description="Total execution time in seconds")
    completed_at: datetime = Field(default_factory=datetime.utcnow)
    error_message: Optional[str] = None


class MigrationTest(BaseModel):
    """Migration performance test specification."""
    id: UUID = Field(default_factory=uuid4)
    name: str = Field(..., description="Migration test name")
    source_algorithm: str = Field(..., description="Current algorithm")
    target_algorithm: str = Field(..., description="Target PQC algorithm")
    migration_strategy: str = Field(..., description="Migration approach")
    test_scenarios: List[str] = Field(default_factory=list)
    expected_performance_impact: Optional[float] = Field(None, description="Expected % impact")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MigrationResult(BaseModel):
    """Results from a migration performance test."""
    id: UUID = Field(default_factory=uuid4)
    migration_test_id: UUID
    baseline_performance: PerformanceResult
    migrated_performance: PerformanceResult
    performance_ratio: float = Field(..., description="New/Old performance ratio")
    migration_overhead: float = Field(..., description="Additional overhead %")
    compatibility_score: float = Field(default=1.0, ge=0.0, le=1.0)
    recommendations: List[str] = Field(default_factory=list)
    completed_at: datetime = Field(default_factory=datetime.utcnow)


class AgilityScanRequest(BaseModel):
    """Request for quantum agility performance scan."""
    target_systems: List[str] = Field(..., description="Systems to test")
    algorithms_to_test: List[str] = Field(default_factory=list)
    test_types: List[TestType] = Field(default_factory=list)
    config: Optional[BenchmarkConfig] = None
    include_migration_tests: bool = Field(default=True)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AgilityScanResult(BaseModel):
    """Results from quantum agility scan."""
    id: UUID = Field(default_factory=uuid4)
    request_id: UUID
    performance_results: List[PerformanceResult] = Field(default_factory=list)
    migration_results: List[MigrationResult] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0)
    readiness_score: float = Field(default=0.0, ge=0.0, le=1.0)
    completed_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
