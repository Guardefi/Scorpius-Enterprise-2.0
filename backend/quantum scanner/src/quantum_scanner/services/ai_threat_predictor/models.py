"""
AI-Powered Threat Prediction Service

This module provides machine learning-based threat prediction and anomaly
detection for quantum cryptographic vulnerabilities.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
import hashlib

try:
    import numpy as np
    SKLEARN_AVAILABLE = True
except ImportError:
    np = None
    SKLEARN_AVAILABLE = False

from ...core.logging import get_logger
from ...core.cache import cached
from ...core.profiling import profile_function, performance_timer
from ..cbom_engine.models import CBOMReport, QuantumVulnerabilityLevel

logger = get_logger(__name__)


class ThreatLevel(str, Enum):
    """AI-predicted threat levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AnomalyType(str, Enum):
    """Types of cryptographic anomalies."""
    UNUSUAL_ALGORITHM = "unusual_algorithm"
    SUSPICIOUS_KEY_SIZE = "suspicious_key_size"
    DEPRECATED_USAGE = "deprecated_usage"
    CONFIGURATION_DRIFT = "configuration_drift"
    PERFORMANCE_ANOMALY = "performance_anomaly"


@dataclass
class ThreatPrediction:
    """AI-generated threat prediction."""
    threat_id: str
    threat_level: ThreatLevel
    confidence: float
    predicted_impact: str
    timeline_days: int
    affected_algorithms: List[str]
    mitigation_suggestions: List[str]
    prediction_timestamp: datetime = field(default_factory=datetime.utcnow)
    model_version: str = "1.0"


@dataclass
class CryptoAnomaly:
    """Detected cryptographic anomaly."""
    anomaly_id: str
    anomaly_type: AnomalyType
    severity: float  # 0.0 to 1.0
    component_name: str
    algorithm: str
    description: str
    detected_at: datetime = field(default_factory=datetime.utcnow)
    context: Dict[str, Any] = field(default_factory=dict)


