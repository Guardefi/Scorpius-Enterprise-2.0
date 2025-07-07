"""Tests for Quantum Agility Tester service."""

import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

from quantum_scanner.services.quantum_agility_tester.scanner import QuantumAgilityTester
from quantum_scanner.services.quantum_agility_tester.models import (
    AgilityScanRequest,
    BenchmarkConfig,
    TestType,
    PerformanceBenchmark,
    AlgorithmType,
    MigrationTest,
)


@pytest.fixture
def agility_tester():
    """Create QuantumAgilityTester instance for testing."""
    return QuantumAgilityTester()


@pytest.fixture
def sample_scan_request():
    """Sample agility scan request."""
    return AgilityScanRequest(
        target_systems=["test-system-1"],
        algorithms_to_test=["rsa-2048", "ml-kem-768"],
        test_types=[TestType.THROUGHPUT, TestType.LATENCY],
        include_migration_tests=True
    )


@pytest.fixture
def sample_benchmark_config():
    """Sample benchmark configuration."""
    return BenchmarkConfig(
        name="test_benchmark",
        test_types=[TestType.THROUGHPUT],
        iterations=100,
        data_sizes=[1024, 4096]
    )


class TestQuantumAgilityTester:
    """Test suite for QuantumAgilityTester."""

    def test_initialization(self, agility_tester):
        """Test tester initialization."""
        assert agility_tester is not None
        assert "classical" in agility_tester.supported_algorithms
        assert "pqc" in agility_tester.supported_algorithms
        assert "rsa" in agility_tester.supported_algorithms["classical"]
        assert "ml-kem" in agility_tester.supported_algorithms["pqc"]

    @pytest.mark.asyncio
    async def test_scan_system_agility(self, agility_tester, sample_scan_request):
        """Test system agility scanning."""
        result = await agility_tester.scan_system_agility(sample_scan_request)
        
        assert result is not None
        assert result.request_id is not None
        assert len(result.performance_results) > 0
        assert 0.0 <= result.risk_score <= 1.0
        assert 0.0 <= result.readiness_score <= 1.0
        assert len(result.recommendations) > 0

    @pytest.mark.asyncio
    async def test_performance_measurement(self, agility_tester, sample_benchmark_config):
        """Test performance measurement."""
        # Test classical algorithm
        metrics_classical = await agility_tester._measure_algorithm_performance(
            "rsa-2048", sample_benchmark_config
        )
        assert metrics_classical.throughput_ops_per_sec is not None
        assert metrics_classical.latency_ms is not None
        assert metrics_classical.success_rate == 1.0

        # Test PQC algorithm
        metrics_pqc = await agility_tester._measure_algorithm_performance(
            "ml-kem-768", sample_benchmark_config
        )
        assert metrics_pqc.throughput_ops_per_sec is not None
        assert metrics_pqc.latency_ms is not None
        assert metrics_pqc.key_size_bytes is not None

    def test_algorithm_type_detection(self, agility_tester):
        """Test algorithm type detection."""
        assert agility_tester._get_algorithm_type("ml-kem-768") == AlgorithmType.KEY_EXCHANGE
        assert agility_tester._get_algorithm_type("ml-dsa-65") == AlgorithmType.DIGITAL_SIGNATURE
        assert agility_tester._get_algorithm_type("rsa-2048") == AlgorithmType.DIGITAL_SIGNATURE
        assert agility_tester._get_algorithm_type("aes-256") == AlgorithmType.SYMMETRIC_ENCRYPTION

    def test_benchmark_creation(self, agility_tester, sample_benchmark_config):
        """Test benchmark creation."""
        benchmark = agility_tester._create_benchmark(
            "ml-kem-768", TestType.THROUGHPUT, sample_benchmark_config
        )
        
        assert benchmark.algorithm_name == "ml-kem-768"
        assert benchmark.algorithm_type == AlgorithmType.KEY_EXCHANGE
        assert benchmark.config.name == sample_benchmark_config.name

    @pytest.mark.asyncio
    async def test_migration_test(self, agility_tester):
        """Test migration performance testing."""
        migration_test = MigrationTest(
            name="RSA to ML-DSA Migration",
            source_algorithm="rsa-2048",
            target_algorithm="ml-dsa-65",
            migration_strategy="hybrid_transition"
        )
        
        result = await agility_tester._run_migration_test(migration_test)
        
        assert result.migration_test_id == migration_test.id
        assert result.baseline_performance is not None
        assert result.migrated_performance is not None
        assert result.performance_ratio > 0
        assert len(result.recommendations) > 0

    def test_default_algorithms(self, agility_tester):
        """Test default algorithm list."""
        defaults = agility_tester._get_default_algorithms()
        assert len(defaults) > 0
        assert any("rsa" in algo for algo in defaults)
        assert any("ml-" in algo for algo in defaults)

    def test_migration_test_generation(self, agility_tester):
        """Test migration test scenario generation."""
        tests = agility_tester._generate_migration_tests(["rsa-2048", "ml-kem-768"])
        assert len(tests) > 0
        
        # Check for common migration paths
        sources = [test.source_algorithm for test in tests]
        targets = [test.target_algorithm for test in tests]
        assert any("rsa" in source for source in sources)
        assert any("ml-" in target for target in targets)

    def test_performance_ratio_calculation(self, agility_tester):
        """Test performance ratio calculation."""
        from quantum_scanner.services.quantum_agility_tester.models import (
            PerformanceResult, PerformanceMetrics
        )
        
        from uuid import uuid4
        baseline = PerformanceResult(
            benchmark_id=uuid4(),
            algorithm_name="rsa-2048",
            test_type=TestType.THROUGHPUT,
            data_size=1024,
            metrics=PerformanceMetrics(throughput_ops_per_sec=1000.0),
            environment_info={},
            execution_time=1.0
        )
        
        migrated = PerformanceResult(
            benchmark_id=uuid4(),
            algorithm_name="ml-dsa-65",
            test_type=TestType.THROUGHPUT,
            data_size=1024,
            metrics=PerformanceMetrics(throughput_ops_per_sec=500.0),
            environment_info={},
            execution_time=1.0
        )
        
        ratio = agility_tester._calculate_performance_ratio(baseline, migrated)
        assert ratio == 0.5

    def test_risk_score_calculation(self, agility_tester):
        """Test risk score calculation."""
        from quantum_scanner.services.quantum_agility_tester.models import (
            PerformanceResult, PerformanceMetrics, MigrationResult
        )
        
        from uuid import uuid4
        performance_results = [
            PerformanceResult(
                benchmark_id=uuid4(),
                algorithm_name="rsa-2048",
                test_type=TestType.THROUGHPUT,
                data_size=1024,
                metrics=PerformanceMetrics(throughput_ops_per_sec=1000.0),
                environment_info={},
                execution_time=1.0
            )
        ]
        
        migration_results = []
        
        risk_score = agility_tester._calculate_risk_score(performance_results, migration_results)
        assert 0.0 <= risk_score <= 1.0

    def test_system_info_collection(self, agility_tester):
        """Test system information collection."""
        system_info = agility_tester._get_system_info()
        
        assert "platform" in system_info
        assert "processor" in system_info
        assert "cpu_count" in system_info
        assert "memory_gb" in system_info
        assert "python_version" in system_info
        assert isinstance(system_info["cpu_count"], int)
        assert isinstance(system_info["memory_gb"], (int, float))


