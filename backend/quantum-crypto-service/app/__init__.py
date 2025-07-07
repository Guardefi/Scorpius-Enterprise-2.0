"""
SCORPIUS QUANTUM CRYPTOGRAPHY MODULE
Advanced quantum-resistant cryptographic implementations for future-proof security.
"""

from .quantum_cryptography import (
    QuantumCryptographyEngine,
    initialize_quantum_crypto,
    QuantumAlgorithm,
    SecurityLevel,
    QuantumKey,
    QuantumSignature,
    QuantumEncryptionResult,
    LatticeBasedCrypto,
    HashBasedSignatures,
    QuantumKeyDistribution
)
from .app import app

__all__ = [
    "QuantumCryptographyEngine",
    "initialize_quantum_crypto",
    "QuantumAlgorithm",
    "SecurityLevel",
    "QuantumKey",
    "QuantumSignature",
    "QuantumEncryptionResult",
    "LatticeBasedCrypto",
    "HashBasedSignatures",
    "QuantumKeyDistribution",
    "app"
]

__version__ = "1.0.0" 