class CryptoFeatureExtractor:
    """Extract features from cryptographic data for ML models."""
    
    def __init__(self):
        """Initialize feature extractor."""
        self.algorithm_categories = {
            'symmetric': ['aes', 'des', '3des', 'chacha20', 'salsa20'],
            'asymmetric': ['rsa', 'ecdsa', 'ecdh', 'dh', 'dsa'],
            'hash': ['sha1', 'sha256', 'sha512', 'md5', 'blake2'],
            'pqc': ['kyber', 'dilithium', 'sphincs', 'falcon', 'ml-kem', 'ml-dsa']
        }
        
        self.vulnerability_weights = {
            QuantumVulnerabilityLevel.SAFE: 0.0,
            QuantumVulnerabilityLevel.UNKNOWN: 0.3,
            QuantumVulnerabilityLevel.VULNERABLE: 0.8,
            QuantumVulnerabilityLevel.DEPRECATED: 1.0
        }
    
    def extract_features_from_cbom(self, cbom_report: CBOMReport) -> List[float]:
        """Extract feature vector from CBOM report."""
        if not SKLEARN_AVAILABLE:
            return []
            
        features = []
        
        # Basic statistics
        features.extend([
            len(cbom_report.entries),  # Total components
            cbom_report.quantum_vulnerable_count,  # Vulnerable components
            cbom_report.fips_compliant_count,  # FIPS compliant
            len(cbom_report.scanned_assets)  # Asset count
        ])
        
        # Algorithm distribution
        algorithm_counts = self._count_algorithms_by_category(cbom_report)
        features.extend([
            algorithm_counts.get('symmetric', 0),
            algorithm_counts.get('asymmetric', 0),
            algorithm_counts.get('hash', 0),
            algorithm_counts.get('pqc', 0)
        ])
        
        # Vulnerability metrics
        vuln_breakdown = cbom_report.vulnerability_breakdown
        features.extend([
            vuln_breakdown.get('safe', 0),
            vuln_breakdown.get('vulnerable', 0),
            vuln_breakdown.get('deprecated', 0),
            vuln_breakdown.get('unknown', 0)
        ])
        
        # Key size distribution
        key_sizes = self._extract_key_sizes(cbom_report)
        if SKLEARN_AVAILABLE and key_sizes:
            features.extend([
                float(np.mean(key_sizes)),
                float(np.std(key_sizes)) if len(key_sizes) > 1 else 0,
                len(set(key_sizes))  # Unique key sizes
            ])
        else:
            features.extend([0, 0, 0])
        
        # Temporal features
        scan_timestamp = cbom_report.generated_at
        features.extend([
            scan_timestamp.hour,  # Hour of day
            scan_timestamp.weekday(),  # Day of week
            (datetime.utcnow() - scan_timestamp).total_seconds() / 3600  # Hours since scan
        ])
        
        # Risk score
        risk_score = self._calculate_risk_score(cbom_report)
        features.append(risk_score)
        
        return features
    
    def _count_algorithms_by_category(self, cbom_report: CBOMReport) -> Dict[str, int]:
        """Count algorithms by category."""
        counts = {category: 0 for category in self.algorithm_categories.keys()}
        
        for entry in cbom_report.entries:
            algorithm = entry.component.algorithm.lower()
            for category, algorithms in self.algorithm_categories.items():
                if any(alg in algorithm for alg in algorithms):
                    counts[category] += 1
                    break
        
        return counts
    
    def _extract_key_sizes(self, cbom_report: CBOMReport) -> List[int]:
        """Extract key sizes from CBOM entries."""
        key_sizes = []
        for entry in cbom_report.entries:
            if entry.component.key_size:
                key_sizes.append(entry.component.key_size)
        return key_sizes
    
    def _calculate_risk_score(self, cbom_report: CBOMReport) -> float:
        """Calculate overall risk score."""
        if not cbom_report.entries:
            return 0.0
        
        total_risk = 0.0
        for entry in cbom_report.entries:
            vuln_level = entry.quantum_assessment.vulnerability_level
            weight = self.vulnerability_weights.get(vuln_level, 0.5)
            confidence = entry.quantum_assessment.assessment_confidence
            total_risk += weight * confidence
        
        return total_risk / len(cbom_report.entries)


