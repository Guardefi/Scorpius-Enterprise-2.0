"""FastAPI router for Attack Simulator service."""

from typing import List, Dict, Any
from uuid import UUID

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from ...core.logging import get_logger
from .models import (
    SimulationRequest,
    SimulationReport,
    AttackType,
    QuantumHardware,
    TimelineEstimate,
    ThreatLevel,
)
from .simulator import AttackSimulator

logger = get_logger(__name__)
router = APIRouter(prefix="/attack-simulator", tags=["attack-simulator"])

# Global simulator instance
simulator = AttackSimulator()


@router.post("/simulate", response_model=SimulationReport)
async def simulate_quantum_attacks(request: SimulationRequest):
    """Perform quantum attack simulation."""
    try:
        logger.info("Starting attack simulation", 
                   algorithms=request.target_algorithms,
                   attack_types=request.attack_types)
        result = await simulator.simulate_attacks(request)
        logger.info("Attack simulation completed", 
                   result_id=str(result.id),
                   risk_score=result.risk_score)
        return result
    except Exception as e:
        logger.error("Attack simulation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.get("/attack-types")
async def list_attack_types():
    """List supported quantum attack types."""
    return JSONResponse(content={
        "attack_types": [attack_type.value for attack_type in AttackType],
        "descriptions": {
            AttackType.SHORS_ALGORITHM.value: "Factorization and discrete logarithm attacks",
            AttackType.GROVERS_ALGORITHM.value: "Symmetric key and hash function attacks",
            AttackType.QUANTUM_PERIOD_FINDING.value: "Period finding for cryptanalysis",
            AttackType.QUANTUM_FOURIER_TRANSFORM.value: "QFT-based attacks",
            AttackType.VARIATIONAL_QUANTUM_ATTACK.value: "NISQ-era variational attacks"
        }
    })


@router.get("/quantum-capabilities")
async def get_quantum_capabilities():
    """Get current and projected quantum computing capabilities."""
    capabilities = [cap.dict() for cap in simulator.quantum_roadmap]
    return JSONResponse(content={
        "roadmap": capabilities,
        "current_year": simulator._get_current_quantum_capability().year,
        "hardware_types": [hw.value for hw in QuantumHardware]
    })


@router.post("/timeline-estimate")
async def estimate_break_timeline(algorithm: str, key_size: int, confidence_level: float = 0.95):
    """Estimate when an algorithm will be quantum-breakable."""
    try:
        timeline = await simulator._estimate_break_timeline(algorithm, key_size, confidence_level)
        return timeline
    except Exception as e:
        logger.error("Timeline estimation failed", 
                    algorithm=algorithm, 
                    key_size=key_size, 
                    error=str(e))
        raise HTTPException(status_code=500, detail=f"Timeline estimation failed: {str(e)}")


@router.get("/vulnerable-algorithms")
async def list_vulnerable_algorithms():
    """List algorithms vulnerable to quantum attacks."""
    vulnerable = {
        "asymmetric_crypto": {
            "rsa": {
                "attack_type": "Shor's Algorithm",
                "threat_level": ThreatLevel.CRITICAL.value,
                "typical_key_sizes": [1024, 2048, 3072, 4096],
                "quantum_advantage": "Exponential"
            },
            "ecdsa": {
                "attack_type": "Shor's Algorithm (ECDLP)",
                "threat_level": ThreatLevel.CRITICAL.value,
                "typical_key_sizes": [256, 384, 521],
                "quantum_advantage": "Exponential"
            },
            "ecdh": {
                "attack_type": "Shor's Algorithm (ECDLP)",
                "threat_level": ThreatLevel.CRITICAL.value,
                "typical_key_sizes": [256, 384, 521],
                "quantum_advantage": "Exponential"
            },
            "dh": {
                "attack_type": "Shor's Algorithm (DLP)",
                "threat_level": ThreatLevel.CRITICAL.value,
                "typical_key_sizes": [1024, 2048, 3072],
                "quantum_advantage": "Exponential"
            }
        },
        "symmetric_crypto": {
            "aes": {
                "attack_type": "Grover's Algorithm",
                "threat_level": ThreatLevel.MEDIUM.value,
                "typical_key_sizes": [128, 192, 256],
                "quantum_advantage": "Quadratic"
            },
            "des": {
                "attack_type": "Grover's Algorithm",
                "threat_level": ThreatLevel.HIGH.value,
                "typical_key_sizes": [56],
                "quantum_advantage": "Quadratic"
            }
        },
        "hash_functions": {
            "sha256": {
                "attack_type": "Grover's Algorithm",
                "threat_level": ThreatLevel.MEDIUM.value,
                "effective_security": "128-bit",
                "quantum_advantage": "Quadratic"
            },
            "sha1": {
                "attack_type": "Grover's Algorithm", 
                "threat_level": ThreatLevel.HIGH.value,
                "effective_security": "80-bit",
                "quantum_advantage": "Quadratic"
            }
        }
    }
    
    return JSONResponse(content=vulnerable)


@router.get("/pqc-alternatives")
async def list_pqc_alternatives():
    """List post-quantum cryptographic alternatives."""
    alternatives = {
        "key_encapsulation": {
            "ml_kem": {
                "nist_status": "Standard (FIPS 203)",
                "variants": ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"],
                "security_levels": [1, 3, 5],
                "replaces": ["RSA-OAEP", "ECDH"]
            }
        },
        "digital_signatures": {
            "ml_dsa": {
                "nist_status": "Standard (FIPS 204)",
                "variants": ["ML-DSA-44", "ML-DSA-65", "ML-DSA-87"],
                "security_levels": [2, 3, 5],
                "replaces": ["RSA-PSS", "ECDSA"]
            },
            "slh_dsa": {
                "nist_status": "Standard (FIPS 205)",
                "variants": ["SLH-DSA-128s", "SLH-DSA-128f", "SLH-DSA-192s"],
                "security_levels": [1, 1, 3],
                "replaces": ["RSA-PSS", "ECDSA"]
            },
            "falcon": {
                "nist_status": "Round 3 Finalist",
                "variants": ["Falcon-512", "Falcon-1024"],
                "security_levels": [1, 5],
                "replaces": ["RSA-PSS", "ECDSA"]
            }
        },
        "symmetric_crypto": {
            "aes": {
                "quantum_security": "Double key size (AES-256 → 128-bit security)",
                "recommendation": "Use AES-256 for 128-bit post-quantum security"
            },
            "sha3": {
                "quantum_security": "Half output size (SHA3-256 → 128-bit security)",
                "recommendation": "Use SHA3-512 for 256-bit post-quantum security"
            }
        }
    }
    
    return JSONResponse(content=alternatives)


@router.get("/simulation-templates")
async def get_simulation_templates():
    """Get predefined simulation templates."""
    templates = [
        {
            "name": "Enterprise Assessment",
            "description": "Comprehensive enterprise quantum threat assessment",
            "target_algorithms": ["rsa-2048", "ecdsa-p256", "aes-256"],
            "attack_types": [AttackType.SHORS_ALGORITHM.value, AttackType.GROVERS_ALGORITHM.value],
            "include_timeline": True,
            "confidence_level": 0.95
        },
        {
            "name": "PKI Risk Analysis",
            "description": "Focus on public key infrastructure vulnerabilities",
            "target_algorithms": ["rsa-2048", "rsa-3072", "ecdsa-p256", "ecdsa-p384"],
            "attack_types": [AttackType.SHORS_ALGORITHM.value],
            "include_timeline": True,
            "confidence_level": 0.90
        },
        {
            "name": "Symmetric Crypto Review",
            "description": "Symmetric cryptography quantum impact assessment",
            "target_algorithms": ["aes-128", "aes-192", "aes-256"],
            "attack_types": [AttackType.GROVERS_ALGORITHM.value],
            "include_timeline": True,
            "confidence_level": 0.95
        },
        {
            "name": "Near-term Threat",
            "description": "Focus on immediate quantum threats (next 10 years)",
            "target_algorithms": ["rsa-1024", "rsa-2048", "ecdsa-p256"],
            "attack_types": [AttackType.SHORS_ALGORITHM.value],
            "include_timeline": True,
            "confidence_level": 0.80
        }
    ]
    
    return JSONResponse(content={"templates": templates})


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return JSONResponse(content={
        "status": "healthy",
        "service": "attack-simulator",
        "quantum_roadmap_years": [cap.year for cap in simulator.quantum_roadmap],
        "supported_algorithms": len(simulator.algorithm_parameters)
    })
