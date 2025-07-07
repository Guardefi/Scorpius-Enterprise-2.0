"""
Zero-Trust Security Module for Quantum Scanner

This module implements zero-trust security principles with device attestation,
quantum-safe identity verification, and secure execution environments.
"""

import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from uuid import uuid4, UUID
import base64

from ..core.logging import get_logger
from ..core.cache import cached
from ..core.profiling import profile_function

logger = get_logger(__name__)


class TrustLevel(str, Enum):
    """Device trust levels in zero-trust architecture."""
    UNKNOWN = "unknown"
    UNTRUSTED = "untrusted"
    CONDITIONAL = "conditional"
    TRUSTED = "trusted"
    VERIFIED = "verified"


class SecurityRisk(str, Enum):
    """Security risk levels."""
    MINIMAL = "minimal"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class DeviceIdentity:
    """Device identity and attestation information."""
    device_id: UUID
    device_name: str
    device_type: str
    hardware_fingerprint: str
    software_fingerprint: str
    manufacturer: str
    model: str
    os_version: str
    security_patch_level: str
    trust_level: TrustLevel = TrustLevel.UNKNOWN
    last_attestation: Optional[datetime] = None
    attestation_signature: Optional[str] = None
    compliance_status: Dict[str, bool] = field(default_factory=dict)
    security_features: List[str] = field(default_factory=list)
    
    def calculate_risk_score(self) -> float:
        """Calculate device risk score (0.0 = no risk, 1.0 = maximum risk)."""
        risk_score = 0.0
        
        # Trust level risk
        trust_risks = {
            TrustLevel.UNKNOWN: 0.8,
            TrustLevel.UNTRUSTED: 1.0,
            TrustLevel.CONDITIONAL: 0.5,
            TrustLevel.TRUSTED: 0.2,
            TrustLevel.VERIFIED: 0.0
        }
        risk_score += trust_risks.get(self.trust_level, 0.8)
        
        # Attestation age risk
        if self.last_attestation:
            age_hours = (datetime.utcnow() - self.last_attestation).total_seconds() / 3600
            if age_hours > 24:  # Stale attestation
                risk_score += min(age_hours / 168, 0.3)  # Max 0.3 for week-old attestation
        else:
            risk_score += 0.4  # No attestation
        
        # Compliance risk
        total_checks = len(self.compliance_status)
        if total_checks > 0:
            failed_checks = sum(1 for passed in self.compliance_status.values() if not passed)
            risk_score += (failed_checks / total_checks) * 0.3
        
        # Security features bonus
        security_bonus = min(len(self.security_features) * 0.02, 0.1)
        risk_score = max(0.0, risk_score - security_bonus)
        
        return min(risk_score, 1.0)


@dataclass
class AccessRequest:
    """Request for accessing quantum scanner resources."""
    request_id: UUID = field(default_factory=uuid4)
    device_identity: DeviceIdentity = None
    user_id: str = ""
    resource: str = ""
    operation: str = ""
    timestamp: datetime = field(default_factory=datetime.utcnow)
    context: Dict[str, Any] = field(default_factory=dict)
    risk_assessment: Optional[Dict[str, Any]] = None


@dataclass
class AccessDecision:
    """Decision on access request."""
    request_id: UUID
    decision: bool  # True = allow, False = deny
    trust_score: float
    risk_score: float
    conditions: List[str] = field(default_factory=list)
    expiry: Optional[datetime] = None
    reason: str = ""
    audit_info: Dict[str, Any] = field(default_factory=dict)


