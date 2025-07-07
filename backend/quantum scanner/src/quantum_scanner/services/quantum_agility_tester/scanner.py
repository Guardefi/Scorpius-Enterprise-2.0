"""Quantum Agility Tester - Core scanning and benchmarking logic."""

import asyncio
import time
# import psutil  # Temporarily commented out
import platform
from typing import List, Dict, Any, Optional
from uuid import uuid4

from ...core.logging import get_logger
from ...core.exceptions import ScanError
from .models import (
    PerformanceBenchmark,
    PerformanceResult,
    PerformanceMetrics,
    MigrationTest,
    MigrationResult,
    AgilityScanRequest,
    AgilityScanResult,
    BenchmarkConfig,
    TestType,
    AlgorithmType,
)

logger = get_logger(__name__)


class QuantumAgilityTester:
    """Core quantum agility testing engine."""

    def __init__(self):
        """Initialize the quantum agility tester."""
        self.supported_algorithms = {
            "classical": {
                "rsa": {"type": AlgorithmType.DIGITAL_SIGNATURE, "key_sizes": [2048, 3072, 4096]},
                "ecdsa": {"type": AlgorithmType.DIGITAL_SIGNATURE, "curves": ["P-256", "P-384", "P-521"]},
                "ecdh": {"type": AlgorithmType.KEY_EXCHANGE, "curves": ["P-256", "P-384", "P-521"]},
                "aes": {"type": AlgorithmType.SYMMETRIC_ENCRYPTION, "key_sizes": [128, 192, 256]},
            },
            "pqc": {
                "ml-kem": {"type": AlgorithmType.KEY_EXCHANGE, "variants": ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"]},
                "ml-dsa": {"type": AlgorithmType.DIGITAL_SIGNATURE, "variants": ["ML-DSA-44", "ML-DSA-65", "ML-DSA-87"]},
                "slh-dsa": {"type": AlgorithmType.DIGITAL_SIGNATURE, "variants": ["SLH-DSA-128s", "SLH-DSA-192f"]},
                "falcon": {"type": AlgorithmType.DIGITAL_SIGNATURE, "variants": ["Falcon-512", "Falcon-1024"]},
            }
        }

    async def scan_system_agility(self, request: AgilityScanRequest) -> AgilityScanResult:
        """Perform comprehensive quantum agility scan."""
        logger.info("Starting quantum agility scan", 
                   target_systems=request.target_systems,
                   algorithms=request.algorithms_to_test)
        
        try:
            performance_results = []
            migration_results = []
            
            # Run performance benchmarks
            for algorithm in request.algorithms_to_test or self._get_default_algorithms():
                for test_type in request.test_types or [TestType.THROUGHPUT, TestType.LATENCY]:
                    benchmark = self._create_benchmark(algorithm, test_type, request.config)
                    result = await self._run_performance_test(benchmark)
                    performance_results.append(result)
            
            # Run migration tests if requested
            if request.include_migration_tests:
                migration_tests = self._generate_migration_tests(request.algorithms_to_test)
                for migration_test in migration_tests:
                    migration_result = await self._run_migration_test(migration_test)
                    migration_results.append(migration_result)
            
            # Calculate overall scores
            risk_score = self._calculate_risk_score(performance_results, migration_results)
            readiness_score = self._calculate_readiness_score(performance_results, migration_results)
            recommendations = self._generate_recommendations(performance_results, migration_results)
            
            return AgilityScanResult(
                request_id=uuid4(),
                performance_results=performance_results,
                migration_results=migration_results,
                recommendations=recommendations,
                risk_score=risk_score,
                readiness_score=readiness_score,
                metadata=self._get_system_info()
            )
            
        except Exception as e:
            logger.error("Quantum agility scan failed", error=str(e))
            raise ScanError(f"Agility scan failed: {str(e)}")

    async def _run_performance_test(self, benchmark: PerformanceBenchmark) -> PerformanceResult:
        """Run a single performance test."""
        logger.debug("Running performance test", 
                    algorithm=benchmark.algorithm_name,
                    test_type=benchmark.config.name)
        
        start_time = time.time()
        
        try:
            # Simulate performance testing
            # In real implementation, this would call actual crypto libraries
            metrics = await self._measure_algorithm_performance(
                benchmark.algorithm_name,
                benchmark.config
            )
            
            execution_time = time.time() - start_time
            
            return PerformanceResult(
                benchmark_id=benchmark.id,
                algorithm_name=benchmark.algorithm_name,
                test_type=TestType.THROUGHPUT,  # Default for simulation
                data_size=benchmark.config.data_sizes[0] if benchmark.config.data_sizes else 1024,
                metrics=metrics,
                environment_info=self._get_system_info(),
                execution_time=execution_time
            )
            
        except Exception as e:
            logger.error("Performance test failed", 
                        algorithm=benchmark.algorithm_name, 
                        error=str(e))
            return PerformanceResult(
                benchmark_id=benchmark.id,
                algorithm_name=benchmark.algorithm_name,
                test_type=TestType.THROUGHPUT,
                data_size=1024,
                metrics=PerformanceMetrics(),
                environment_info=self._get_system_info(),
                execution_time=time.time() - start_time,
                error_message=str(e)
            )

    async def _measure_algorithm_performance(self, algorithm: str, config: BenchmarkConfig) -> PerformanceMetrics:
        """Measure performance metrics for an algorithm."""
        # Simulate performance measurements
        # In production, this would use actual cryptographic libraries
        
        if algorithm.startswith("ml-"):
            # PQC algorithms typically have different performance characteristics
            return PerformanceMetrics(
                throughput_ops_per_sec=500.0,  # Lower throughput for PQC
                latency_ms=2.5,  # Higher latency
                memory_usage_mb=8.0,  # Higher memory usage
                cpu_usage_percent=45.0,
                key_size_bytes=1568 if "kem" in algorithm else 2592,
                signature_size_bytes=2420 if "dsa" in algorithm else None,
                success_rate=1.0
            )
        else:
            # Classical algorithms
            return PerformanceMetrics(
                throughput_ops_per_sec=2000.0,  # Higher throughput
                latency_ms=0.8,  # Lower latency
                memory_usage_mb=2.0,  # Lower memory usage
                cpu_usage_percent=25.0,
                key_size_bytes=256 if algorithm == "ecdsa" else 4096,
                signature_size_bytes=64 if algorithm == "ecdsa" else 512,
                success_rate=1.0
            )

    async def _run_migration_test(self, migration_test: MigrationTest) -> MigrationResult:
        """Run migration performance test."""
        logger.debug("Running migration test", 
                    source=migration_test.source_algorithm,
                    target=migration_test.target_algorithm)
        
        # Create benchmarks for source and target algorithms
        source_benchmark = self._create_benchmark(migration_test.source_algorithm, TestType.THROUGHPUT)
        target_benchmark = self._create_benchmark(migration_test.target_algorithm, TestType.THROUGHPUT)
        
        # Run performance tests
        baseline_result = await self._run_performance_test(source_benchmark)
        migrated_result = await self._run_performance_test(target_benchmark)
        
        # Calculate performance ratios
        performance_ratio = self._calculate_performance_ratio(baseline_result, migrated_result)
        migration_overhead = self._calculate_migration_overhead(baseline_result, migrated_result)
        compatibility_score = self._assess_compatibility(migration_test)
        
        recommendations = self._generate_migration_recommendations(
            migration_test, performance_ratio, compatibility_score
        )
        
        return MigrationResult(
            migration_test_id=migration_test.id,
            baseline_performance=baseline_result,
            migrated_performance=migrated_result,
            performance_ratio=performance_ratio,
            migration_overhead=migration_overhead,
            compatibility_score=compatibility_score,
            recommendations=recommendations
        )

    def _create_benchmark(self, algorithm: str, test_type: TestType, config: Optional[BenchmarkConfig] = None) -> PerformanceBenchmark:
        """Create a performance benchmark."""
        if config is None:
            config = BenchmarkConfig(name=f"{algorithm}_{test_type.value}")
        
        algorithm_type = self._get_algorithm_type(algorithm)
        
        return PerformanceBenchmark(
            algorithm_name=algorithm,
            algorithm_type=algorithm_type,
            config=config
        )

    def _get_algorithm_type(self, algorithm: str) -> AlgorithmType:
        """Determine the type of algorithm."""
        if any(name in algorithm.lower() for name in ["kem", "ecdh", "dh"]):
            return AlgorithmType.KEY_EXCHANGE
        elif any(name in algorithm.lower() for name in ["dsa", "rsa", "ecdsa", "falcon"]):
            return AlgorithmType.DIGITAL_SIGNATURE
        elif any(name in algorithm.lower() for name in ["aes", "chacha"]):
            return AlgorithmType.SYMMETRIC_ENCRYPTION
        else:
            return AlgorithmType.HASH_FUNCTION

    def _get_default_algorithms(self) -> List[str]:
        """Get default list of algorithms to test."""
        return [
            "rsa-2048", "ecdsa-p256", "aes-256",  # Classical
            "ml-kem-768", "ml-dsa-65", "slh-dsa-128s"  # PQC
        ]

    def _generate_migration_tests(self, algorithms: Optional[List[str]]) -> List[MigrationTest]:
        """Generate migration test scenarios."""
        tests = []
        
        # Common migration paths
        migration_paths = [
            ("rsa-2048", "ml-dsa-65"),
            ("ecdsa-p256", "ml-dsa-44"),
            ("ecdh-p256", "ml-kem-768"),
        ]
        
        for source, target in migration_paths:
            test = MigrationTest(
                name=f"Migration from {source} to {target}",
                source_algorithm=source,
                target_algorithm=target,
                migration_strategy="hybrid_transition",
                test_scenarios=["baseline", "hybrid", "full_migration"]
            )
            tests.append(test)
        
        return tests

    def _calculate_performance_ratio(self, baseline: PerformanceResult, migrated: PerformanceResult) -> float:
        """Calculate performance ratio between baseline and migrated."""
        if (baseline.metrics.throughput_ops_per_sec is None or 
            migrated.metrics.throughput_ops_per_sec is None or
            baseline.metrics.throughput_ops_per_sec == 0):
            return 1.0
        
        return migrated.metrics.throughput_ops_per_sec / baseline.metrics.throughput_ops_per_sec

    def _calculate_migration_overhead(self, baseline: PerformanceResult, migrated: PerformanceResult) -> float:
        """Calculate migration overhead percentage."""
        ratio = self._calculate_performance_ratio(baseline, migrated)
        return (1.0 - ratio) * 100.0

    def _assess_compatibility(self, migration_test: MigrationTest) -> float:
        """Assess compatibility score for migration."""
        # Simplified compatibility assessment
        compatibility_scores = {
            "ml-kem": 0.9,  # High compatibility
            "ml-dsa": 0.85,
            "slh-dsa": 0.8,
            "falcon": 0.75,
        }
        
        for algo, score in compatibility_scores.items():
            if algo in migration_test.target_algorithm.lower():
                return score
        
        return 0.7  # Default compatibility

    def _generate_migration_recommendations(self, test: MigrationTest, ratio: float, compatibility: float) -> List[str]:
        """Generate migration recommendations."""
        recommendations = []
        
        if ratio < 0.5:
            recommendations.append("Consider phased migration due to significant performance impact")
        elif ratio < 0.8:
            recommendations.append("Implement hybrid approach during transition period")
        else:
            recommendations.append("Direct migration feasible with minimal performance impact")
        
        if compatibility < 0.8:
            recommendations.append("Review integration points for compatibility issues")
        
        recommendations.append(f"Expected performance change: {(1-ratio)*100:.1f}%")
        
        return recommendations

    def _calculate_risk_score(self, performance_results: List[PerformanceResult], 
                            migration_results: List[MigrationResult]) -> float:
        """Calculate overall quantum risk score."""
        # Simplified risk calculation
        risk_factors = 0.0
        total_factors = 0
        
        for result in performance_results:
            if "rsa" in result.algorithm_name.lower() or "ecdsa" in result.algorithm_name.lower():
                risk_factors += 0.9  # High risk for quantum-vulnerable algorithms
            total_factors += 1
        
        for migration in migration_results:
            if migration.performance_ratio < 0.5:
                risk_factors += 0.3  # Performance impact adds risk
            total_factors += 1
        
        return risk_factors / max(total_factors, 1)

    def _calculate_readiness_score(self, performance_results: List[PerformanceResult], 
                                 migration_results: List[MigrationResult]) -> float:
        """Calculate quantum readiness score."""
        readiness_factors = 0.0
        total_factors = 0
        
        for result in performance_results:
            if any(pqc in result.algorithm_name.lower() for pqc in ["ml-", "slh-", "falcon"]):
                if result.error_message is None:
                    readiness_factors += 0.8  # Successful PQC test
            total_factors += 1
        
        for migration in migration_results:
            readiness_factors += migration.compatibility_score
            total_factors += 1
        
        return readiness_factors / max(total_factors, 1)

    def _generate_recommendations(self, performance_results: List[PerformanceResult], 
                                migration_results: List[MigrationResult]) -> List[str]:
        """Generate overall recommendations."""
        recommendations = []
        
        # Check for quantum-vulnerable algorithms
        vulnerable_algos = [r.algorithm_name for r in performance_results 
                          if any(vuln in r.algorithm_name.lower() for vuln in ["rsa", "ecdsa", "ecdh"])]
        
        if vulnerable_algos:
            recommendations.append(f"Migrate quantum-vulnerable algorithms: {', '.join(vulnerable_algos)}")
        
        # Performance recommendations
        slow_migrations = [m for m in migration_results if m.performance_ratio < 0.5]
        if slow_migrations:
            recommendations.append("Consider hardware acceleration for PQC algorithms with significant performance impact")
        
        # General recommendations
        recommendations.extend([
            "Implement crypto-agility framework for future algorithm transitions",
            "Establish performance baseline monitoring for PQC algorithms",
            "Plan phased migration starting with low-risk systems"
        ])
        
        return recommendations

    def _get_system_info(self) -> Dict[str, Any]:
        """Get system information for test context."""
        return {
            "platform": platform.platform(),
            "processor": platform.processor(),
            "cpu_count": 4,  # Default value, replace with psutil.cpu_count() when available
            "memory_gb": 8.0,  # Default value, replace with psutil calculation when available
            "python_version": platform.python_version(),
        }
