"""Cryptographic classifiers for quantum compliance assessment."""

from typing import Dict, List, Any
from dataclasses import dataclass

from ...core.logging import get_logger
from .models import CryptoComponent, QuantumVulnerabilityLevel

logger = get_logger(__name__)


@dataclass
class ClassificationResult:
    """Result of cryptographic classification."""
    algorithm: str
    quantum_safe: bool
    fips_compliant: bool
    confidence: float
    compliance_notes: List[str]


class PQCComplianceClassifier:
    """Classifier for Post-Quantum Cryptography compliance assessment."""
    
    def __init__(self):
        """Initialize the PQC classifier."""
        self.quantum_safe_algorithms = {
            # NIST PQC winners
            'kyber': {'variants': ['kyber512', 'kyber768', 'kyber1024'], 'type': 'kem'},
            'dilithium': {'variants': ['dilithium2', 'dilithium3', 'dilithium5'], 'type': 'signature'},
            'sphincs+': {'variants': ['sphincs-shake-128s', 'sphincs-shake-256s'], 'type': 'signature'},
            'falcon': {'variants': ['falcon-512', 'falcon-1024'], 'type': 'signature'},
            
            # NIST standardized names
            'ml-kem': {'variants': ['ml-kem-512', 'ml-kem-768', 'ml-kem-1024'], 'type': 'kem'},
            'ml-dsa': {'variants': ['ml-dsa-44', 'ml-dsa-65', 'ml-dsa-87'], 'type': 'signature'},
            'slh-dsa': {'variants': ['slh-dsa-shake-128s', 'slh-dsa-shake-256s'], 'type': 'signature'},
            
            # Symmetric algorithms (quantum-resistant with increased key sizes)
            'aes-256': {'variants': ['aes-256-gcm', 'aes-256-cbc'], 'type': 'symmetric'},
            'chacha20': {'variants': ['chacha20-poly1305'], 'type': 'symmetric'},
            'sha-3': {'variants': ['sha3-256', 'sha3-384', 'sha3-512'], 'type': 'hash'},
            'shake': {'variants': ['shake128', 'shake256'], 'type': 'hash'},
        }
        
        self.quantum_vulnerable_algorithms = {
            'rsa': {'key_sizes': [1024, 2048, 3072, 4096], 'type': 'asymmetric'},
            'ecdsa': {'curves': ['p-256', 'p-384', 'p-521'], 'type': 'signature'},
            'ecdh': {'curves': ['p-256', 'p-384', 'p-521'], 'type': 'key_exchange'},
            'dsa': {'key_sizes': [1024, 2048, 3072], 'type': 'signature'},
            'dh': {'key_sizes': [1024, 2048, 3072], 'type': 'key_exchange'},
        }
        
        self.deprecated_algorithms = {
            'md5': {'reason': 'cryptographically broken'},
            'sha1': {'reason': 'collision attacks'},
            'des': {'reason': 'insufficient key size'},
            '3des': {'reason': 'deprecated by NIST'},
            'rc4': {'reason': 'known vulnerabilities'},
        }
    
    async def classify(self, crypto_component: CryptoComponent) -> ClassificationResult:
        """Classify a cryptographic component for quantum compliance."""
        algorithm = crypto_component.algorithm.lower()
        
        # Check if quantum-safe
        quantum_safe = self._is_quantum_safe(algorithm)
        
        # Check FIPS compliance
        fips_compliant = self._is_fips_compliant(algorithm, crypto_component.key_size)
        
        # Calculate confidence score
        confidence = self._calculate_confidence(algorithm, crypto_component)
        
        # Generate compliance notes
        compliance_notes = self._generate_compliance_notes(algorithm, crypto_component)
        
        return ClassificationResult(
            algorithm=algorithm,
            quantum_safe=quantum_safe,
            fips_compliant=fips_compliant,
            confidence=confidence,
            compliance_notes=compliance_notes,
        )
    
    def _is_quantum_safe(self, algorithm: str) -> bool:
        """Check if algorithm is quantum-safe."""
        # Check against known quantum-safe algorithms
        for safe_alg in self.quantum_safe_algorithms:
            if safe_alg in algorithm:
                return True
        
        # Check for symmetric algorithms with sufficient key size
        if 'aes' in algorithm:
            # AES-256 is considered quantum-resistant
            if '256' in algorithm:
                return True
            # AES-128 provides 64-bit quantum security (half of classical)
            if '128' in algorithm:
                return False  # Not sufficient for long-term quantum resistance
        
        return False
    
    def _is_fips_compliant(self, algorithm: str, key_size: int = None) -> bool:
        """Check if algorithm is FIPS compliant."""
        fips_approved = {
            'aes': [128, 192, 256],
            'sha': [224, 256, 384, 512],
            'sha-3': [224, 256, 384, 512],
            'rsa': [2048, 3072, 4096],  # Minimum 2048 bits
            'ecdsa': [256, 384, 521],  # P-256, P-384, P-521 curves
        }
        
        for fips_alg, valid_sizes in fips_approved.items():
            if fips_alg in algorithm:
                if key_size is None:
                    return True  # Assume compliant if no key size specified
                return key_size in valid_sizes
        
        # Check deprecated algorithms
        if any(dep_alg in algorithm for dep_alg in self.deprecated_algorithms):
            return False
        
        return False  # Conservative approach for unknown algorithms
    
    def _calculate_confidence(self, algorithm: str, crypto_component: CryptoComponent) -> float:
        """Calculate confidence score for the classification."""
        confidence = 0.5  # Base confidence
        
        # Increase confidence for well-known algorithms
        known_algorithms = list(self.quantum_safe_algorithms.keys()) + \
                          list(self.quantum_vulnerable_algorithms.keys()) + \
                          list(self.deprecated_algorithms.keys())
        
        if any(known_alg in algorithm for known_alg in known_algorithms):
            confidence += 0.3
        
        # Increase confidence if we have key size information
        if crypto_component.key_size:
            confidence += 0.1
        
        # Increase confidence if we have library information
        if crypto_component.library and crypto_component.library != "Unknown":
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    def _generate_compliance_notes(self, algorithm: str, crypto_component: CryptoComponent) -> List[str]:
        """Generate compliance notes for the algorithm."""
        notes = []
        
        # Check if deprecated
        for dep_alg, info in self.deprecated_algorithms.items():
            if dep_alg in algorithm:
                notes.append(f"Algorithm {dep_alg} is deprecated: {info['reason']}")
        
        # Check quantum vulnerability
        for vuln_alg in self.quantum_vulnerable_algorithms:
            if vuln_alg in algorithm:
                notes.append(f"Algorithm {vuln_alg} is vulnerable to quantum attacks")
                notes.append("Migration to post-quantum cryptography recommended")
        
        # Check key size recommendations
        if crypto_component.key_size:
            if 'rsa' in algorithm and crypto_component.key_size < 2048:
                notes.append(f"RSA key size {crypto_component.key_size} is below recommended minimum of 2048 bits")
            elif 'aes' in algorithm and crypto_component.key_size < 256:
                notes.append(f"AES key size {crypto_component.key_size} may not provide adequate quantum resistance")
        
        # Positive notes for quantum-safe algorithms
        for safe_alg in self.quantum_safe_algorithms:
            if safe_alg in algorithm:
                notes.append(f"Algorithm {safe_alg} is quantum-safe")
                break
        
        return notes


