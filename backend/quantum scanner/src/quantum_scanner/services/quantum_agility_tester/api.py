"""FastAPI router for Quantum Agility Tester service."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse

from ...core.logging import get_logger
from .models import (
    AgilityScanRequest,
    AgilityScanResult,
    PerformanceBenchmark,
    PerformanceResult,
    MigrationTest,
    MigrationResult,
    BenchmarkConfig,
)
from .scanner import QuantumAgilityTester

logger = get_logger(__name__)
router = APIRouter(prefix="/quantum-agility", tags=["quantum-agility"])

# Global scanner instance
scanner = QuantumAgilityTester()


@router.post("/scan", response_model=AgilityScanResult)
async def perform_agility_scan(request: AgilityScanRequest):
    """Perform quantum agility performance scan."""
    try:
        logger.info("Starting agility scan", target_systems=request.target_systems)
        result = await scanner.scan_system_agility(request)
        logger.info("Agility scan completed", 
                   result_id=str(result.id),
                   readiness_score=result.readiness_score)
        return result
    except Exception as e:
        logger.error("Agility scan failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


@router.post("/benchmark", response_model=PerformanceResult)
async def run_performance_benchmark(benchmark: PerformanceBenchmark):
    """Run a single performance benchmark."""
    try:
        logger.info("Running benchmark", 
                   algorithm=benchmark.algorithm_name,
                   config=benchmark.config.name)
        result = await scanner._run_performance_test(benchmark)
        return result
    except Exception as e:
        logger.error("Benchmark failed", 
                    algorithm=benchmark.algorithm_name, 
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Benchmark failed: {str(e)}")


@router.post("/migration-test", response_model=MigrationResult)
async def run_migration_test(migration_test: MigrationTest):
    """Run migration performance test."""
    try:
        logger.info("Running migration test",
                   source=migration_test.source_algorithm,
                   target=migration_test.target_algorithm)
        result = await scanner._run_migration_test(migration_test)
        return result
    except Exception as e:
        logger.error("Migration test failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Migration test failed: {str(e)}")


@router.get("/algorithms")
async def list_supported_algorithms():
    """List supported algorithms for testing."""
    return JSONResponse(content={
        "classical_algorithms": list(scanner.supported_algorithms["classical"].keys()),
        "pqc_algorithms": list(scanner.supported_algorithms["pqc"].keys()),
        "default_test_set": scanner._get_default_algorithms()
    })


@router.get("/benchmark-configs")
async def get_benchmark_configs():
    """Get available benchmark configurations."""
    configs = [
        {
            "name": "quick_test",
            "description": "Quick performance test",
            "iterations": 100,
            "data_sizes": [1024, 4096]
        },
        {
            "name": "comprehensive_test", 
            "description": "Comprehensive performance analysis",
            "iterations": 1000,
            "data_sizes": [1024, 4096, 16384, 65536]
        },
        {
            "name": "production_simulation",
            "description": "Production workload simulation",
            "iterations": 5000,
            "data_sizes": [4096, 16384, 65536, 262144]
        }
    ]
    return JSONResponse(content={"configs": configs})


@router.get("/results/{result_id}")
async def get_scan_result(result_id: UUID):
    """Retrieve scan results by ID."""
    # In production, this would query a database
    raise HTTPException(status_code=404, detail="Result storage not implemented")


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return JSONResponse(content={
        "status": "healthy",
        "service": "quantum-agility-tester",
        "algorithms_supported": {
            "classical": len(scanner.supported_algorithms["classical"]),
            "pqc": len(scanner.supported_algorithms["pqc"])
        }
    })