class QuantumSafeIdentity:
    """Quantum-safe identity management using post-quantum cryptography."""
    
    def __init__(self):
        """Initialize quantum-safe identity system."""
        self.identity_cache: Dict[str, DeviceIdentity] = {}
        self.attestation_keys: Dict[str, str] = {}
        
        # Supported quantum-safe algorithms
        self.supported_algorithms = [
            "ML-DSA-65",    # NIST ML-DSA (Dilithium)
            "SLH-DSA-128s", # NIST SLH-DSA (SPHINCS+)
            "Falcon-512",   # Falcon
            "XMSS",         # Extended Merkle Signature Scheme
        ]
    
    def generate_device_fingerprint(self, device_info: Dict[str, Any]) -> str:
        """Generate hardware fingerprint for device identification."""
        # Combine hardware-specific information
        fingerprint_data = {
            "cpu_id": device_info.get("cpu_id", "unknown"),
            "motherboard_serial": device_info.get("motherboard_serial", "unknown"),
            "mac_addresses": sorted(device_info.get("mac_addresses", [])),
            "disk_serials": sorted(device_info.get("disk_serials", [])),
            "bios_info": device_info.get("bios_info", {}),
            "tpm_info": device_info.get("tpm_info", {})
        }
        
        # Create deterministic hash
        fingerprint_str = str(sorted(fingerprint_data.items()))
        return hashlib.sha256(fingerprint_str.encode()).hexdigest()
    
    def generate_software_fingerprint(self, software_info: Dict[str, Any]) -> str:
        """Generate software fingerprint for integrity verification."""
        fingerprint_data = {
            "os_version": software_info.get("os_version", "unknown"),
            "kernel_version": software_info.get("kernel_version", "unknown"),
            "installed_packages": sorted(software_info.get("installed_packages", [])),
            "running_processes": sorted(software_info.get("critical_processes", [])),
            "security_features": sorted(software_info.get("security_features", [])),
            "quantum_scanner_version": software_info.get("quantum_scanner_version", "unknown")
        }
        
        fingerprint_str = str(sorted(fingerprint_data.items()))
        return hashlib.sha256(fingerprint_str.encode()).hexdigest()
    
    @profile_function(name="security.device_attestation")
    def perform_device_attestation(self, device_info: Dict[str, Any]) -> DeviceIdentity:
        """Perform comprehensive device attestation."""
        # Generate fingerprints
        hardware_fp = self.generate_device_fingerprint(device_info.get("hardware", {}))
        software_fp = self.generate_software_fingerprint(device_info.get("software", {}))
        
        # Check compliance
        compliance_status = self._check_device_compliance(device_info)
        
        # Determine trust level
        trust_level = self._calculate_trust_level(device_info, compliance_status)
        
        # Extract security features
        security_features = self._extract_security_features(device_info)
        
        # Create device identity
        device_identity = DeviceIdentity(
            device_id=uuid4(),
            device_name=device_info.get("name", "unknown"),
            device_type=device_info.get("type", "unknown"),
            hardware_fingerprint=hardware_fp,
            software_fingerprint=software_fp,
            manufacturer=device_info.get("manufacturer", "unknown"),
            model=device_info.get("model", "unknown"),
            os_version=device_info.get("software", {}).get("os_version", "unknown"),
            security_patch_level=device_info.get("security_patch_level", "unknown"),
            trust_level=trust_level,
            last_attestation=datetime.utcnow(),
            compliance_status=compliance_status,
            security_features=security_features
        )
        
        # Generate attestation signature (placeholder for quantum-safe signature)
        device_identity.attestation_signature = self._generate_attestation_signature(device_identity)
        
        # Cache identity
        self.identity_cache[str(device_identity.device_id)] = device_identity
        
        logger.info("Device attestation completed",
                   device_id=str(device_identity.device_id),
                   trust_level=trust_level.value,
                   risk_score=device_identity.calculate_risk_score())
        
        return device_identity
    
    def _check_device_compliance(self, device_info: Dict[str, Any]) -> Dict[str, bool]:
        """Check device compliance against security policies."""
        compliance = {}
        
        # Check encryption requirements
        compliance["disk_encryption"] = device_info.get("security", {}).get("disk_encrypted", False)
        compliance["network_encryption"] = device_info.get("security", {}).get("tls_enforced", False)
        
        # Check security features
        security_features = device_info.get("security", {}).get("features", [])
        compliance["tpm_enabled"] = "tpm" in security_features
        compliance["secure_boot"] = "secure_boot" in security_features
        compliance["antivirus_active"] = device_info.get("security", {}).get("antivirus_active", False)
        
        # Check patch level
        patch_level = device_info.get("security_patch_level", "")
        if patch_level:
            try:
                patch_date = datetime.fromisoformat(patch_level)
                days_old = (datetime.utcnow() - patch_date).days
                compliance["patches_current"] = days_old <= 30  # Within 30 days
            except (ValueError, TypeError):
                compliance["patches_current"] = False
        else:
            compliance["patches_current"] = False
        
        # Check quantum readiness
        pqc_support = device_info.get("quantum", {}).get("pqc_support", [])
        compliance["quantum_ready"] = any(alg in pqc_support for alg in self.supported_algorithms)
        
        return compliance
    
    def _calculate_trust_level(self, device_info: Dict[str, Any], compliance: Dict[str, bool]) -> TrustLevel:
        """Calculate device trust level based on compliance and security features."""
        compliance_score = sum(compliance.values()) / len(compliance) if compliance else 0
        
        # Check for known good devices
        device_id = device_info.get("device_id")
        if device_id in self.identity_cache:
            cached_device = self.identity_cache[device_id]
            if cached_device.trust_level == TrustLevel.VERIFIED:
                return TrustLevel.VERIFIED
        
        # Determine trust level based on compliance
        if compliance_score >= 0.9:
            return TrustLevel.TRUSTED
        elif compliance_score >= 0.7:
            return TrustLevel.CONDITIONAL
        elif compliance_score >= 0.5:
            return TrustLevel.UNTRUSTED
        else:
            return TrustLevel.UNKNOWN
    
    def _extract_security_features(self, device_info: Dict[str, Any]) -> List[str]:
        """Extract available security features from device info."""
        features = []
        
        security_info = device_info.get("security", {})
        
        # Hardware security features
        if security_info.get("tpm_available"):
            features.append("TPM")
        if security_info.get("secure_enclave"):
            features.append("Secure Enclave")
        if security_info.get("hardware_encryption"):
            features.append("Hardware Encryption")
        
        # Software security features
        if security_info.get("disk_encrypted"):
            features.append("Disk Encryption")
        if security_info.get("firewall_enabled"):
            features.append("Firewall")
        if security_info.get("antivirus_active"):
            features.append("Antivirus")
        
        # Quantum security features
        quantum_info = device_info.get("quantum", {})
        if quantum_info.get("pqc_support"):
            features.append("Post-Quantum Cryptography")
        if quantum_info.get("quantum_rng"):
            features.append("Quantum RNG")
        
        return features
    
    def _generate_attestation_signature(self, device_identity: DeviceIdentity) -> str:
        """Generate quantum-safe attestation signature."""
        # In a real implementation, this would use actual post-quantum signatures
        # For now, we'll use a strong hash-based approach
        
        attestation_data = {
            "device_id": str(device_identity.device_id),
            "hardware_fingerprint": device_identity.hardware_fingerprint,
            "software_fingerprint": device_identity.software_fingerprint,
            "timestamp": device_identity.last_attestation.isoformat(),
            "trust_level": device_identity.trust_level.value
        }
        
        # Create signature using HMAC-SHA3-256 (quantum-resistant)
        message = str(sorted(attestation_data.items())).encode()
        signature_key = secrets.token_bytes(32)  # 256-bit key
        signature = hashlib.sha3_256(signature_key + message).hexdigest()
        
        # Store key for verification (in real implementation, use HSM)
        self.attestation_keys[str(device_identity.device_id)] = base64.b64encode(signature_key).decode()
        
        return signature