class TestAgilityModels:
    """Test suite for agility tester models."""

    def test_benchmark_config_creation(self, sample_benchmark_config):
        """Test benchmark configuration creation."""
        assert sample_benchmark_config.name == "test_benchmark"
        assert sample_benchmark_config.iterations == 100
        assert len(sample_benchmark_config.data_sizes) == 2
        assert sample_benchmark_config.iterations > 0

    def test_scan_request_validation(self, sample_scan_request):
        """Test scan request validation."""
        assert len(sample_scan_request.target_systems) > 0
        assert len(sample_scan_request.algorithms_to_test) > 0
        assert sample_scan_request.include_migration_tests is True

    def test_performance_benchmark_creation(self):
        """Test performance benchmark creation."""
        benchmark = PerformanceBenchmark(
            algorithm_name="ml-kem-768",
            algorithm_type=AlgorithmType.KEY_EXCHANGE,
            config=BenchmarkConfig(name="test")
        )
        
        assert benchmark.algorithm_name == "ml-kem-768"
        assert benchmark.algorithm_type == AlgorithmType.KEY_EXCHANGE
        assert benchmark.created_at is not None


@pytest.mark.integration
class TestAgilityAPI:
    """Integration tests for agility API endpoints."""

    def test_scan_endpoint_structure(self):
        """Test that scan endpoint accepts proper request structure."""
        # This would test the actual API endpoint
        # For now, just validate request structure
        request = AgilityScanRequest(
            target_systems=["system1"],
            algorithms_to_test=["rsa-2048"],
            test_types=[TestType.THROUGHPUT]
        )
        
        assert request.target_systems == ["system1"]
        assert TestType.THROUGHPUT in request.test_types

    def test_benchmark_endpoint_structure(self):
        """Test benchmark endpoint structure."""
        config = BenchmarkConfig(name="api_test")
        benchmark = PerformanceBenchmark(
            algorithm_name="test-algo",
            algorithm_type=AlgorithmType.DIGITAL_SIGNATURE,
            config=config
        )
        
        assert benchmark.algorithm_name == "test-algo"
        assert benchmark.config.name == "api_test"