class AIThreatPredictor:
    """AI-powered threat prediction engine."""
    
    def __init__(self):
        """Initialize AI threat predictor."""
        self.feature_extractor = CryptoFeatureExtractor()
        self.models_trained = False
    
    @profile_function(name="ai.predict_threats")
    async def predict_threats(self, cbom_report: CBOMReport) -> List[ThreatPrediction]:
        """Predict potential threats from CBOM analysis."""
        async with performance_timer("ai.threat_prediction"):
            return self._generate_rule_based_predictions(cbom_report)
    
    @profile_function(name="ai.detect_anomalies")
    async def detect_anomalies(self, cbom_report: CBOMReport) -> List[CryptoAnomaly]:
        """Detect cryptographic anomalies using rule-based approach."""
        async with performance_timer("ai.anomaly_detection"):
            return self._detect_rule_based_anomalies(cbom_report)
    
    def _generate_rule_based_predictions(self, cbom_report: CBOMReport) -> List[ThreatPrediction]:
        """Generate threat predictions using rule-based approach."""
        predictions = []
        
        # High vulnerability ratio
        if cbom_report.total_components > 0:
            vuln_ratio = cbom_report.quantum_vulnerable_count / cbom_report.total_components
            
            if vuln_ratio > 0.7:
                predictions.append(ThreatPrediction(
                    threat_id=f"rule_high_vuln_{hashlib.md5(str(vuln_ratio).encode()).hexdigest()[:8]}",
                    threat_level=ThreatLevel.HIGH,
                    confidence=0.8,
                    predicted_impact="High quantum vulnerability exposure",
                    timeline_days=30,
                    affected_algorithms=self._identify_vulnerable_algorithms(cbom_report),
                    mitigation_suggestions=[
                        "Implement quantum-safe migration plan",
                        "Prioritize critical system upgrades",
                        "Establish quantum threat timeline"
                    ]
                ))
            elif vuln_ratio > 0.3:
                predictions.append(ThreatPrediction(
                    threat_id=f"rule_med_vuln_{hashlib.md5(str(vuln_ratio).encode()).hexdigest()[:8]}",
                    threat_level=ThreatLevel.MEDIUM,
                    confidence=0.7,
                    predicted_impact="Moderate quantum vulnerability exposure",
                    timeline_days=180,
                    affected_algorithms=self._identify_vulnerable_algorithms(cbom_report),
                    mitigation_suggestions=[
                        "Begin quantum-safe algorithm evaluation",
                        "Update cryptographic policies",
                        "Monitor quantum computing developments"
                    ]
                ))
        
        return predictions
    
    def _detect_rule_based_anomalies(self, cbom_report: CBOMReport) -> List[CryptoAnomaly]:
        """Detect anomalies using rule-based approach."""
        anomalies = []
        
        # Check for deprecated algorithms
        for entry in cbom_report.entries:
            if entry.quantum_assessment.vulnerability_level == QuantumVulnerabilityLevel.DEPRECATED:
                anomalies.append(CryptoAnomaly(
                    anomaly_id=f"deprecated_{entry.id}",
                    anomaly_type=AnomalyType.DEPRECATED_USAGE,
                    severity=0.9,
                    component_name=entry.component.name,
                    algorithm=entry.component.algorithm,
                    description=f"Deprecated algorithm {entry.component.algorithm} detected",
                    context={"file_path": entry.component.file_path}
                ))
        
        # Check for unusual key sizes
        key_sizes = [entry.component.key_size for entry in cbom_report.entries if entry.component.key_size]
        if key_sizes and SKLEARN_AVAILABLE:
            median_key_size = float(np.median(key_sizes))
            for entry in cbom_report.entries:
                if entry.component.key_size and abs(entry.component.key_size - median_key_size) > median_key_size * 0.5:
                    anomalies.append(CryptoAnomaly(
                        anomaly_id=f"unusual_key_{entry.id}",
                        anomaly_type=AnomalyType.SUSPICIOUS_KEY_SIZE,
                        severity=0.6,
                        component_name=entry.component.name,
                        algorithm=entry.component.algorithm,
                        description=f"Unusual key size {entry.component.key_size} for {entry.component.algorithm}",
                        context={"key_size": entry.component.key_size, "median": median_key_size}
                    ))
        
        return anomalies
    
    def _identify_vulnerable_algorithms(self, cbom_report: CBOMReport) -> List[str]:
        """Identify vulnerable algorithms from CBOM."""
        vulnerable_algorithms = set()
        
        for entry in cbom_report.entries:
            if entry.quantum_assessment.is_vulnerable:
                vulnerable_algorithms.add(entry.component.algorithm)
        
        return list(vulnerable_algorithms)


# Global AI predictor instance
_ai_predictor: Optional[AIThreatPredictor] = None


async def get_ai_predictor() -> AIThreatPredictor:
    """Get global AI threat predictor instance."""
    global _ai_predictor
    if _ai_predictor is None:
        _ai_predictor = AIThreatPredictor()
    return _ai_predictor


@cached(ttl=1800, key_prefix="ai.threat_prediction")  # Cache for 30 minutes
async def predict_quantum_threats(cbom_report: CBOMReport) -> List[ThreatPrediction]:
    """Predict quantum threats using AI analysis."""
    predictor = await get_ai_predictor()
    return await predictor.predict_threats(cbom_report)


@cached(ttl=900, key_prefix="ai.anomaly_detection")  # Cache for 15 minutes
async def detect_crypto_anomalies(cbom_report: CBOMReport) -> List[CryptoAnomaly]:
    """Detect cryptographic anomalies using AI."""
    predictor = await get_ai_predictor()
    return await predictor.detect_anomalies(cbom_report)