class ZeroTrustAccessControl:
    """Zero-trust access control engine for quantum scanner."""
    
    def __init__(self):
        """Initialize zero-trust access control."""
        self.identity_manager = QuantumSafeIdentity()
        self.access_policies: Dict[str, Dict[str, Any]] = {}
        self.access_cache: Dict[str, AccessDecision] = {}
        
        # Load default policies
        self._load_default_policies()
    
    def _load_default_policies(self):
        """Load default access control policies."""
        self.access_policies = {
            "scan:cbom": {
                "min_trust_level": TrustLevel.CONDITIONAL,
                "max_risk_score": 0.7,
                "required_compliance": ["disk_encryption", "patches_current"],
                "session_duration": 3600  # 1 hour
            },
            "scan:quantum_agility": {
                "min_trust_level": TrustLevel.TRUSTED,
                "max_risk_score": 0.5,
                "required_compliance": ["quantum_ready", "secure_boot"],
                "session_duration": 7200  # 2 hours
            },
            "scan:attack_simulation": {
                "min_trust_level": TrustLevel.VERIFIED,
                "max_risk_score": 0.3,
                "required_compliance": ["tpm_enabled", "disk_encryption", "quantum_ready"],
                "session_duration": 1800  # 30 minutes
            },
            "admin:configuration": {
                "min_trust_level": TrustLevel.VERIFIED,
                "max_risk_score": 0.1,
                "required_compliance": ["tpm_enabled", "secure_boot", "quantum_ready"],
                "session_duration": 900  # 15 minutes
            }
        }
    
    @profile_function(name="security.access_evaluation")
    def evaluate_access_request(self, request: AccessRequest) -> AccessDecision:
        """Evaluate access request using zero-trust principles."""
        # Check cache first
        cache_key = f"{request.device_identity.device_id}:{request.resource}:{request.operation}"
        if cache_key in self.access_cache:
            cached_decision = self.access_cache[cache_key]
            if cached_decision.expiry and cached_decision.expiry > datetime.utcnow():
                return cached_decision
        
        # Get policy for resource
        policy = self.access_policies.get(f"{request.resource}:{request.operation}")
        if not policy:
            # Default deny policy
            return AccessDecision(
                request_id=request.request_id,
                decision=False,
                trust_score=0.0,
                risk_score=1.0,
                reason="No policy defined for requested resource/operation"
            )
        
        # Evaluate device trust
        device = request.device_identity
        risk_score = device.calculate_risk_score()
        trust_score = self._calculate_trust_score(device)
        
        # Check policy compliance
        decision = True
        conditions = []
        denial_reasons = []
        
        # Check minimum trust level
        min_trust = TrustLevel(policy["min_trust_level"])
        trust_levels = {
            TrustLevel.UNKNOWN: 0,
            TrustLevel.UNTRUSTED: 1,
            TrustLevel.CONDITIONAL: 2,
            TrustLevel.TRUSTED: 3,
            TrustLevel.VERIFIED: 4
        }
        
        if trust_levels[device.trust_level] < trust_levels[min_trust]:
            decision = False
            denial_reasons.append(f"Trust level {device.trust_level.value} below required {min_trust.value}")
        
        # Check maximum risk score
        if risk_score > policy["max_risk_score"]:
            decision = False
            denial_reasons.append(f"Risk score {risk_score:.2f} exceeds maximum {policy['max_risk_score']}")
        
        # Check compliance requirements
        required_compliance = policy.get("required_compliance", [])
        for requirement in required_compliance:
            if not device.compliance_status.get(requirement, False):
                decision = False
                denial_reasons.append(f"Missing required compliance: {requirement}")
        
        # Add conditional access requirements
        if decision:
            conditions.extend(self._generate_access_conditions(device, policy))
        
        # Create access decision
        access_decision = AccessDecision(
            request_id=request.request_id,
            decision=decision,
            trust_score=trust_score,
            risk_score=risk_score,
            conditions=conditions,
            expiry=datetime.utcnow() + timedelta(seconds=policy.get("session_duration", 3600)),
            reason=" | ".join(denial_reasons) if denial_reasons else "Access granted",
            audit_info={
                "policy": f"{request.resource}:{request.operation}",
                "device_id": str(device.device_id),
                "evaluation_time": datetime.utcnow().isoformat()
            }
        )
        
        # Cache decision
        if decision:
            self.access_cache[cache_key] = access_decision
        
        logger.info("Access evaluation completed",
                   request_id=str(request.request_id),
                   decision=decision,
                   trust_score=trust_score,
                   risk_score=risk_score)
        
        return access_decision
    
    def _calculate_trust_score(self, device: DeviceIdentity) -> float:
        """Calculate numerical trust score (0.0 to 1.0)."""
        trust_scores = {
            TrustLevel.UNKNOWN: 0.0,
            TrustLevel.UNTRUSTED: 0.2,
            TrustLevel.CONDITIONAL: 0.5,
            TrustLevel.TRUSTED: 0.8,
            TrustLevel.VERIFIED: 1.0
        }
        
        base_score = trust_scores.get(device.trust_level, 0.0)
        
        # Bonus for compliance
        compliance_bonus = sum(device.compliance_status.values()) / len(device.compliance_status) * 0.1
        
        # Bonus for security features
        feature_bonus = min(len(device.security_features) * 0.02, 0.1)
        
        # Penalty for stale attestation
        attestation_penalty = 0.0
        if device.last_attestation:
            age_hours = (datetime.utcnow() - device.last_attestation).total_seconds() / 3600
            if age_hours > 24:
                attestation_penalty = min(age_hours / 168, 0.2)  # Max 0.2 penalty
        
        final_score = base_score + compliance_bonus + feature_bonus - attestation_penalty
        return max(0.0, min(1.0, final_score))
    
    def _generate_access_conditions(self, device: DeviceIdentity, policy: Dict[str, Any]) -> List[str]:
        """Generate conditional access requirements."""
        conditions = []
        
        # Always require re-attestation for high-privilege operations
        if policy.get("session_duration", 3600) < 1800:  # Less than 30 minutes
            conditions.append("continuous_attestation_required")
        
        # Require MFA for conditional trust
        if device.trust_level == TrustLevel.CONDITIONAL:
            conditions.append("multi_factor_authentication_required")
        
        # Require network isolation for risky devices
        if device.calculate_risk_score() > 0.5:
            conditions.append("network_isolation_required")
        
        # Require audit logging for all access
        conditions.append("comprehensive_audit_logging")
        
        return conditions