class FIPS203205Validator:
    """Validator for FIPS 203, 204, 205 post-quantum cryptography standards."""
    
    def __init__(self):
        """Initialize the FIPS validator."""
        self.fips_203_algorithms = ['ml-kem-512', 'ml-kem-768', 'ml-kem-1024']  # Key encapsulation
        self.fips_204_algorithms = ['ml-dsa-44', 'ml-dsa-65', 'ml-dsa-87']      # Digital signatures
        self.fips_205_algorithms = ['slh-dsa-shake-128s', 'slh-dsa-shake-256s'] # Stateless hash-based signatures
    
    async def validate(self, crypto_component: CryptoComponent) -> bool:
        """Validate component against FIPS 203-205 standards."""
        algorithm = crypto_component.algorithm.lower()
        
        # Check FIPS 203 (ML-KEM)
        if any(fips_alg in algorithm for fips_alg in self.fips_203_algorithms):
            return True
        
        # Check FIPS 204 (ML-DSA)
        if any(fips_alg in algorithm for fips_alg in self.fips_204_algorithms):
            return True
        
        # Check FIPS 205 (SLH-DSA)
        if any(fips_alg in algorithm for fips_alg in self.fips_205_algorithms):
            return True
        
        # Also accept the research names that map to these standards
        research_to_fips = {
            'kyber': self.fips_203_algorithms,
            'dilithium': self.fips_204_algorithms,
            'sphincs': self.fips_205_algorithms,
        }
        
        for research_name, fips_algs in research_to_fips.items():
            if research_name in algorithm:
                return True
        
        return False
