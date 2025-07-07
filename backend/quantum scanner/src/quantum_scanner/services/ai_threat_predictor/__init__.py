"""
AI-Powered Threat Prediction Service

This module provides machine learning-based threat prediction and anomaly
detection for quantum cryptographic vulnerabilities.
"""

import asyncio
import json
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
import pickle
import hashlib

try:
    from sklearn.ensemble import IsolationForest, RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, accuracy_score
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

from ...core.logging import get_logger
from ...core.cache import cached, get_cache
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


@dataclass
class AIThreatModel:
    """AI model for threat prediction."""
    model_type: str
    model_data: bytes
    feature_names: List[str]
    training_timestamp: datetime
    accuracy_score: float
    version: str


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
    
    def extract_features_from_cbom(self, cbom_report: CBOMReport) -> np.ndarray:
        """Extract feature vector from CBOM report."""
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
        features.extend([
            np.mean(key_sizes) if key_sizes else 0,
            np.std(key_sizes) if len(key_sizes) > 1 else 0,
            len(set(key_sizes)) if key_sizes else 0  # Unique key sizes
        ])
        
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
        
        return np.array(features)
    
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
        self.anomaly_detector: Optional[Any] = None
        self.threat_classifier: Optional[Any] = None
        self.scaler: Optional[Any] = None
        
        self.model_cache_ttl = 3600  # 1 hour
        self.models_trained = False
        
        # Historical data for training
        self.training_data: List[Tuple[np.ndarray, str]] = []
        self.anomaly_history: List[np.ndarray] = []
    
    async def initialize_models(self):
        """Initialize and train AI models."""
        if not SKLEARN_AVAILABLE:
            logger.warning("scikit-learn not available, AI features disabled")
            return
        
        try:
            # Initialize models
            self.anomaly_detector = IsolationForest(
                contamination=0.1,
                random_state=42,
                n_estimators=100
            )
            
            self.threat_classifier = RandomForestClassifier(
                n_estimators=100,
                random_state=42,
                max_depth=10
            )
            
            self.scaler = StandardScaler()
            
            # Generate synthetic training data if no real data available
            if not self.training_data:
                await self._generate_synthetic_training_data()
            
            # Train models
            await self._train_models()
            
            logger.info("AI threat prediction models initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI models: {e}")
    
    @profile_function(name="ai.predict_threats")
    async def predict_threats(self, cbom_report: CBOMReport) -> List[ThreatPrediction]:
        """Predict potential threats from CBOM analysis."""
        if not self.models_trained:
            await self.initialize_models()
        
        if not SKLEARN_AVAILABLE or not self.models_trained:
            return self._generate_rule_based_predictions(cbom_report)
        
        try:
            async with performance_timer("ai.feature_extraction"):
                features = self.feature_extractor.extract_features_from_cbom(cbom_report)
                features_scaled = self.scaler.transform([features])
            
            async with performance_timer("ai.threat_prediction"):
                # Predict threat level
                threat_probs = self.threat_classifier.predict_proba(features_scaled)[0]
                threat_classes = self.threat_classifier.classes_
                
                # Get top predictions
                predictions = []
                top_indices = np.argsort(threat_probs)[::-1][:3]  # Top 3
                
                for i, idx in enumerate(top_indices):
                    if threat_probs[idx] > 0.1:  # Minimum confidence threshold
                        prediction = ThreatPrediction(
                            threat_id=f"ai_threat_{i}_{hashlib.md5(str(features).encode()).hexdigest()[:8]}",
                            threat_level=ThreatLevel(threat_classes[idx]),
                            confidence=float(threat_probs[idx]),
                            predicted_impact=self._generate_impact_description(threat_classes[idx], cbom_report),
                            timeline_days=self._estimate_timeline(threat_classes[idx]),
                            affected_algorithms=self._identify_vulnerable_algorithms(cbom_report),
                            mitigation_suggestions=self._generate_mitigation_suggestions(threat_classes[idx], cbom_report)
                        )
                        predictions.append(prediction)
                
                return predictions
                
        except Exception as e:
            logger.error(f"AI threat prediction failed: {e}")
            return self._generate_rule_based_predictions(cbom_report)
    
    @profile_function(name="ai.detect_anomalies")
    async def detect_anomalies(self, cbom_report: CBOMReport) -> List[CryptoAnomaly]:
        """Detect cryptographic anomalies using AI."""
        if not self.models_trained:
            await self.initialize_models()
        
        anomalies = []
        
        if SKLEARN_AVAILABLE and self.anomaly_detector:
            try:
                features = self.feature_extractor.extract_features_from_cbom(cbom_report)
                features_scaled = self.scaler.transform([features])
                
                # Detect anomalies
                anomaly_score = self.anomaly_detector.decision_function(features_scaled)[0]
                is_anomaly = self.anomaly_detector.predict(features_scaled)[0] == -1
                
                if is_anomaly:
                    anomaly = CryptoAnomaly(
                        anomaly_id=f"ai_anomaly_{hashlib.md5(str(features).encode()).hexdigest()[:8]}",
                        anomaly_type=AnomalyType.CONFIGURATION_DRIFT,
                        severity=min(abs(anomaly_score), 1.0),
                        component_name="CBOM_OVERALL",
                        algorithm="MULTIPLE",
                        description=f"AI detected configuration anomaly (score: {anomaly_score:.3f})",
                        context={"anomaly_score": anomaly_score, "feature_vector": features.tolist()}
                    )
                    anomalies.append(anomaly)
                    
            except Exception as e:
                logger.error(f"AI anomaly detection failed: {e}")
        
        # Rule-based anomaly detection
        rule_based_anomalies = self._detect_rule_based_anomalies(cbom_report)
        anomalies.extend(rule_based_anomalies)
        
        return anomalies
    
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
        if key_sizes:
            median_key_size = np.median(key_sizes)
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
    
    async def _generate_synthetic_training_data(self):
        """Generate synthetic training data for model initialization."""
        # This would typically use real historical data
        # For now, generate synthetic examples
        
        threat_levels = list(ThreatLevel)
        
        for _ in range(1000):  # Generate 1000 synthetic samples
            # Generate random feature vector
            features = np.random.rand(19)  # Match feature count
            
            # Assign threat level based on some features
            if features[1] > 0.7:  # High vulnerable component ratio
                threat_level = ThreatLevel.HIGH
            elif features[1] > 0.3:
                threat_level = ThreatLevel.MEDIUM
            else:
                threat_level = ThreatLevel.LOW
            
            self.training_data.append((features, threat_level.value))
            self.anomaly_history.append(features)
    
    async def _train_models(self):
        """Train the AI models."""
        if not self.training_data:
            return
        
        try:
            # Prepare training data
            X = np.array([data[0] for data in self.training_data])
            y = np.array([data[1] for data in self.training_data])
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            self.scaler.fit(X_train)
            X_train_scaled = self.scaler.transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train threat classifier
            self.threat_classifier.fit(X_train_scaled, y_train)
            
            # Evaluate classifier
            y_pred = self.threat_classifier.predict(X_test_scaled)
            accuracy = accuracy_score(y_test, y_pred)
            
            logger.info(f"Threat classifier trained with accuracy: {accuracy:.3f}")
            
            # Train anomaly detector
            normal_data = X_train_scaled[y_train != ThreatLevel.HIGH.value]
            self.anomaly_detector.fit(normal_data)
            
            self.models_trained = True
            
        except Exception as e:
            logger.error(f"Model training failed: {e}")
    
    def _generate_impact_description(self, threat_level: str, cbom_report: CBOMReport) -> str:
        """Generate impact description for threat level."""
        descriptions = {
            ThreatLevel.CRITICAL.value: "Immediate quantum threat with potential for complete cryptographic failure",
            ThreatLevel.HIGH.value: "High probability of quantum attacks affecting critical systems within months",
            ThreatLevel.MEDIUM.value: "Moderate quantum threat requiring proactive migration planning",
            ThreatLevel.LOW.value: "Low immediate threat but quantum-safe migration recommended"
        }
        return descriptions.get(threat_level, "Unknown threat impact")
    
    def _estimate_timeline(self, threat_level: str) -> int:
        """Estimate timeline in days for threat materialization."""
        timelines = {
            ThreatLevel.CRITICAL.value: 30,
            ThreatLevel.HIGH.value: 90,
            ThreatLevel.MEDIUM.value: 365,
            ThreatLevel.LOW.value: 1095  # 3 years
        }
        return timelines.get(threat_level, 365)
    
    def _identify_vulnerable_algorithms(self, cbom_report: CBOMReport) -> List[str]:
        """Identify vulnerable algorithms from CBOM."""
        vulnerable_algorithms = set()
        
        for entry in cbom_report.entries:
            if entry.quantum_assessment.is_vulnerable:
                vulnerable_algorithms.add(entry.component.algorithm)
        
        return list(vulnerable_algorithms)
    
    def _generate_mitigation_suggestions(self, threat_level: str, cbom_report: CBOMReport) -> List[str]:
        """Generate mitigation suggestions based on threat level."""
        base_suggestions = [
            "Conduct quantum readiness assessment",
            "Develop quantum-safe migration roadmap",
            "Monitor quantum computing developments"
        ]
        
        if threat_level in [ThreatLevel.CRITICAL.value, ThreatLevel.HIGH.value]:
            base_suggestions.extend([
                "Implement emergency quantum-safe algorithms",
                "Establish quantum incident response plan",
                "Prioritize critical system protection"
            ])
        
        if threat_level == ThreatLevel.CRITICAL.value:
            base_suggestions.extend([
                "Deploy quantum-safe solutions immediately",
                "Activate crisis management protocols",
                "Consider temporary system isolation"
            ])
        
        return base_suggestions


# Global AI predictor instance
_ai_predictor: Optional[AIThreatPredictor] = None


async def get_ai_predictor() -> AIThreatPredictor:
    """Get global AI threat predictor instance."""
    global _ai_predictor
    if _ai_predictor is None:
        _ai_predictor = AIThreatPredictor()
        await _ai_predictor.initialize_models()
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