# Global security manager instance
_security_manager: Optional[ZeroTrustAccessControl] = None


def get_security_manager() -> ZeroTrustAccessControl:
    """Get global zero-trust security manager."""
    global _security_manager
    if _security_manager is None:
        _security_manager = ZeroTrustAccessControl()
    return _security_manager


def attest_device(device_info: Dict[str, Any]) -> DeviceIdentity:
    """Perform device attestation."""
    manager = get_security_manager()
    return manager.identity_manager.perform_device_attestation(device_info)


def evaluate_access(device_identity: DeviceIdentity, resource: str, operation: str, 
                   user_id: str = "system", context: Optional[Dict[str, Any]] = None) -> AccessDecision:
    """Evaluate access request using zero-trust principles."""
    request = AccessRequest(
        device_identity=device_identity,
        user_id=user_id,
        resource=resource,
        operation=operation,
        context=context or {}
    )
    
    manager = get_security_manager()
    return manager.evaluate_access_request(request)


@cached(ttl=60, key_prefix="security.device_risk")  # Cache for 1 minute
def get_device_risk_assessment(device_id: str) -> Dict[str, Any]:
    """Get cached device risk assessment."""
    manager = get_security_manager()
    device = manager.identity_manager.identity_cache.get(device_id)
    
    if not device:
        return {"error": "Device not found", "risk_score": 1.0}
    
    return {
        "device_id": device_id,
        "trust_level": device.trust_level.value,
        "risk_score": device.calculate_risk_score(),
        "compliance_status": device.compliance_status,
        "security_features": device.security_features,
        "last_attestation": device.last_attestation.isoformat() if device.last_attestation else None
    }
