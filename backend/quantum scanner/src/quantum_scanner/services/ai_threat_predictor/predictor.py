"""
AI-Powered Quantum Threat Predictor Implementation.

This module provides advanced machine learning capabilities for predicting
quantum threats, detecting anomalies, and providing security recommendations.
"""

import asyncio
import pickle
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

try:
    from sklearn.ensemble import IsolationForest, RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False

from ...core.logging import get_logger
from ...core.cache import cached
from ...core.profiling import profile_function, performance_timer
from ...core.exceptions import PredictionError
from ..cbom_engine.models import CBOMReport
from .models import (
    ThreatPrediction,
    CryptoAnomaly,
    ThreatLevel,
    AnomalyType,
    CryptoFeatureExtractor
)

logger = get_logger(__name__)


class QuantumThreatPredictor:
    """Advanced AI-powered quantum threat prediction system."""
    
    def __init__(self, model_path: Optional[str] = None):
        """Initialize threat predictor."""
        self.feature_extractor = CryptoFeatureExtractor()
        self.models_path = Path(model_path) if model_path else Path("models")
        self.models_path.mkdir(exist_ok=True)
        
        # ML Models
        self.threat_classifier = None
        self.anomaly_detector = None
        self.scaler = None
        
        # Model metadata
        self.model_version = "2.1"
        self.last_training_date = None
        self.prediction_cache = {}
        
        # Threat patterns database
        self.threat_patterns = self._initialize_threat_patterns()
        
        if SKLEARN_AVAILABLE:
            self._load_or_initialize_models()
        else:
            logger.warning("scikit-learn not available, using rule-based predictions")
    
    def _initialize_threat_patterns(self) -> List[Dict[str, Any]]:
        """Initialize known threat patterns."""
        return [
            {
                "name": "quantum_vulnerability_cluster",
                "indicators": ["high_rsa_usage", "weak_key_sizes", "deprecated_algorithms"],
                "threat_level": ThreatLevel.HIGH,
                "timeline_days": 1095,  # 3 years
                "description": "High concentration of quantum-vulnerable algorithms"
            },
            {
                "name": "algorithm_migration_drift",
                "indicators": ["mixed_pqc_classical", "inconsistent_key_sizes"],
                "threat_level": ThreatLevel.MEDIUM,
                "timeline_days": 730,  # 2 years
                "description": "Inconsistent post-quantum migration patterns"
            },
            {
                "name": "deprecated_crypto_usage",
                "indicators": ["md5_usage", "sha1_usage", "des_usage"],
                "threat_level": ThreatLevel.CRITICAL,
                "timeline_days": 180,  # 6 months
                "description": "Usage of cryptographically broken algorithms"
            },
            {
                "name": "weak_random_generation",
                "indicators": ["weak_entropy", "predictable_patterns"],
                "threat_level": ThreatLevel.HIGH,
                "timeline_days": 365,  # 1 year
                "description": "Weak random number generation patterns"
            }
        ]
    
    def _load_or_initialize_models(self):
        """Load existing models or initialize new ones."""
        try:
            # Load threat classifier
            threat_model_path = self.models_path / "threat_classifier.pkl"
            if threat_model_path.exists():
                with open(threat_model_path, 'rb') as f:
                    self.threat_classifier = pickle.load(f)
                logger.info("Loaded threat classification model")
            else:
                self.threat_classifier = RandomForestClassifier(
                    n_estimators=100,
                    random_state=42,
                    class_weight='balanced'
                )
                
            # Load anomaly detector
            anomaly_model_path = self.models_path / "anomaly_detector.pkl"
            if anomaly_model_path.exists():
                with open(anomaly_model_path, 'rb') as f:
                    self.anomaly_detector = pickle.load(f)
                logger.info("Loaded anomaly detection model")
            else:
                self.anomaly_detector = IsolationForest(
                    contamination=0.1,
                    random_state=42
                )
            
            # Load scaler
            scaler_path = self.models_path / "feature_scaler.pkl"
            if scaler_path.exists():
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info("Loaded feature scaler")
            else:
                self.scaler = StandardScaler()
                
        except Exception as e:
            logger.error(f"Failed to load ML models: {e}")
            self._initialize_default_models()
    
    def _initialize_default_models(self):
        """Initialize default ML models."""
        if SKLEARN_AVAILABLE:
            self.threat_classifier = RandomForestClassifier(
                n_estimators=100,
                random_state=42,
                class_weight='balanced'
            )
            self.anomaly_detector = IsolationForest(
                contamination=0.1,
                random_state=42
            )
            self.scaler = StandardScaler()
    
    @profile_function(name="ai_predictor.predict_threats", track_memory=True)
    async def predict_threats(self, cbom_report: CBOMReport) -> List[ThreatPrediction]:
        """Predict quantum threats from CBOM report."""
        async with performance_timer("ai_predictor.threat_prediction"):
            try:
                # Extract features
                features = self.feature_extractor.extract_features_from_cbom(cbom_report)
                
                if not features:
                    return await self._rule_based_prediction(cbom_report)
                
                # ML-based prediction if models available
                if SKLEARN_AVAILABLE and self.threat_classifier:
                    return await self._ml_prediction(features, cbom_report)
                else:
                    return await self._rule_based_prediction(cbom_report)
                    
            except Exception as e:
                logger.error(f"Threat prediction failed: {e}")
                raise PredictionError(f"Failed to predict threats: {str(e)}")
    
    async def _ml_prediction(self, features: List[float], cbom_report: CBOMReport) -> List[ThreatPrediction]:
        """Generate ML-based threat predictions."""
        predictions = []
        
        try:
            # Convert features to numpy array
            feature_array = np.array(features).reshape(1, -1)
            
            # Scale features
            if self.scaler:
                try:
                    scaled_features = self.scaler.transform(feature_array)
                except Exception:
                    # If scaler fails, use raw features
                    scaled_features = feature_array
            else:
                scaled_features = feature_array
            
            # Generate threat level prediction
            if hasattr(self.threat_classifier, 'predict_proba'):
                try:
                    # Use dummy training data if model isn't trained
                    if not hasattr(self.threat_classifier, 'classes_'):
                        await self._quick_train_models([features])
                    
                    threat_proba = self.threat_classifier.predict_proba(scaled_features)[0]
                    threat_classes = self.threat_classifier.classes_
                    
                    # Find highest probability threat
                    max_idx = np.argmax(threat_proba)
                    predicted_threat = threat_classes[max_idx]
                    confidence = threat_proba[max_idx]
                    
                except Exception:
                    # Fallback to simple rule-based classification
                    predicted_threat, confidence = self._classify_threat_simple(features)
            else:
                predicted_threat, confidence = self._classify_threat_simple(features)
            
            # Create prediction
            prediction = ThreatPrediction(
                threat_id=f"ai_pred_{hash(str(features))}"[:16],
                threat_level=ThreatLevel(predicted_threat.lower()) if isinstance(predicted_threat, str) else ThreatLevel.MEDIUM,
                confidence=float(confidence),
                predicted_impact=self._predict_impact(features, cbom_report),
                timeline_days=self._predict_timeline(features),
                affected_algorithms=self._identify_affected_algorithms(cbom_report),
                mitigation_suggestions=self._generate_mitigation_suggestions(features, cbom_report),
                model_version=self.model_version
            )
            
            predictions.append(prediction)
            
        except Exception as e:
            logger.warning(f"ML prediction failed, falling back to rules: {e}")
            return await self._rule_based_prediction(cbom_report)
        
        return predictions
    
    def _classify_threat_simple(self, features: List[float]) -> Tuple[str, float]:
        """Simple rule-based threat classification."""
        if len(features) < 4:
            return "medium", 0.5
        
        # Extract key metrics
        vulnerable_count = features[1] if len(features) > 1 else 0
        total_count = features[0] if len(features) > 0 else 1
        
        vulnerability_ratio = vulnerable_count / max(total_count, 1)
        
        if vulnerability_ratio > 0.7:
            return "critical", 0.9
        elif vulnerability_ratio > 0.4:
            return "high", 0.8
        elif vulnerability_ratio > 0.1:
            return "medium", 0.6
        else:
            return "low", 0.4
    
    async def _rule_based_prediction(self, cbom_report: CBOMReport) -> List[ThreatPrediction]:
        """Generate rule-based threat predictions."""
        predictions = []
        
        # Calculate vulnerability ratio
        total_components = cbom_report.total_components
        vulnerable_components = cbom_report.quantum_vulnerable_count
        vulnerability_ratio = vulnerable_components / max(total_components, 1)
        
        # Determine threat level
        if vulnerability_ratio > 0.7:
            threat_level = ThreatLevel.CRITICAL
            confidence = 0.95
            timeline_days = 90
        elif vulnerability_ratio > 0.4:
            threat_level = ThreatLevel.HIGH
            confidence = 0.85
            timeline_days = 365
        elif vulnerability_ratio > 0.1:
            threat_level = ThreatLevel.MEDIUM
            confidence = 0.75
            timeline_days = 730
        else:
            threat_level = ThreatLevel.LOW
            confidence = 0.65
            timeline_days = 1095
        
        # Generate prediction
        prediction = ThreatPrediction(
            threat_id=f"rule_pred_{cbom_report.id.hex[:8]}",
            threat_level=threat_level,
            confidence=confidence,
            predicted_impact=self._predict_impact_simple(vulnerability_ratio),
            timeline_days=timeline_days,
            affected_algorithms=self._identify_affected_algorithms(cbom_report),
            mitigation_suggestions=self._generate_simple_mitigations(vulnerability_ratio),
            model_version="rule_based_1.0"
        )
        
        predictions.append(prediction)
        return predictions
    
    @profile_function(name="ai_predictor.detect_anomalies")
    async def detect_anomalies(self, cbom_report: CBOMReport) -> List[CryptoAnomaly]:
        """Detect cryptographic anomalies in CBOM report."""
        anomalies = []
        
        try:
            # Rule-based anomaly detection
            anomalies.extend(await self._detect_algorithm_anomalies(cbom_report))
            anomalies.extend(await self._detect_configuration_anomalies(cbom_report))
            
            # ML-based anomaly detection if available
            if SKLEARN_AVAILABLE and self.anomaly_detector:
                ml_anomalies = await self._detect_ml_anomalies(cbom_report)
                anomalies.extend(ml_anomalies)
                
        except Exception as e:
            logger.error(f"Anomaly detection failed: {e}")
        
        return anomalies
    
    async def _detect_algorithm_anomalies(self, cbom_report: CBOMReport) -> List[CryptoAnomaly]:
        """Detect unusual algorithm usage patterns."""
        anomalies = []
        
        # Count algorithm usage
        algorithm_counts = {}
        for entry in cbom_report.entries:
            algo = entry.component.algorithm.lower()
            algorithm_counts[algo] = algorithm_counts.get(algo, 0) + 1
        
        total_algorithms = sum(algorithm_counts.values())
        
        # Detect deprecated algorithms
        deprecated_algos = ['md5', 'sha1', 'des', '3des', 'rc4']
        for algo in deprecated_algos:
            if algo in algorithm_counts:
                anomaly = CryptoAnomaly(
                    anomaly_id=f"deprecated_{algo}_{hash(str(cbom_report.id))}"[:16],
                    anomaly_type=AnomalyType.DEPRECATED_USAGE,
                    severity=0.9,
                    component_name=f"Components using {algo}",
                    algorithm=algo,
                    description=f"Deprecated algorithm {algo} detected in {algorithm_counts[algo]} components",
                    context={"count": algorithm_counts[algo], "total": total_algorithms}
                )
                anomalies.append(anomaly)
        
        # Detect unusual algorithm concentrations
        for algo, count in algorithm_counts.items():
            concentration = count / total_algorithms
            if concentration > 0.8:  # More than 80% of one algorithm
                anomaly = CryptoAnomaly(
                    anomaly_id=f"concentration_{algo}_{hash(str(cbom_report.id))}"[:16],
                    anomaly_type=AnomalyType.UNUSUAL_ALGORITHM,
                    severity=min(concentration, 1.0),
                    component_name=f"High {algo} concentration",
                    algorithm=algo,
                    description=f"Unusual concentration of {algo}: {concentration:.1%} of all algorithms",
                    context={"concentration": concentration, "count": count}
                )
                anomalies.append(anomaly)
        
        return anomalies
    
    async def _detect_configuration_anomalies(self, cbom_report: CBOMReport) -> List[CryptoAnomaly]:
        """Detect configuration anomalies."""
        anomalies = []
        
        # Detect inconsistent key sizes
        key_sizes_by_algo = {}
        for entry in cbom_report.entries:
            algo = entry.component.algorithm.lower()
            key_size = entry.component.key_size
            if key_size:
                if algo not in key_sizes_by_algo:
                    key_sizes_by_algo[algo] = []
                key_sizes_by_algo[algo].append(key_size)
        
        # Check for suspicious key size variations
        for algo, sizes in key_sizes_by_algo.items():
            unique_sizes = set(sizes)
            if len(unique_sizes) > 3:  # Too many different key sizes
                anomaly = CryptoAnomaly(
                    anomaly_id=f"keysize_var_{algo}_{hash(str(cbom_report.id))}"[:16],
                    anomaly_type=AnomalyType.SUSPICIOUS_KEY_SIZE,
                    severity=0.6,
                    component_name=f"{algo} key size variation",
                    algorithm=algo,
                    description=f"Suspicious key size variation in {algo}: {sorted(unique_sizes)}",
                    context={"sizes": sorted(unique_sizes), "count": len(sizes)}
                )
                anomalies.append(anomaly)
        
        return anomalies
    
    async def _detect_ml_anomalies(self, cbom_report: CBOMReport) -> List[CryptoAnomaly]:
        """Detect anomalies using ML models."""
        anomalies = []
        
        try:
            features = self.feature_extractor.extract_features_from_cbom(cbom_report)
            if not features:
                return anomalies
            
            feature_array = np.array(features).reshape(1, -1)
            
            # Use anomaly detector
            if hasattr(self.anomaly_detector, 'decision_function'):
                anomaly_score = self.anomaly_detector.decision_function(feature_array)[0]
                is_anomaly = self.anomaly_detector.predict(feature_array)[0] == -1
                
                if is_anomaly:
                    anomaly = CryptoAnomaly(
                        anomaly_id=f"ml_anomaly_{hash(str(features))}"[:16],
                        anomaly_type=AnomalyType.PERFORMANCE_ANOMALY,
                        severity=min(abs(anomaly_score), 1.0),
                        component_name="System-wide crypto configuration",
                        algorithm="multiple",
                        description=f"ML model detected anomalous cryptographic patterns (score: {anomaly_score:.3f})",
                        context={"anomaly_score": anomaly_score, "feature_count": len(features)}
                    )
                    anomalies.append(anomaly)
                    
        except Exception as e:
            logger.warning(f"ML anomaly detection failed: {e}")
        
        return anomalies
    
    async def _quick_train_models(self, feature_samples: List[List[float]]):
        """Quick training with minimal data for demonstration."""
        if not SKLEARN_AVAILABLE or not feature_samples:
            return
        
        try:
            # Generate synthetic training data for demo
            X = np.array(feature_samples * 10)  # Repeat samples
            y = ['medium'] * len(X)  # Default label
            
            # Add some variation
            for i in range(len(X)):
                if i % 3 == 0:
                    y[i] = 'high'
                elif i % 5 == 0:
                    y[i] = 'low'
            
            # Train classifier
            self.threat_classifier.fit(X, y)
            
            # Fit scaler
            self.scaler.fit(X)
            
            # Train anomaly detector
            self.anomaly_detector.fit(X)
            
            logger.info("Quick trained ML models with synthetic data")
            
        except Exception as e:
            logger.warning(f"Quick training failed: {e}")
    
    def _predict_impact(self, features: List[float], cbom_report: CBOMReport) -> str:
        """Predict the impact of identified threats."""
        if len(features) < 2:
            return "Moderate system compromise risk"
        
        vulnerable_ratio = features[1] / max(features[0], 1)
        asset_count = len(cbom_report.scanned_assets)
        
        if vulnerable_ratio > 0.7 and asset_count > 10:
            return "Critical: Widespread quantum vulnerability across enterprise systems"
        elif vulnerable_ratio > 0.4:
            return "High: Significant quantum attack surface requiring immediate attention"
        elif vulnerable_ratio > 0.1:
            return "Medium: Moderate quantum risks with migration planning needed"
        else:
            return "Low: Minimal quantum risks with standard security practices sufficient"
    
    def _predict_impact_simple(self, vulnerability_ratio: float) -> str:
        """Simple impact prediction."""
        if vulnerability_ratio > 0.7:
            return "Critical: Immediate quantum threat mitigation required"
        elif vulnerability_ratio > 0.4:
            return "High: Quantum migration planning urgent"
        elif vulnerability_ratio > 0.1:
            return "Medium: Quantum readiness assessment needed"
        else:
            return "Low: Good quantum security posture"
    
    def _predict_timeline(self, features: List[float]) -> int:
        """Predict timeline for threat materialization."""
        if len(features) < 2:
            return 730  # 2 years default
        
        vulnerable_ratio = features[1] / max(features[0], 1)
        
        if vulnerable_ratio > 0.8:
            return 180  # 6 months
        elif vulnerable_ratio > 0.5:
            return 365  # 1 year
        elif vulnerable_ratio > 0.2:
            return 730  # 2 years
        else:
            return 1095  # 3 years
    
    def _identify_affected_algorithms(self, cbom_report: CBOMReport) -> List[str]:
        """Identify algorithms most at risk."""
        vulnerable_algorithms = []
        
        for entry in cbom_report.entries:
            if entry.quantum_assessment.is_vulnerable:
                algo = entry.component.algorithm
                if algo not in vulnerable_algorithms:
                    vulnerable_algorithms.append(algo)
        
        return vulnerable_algorithms[:10]  # Top 10 most critical
    
    def _generate_mitigation_suggestions(self, features: List[float], cbom_report: CBOMReport) -> List[str]:
        """Generate AI-powered mitigation suggestions."""
        suggestions = []
        
        if len(features) < 2:
            return ["Perform comprehensive cryptographic inventory", "Assess quantum readiness"]
        
        vulnerable_ratio = features[1] / max(features[0], 1)
        
        if vulnerable_ratio > 0.5:
            suggestions.extend([
                "Immediate quantum-safe algorithm migration required",
                "Implement hybrid cryptographic solutions as transition measure",
                "Prioritize critical system upgrades within 6 months"
            ])
        elif vulnerable_ratio > 0.2:
            suggestions.extend([
                "Develop quantum migration roadmap within 3 months",
                "Begin pilot deployments of post-quantum cryptography",
                "Establish cryptographic agility framework"
            ])
        else:
            suggestions.extend([
                "Continue monitoring quantum computing developments",
                "Plan for future quantum-safe upgrades",
                "Maintain current security practices"
            ])
        
        # Add specific algorithm suggestions
        affected_algos = self._identify_affected_algorithms(cbom_report)
        for algo in affected_algos[:3]:
            if 'rsa' in algo.lower():
                suggestions.append(f"Replace {algo} with ML-KEM or Kyber for key exchange")
            elif 'ecdsa' in algo.lower():
                suggestions.append(f"Replace {algo} with ML-DSA or Dilithium for signatures")
        
        return suggestions[:8]  # Top 8 suggestions
    
    def _generate_simple_mitigations(self, vulnerability_ratio: float) -> List[str]:
        """Generate simple rule-based mitigations."""
        if vulnerability_ratio > 0.7:
            return [
                "URGENT: Begin immediate quantum-safe migration",
                "Implement post-quantum cryptography for all new systems",
                "Conduct emergency security assessment"
            ]
        elif vulnerability_ratio > 0.4:
            return [
                "Develop comprehensive quantum migration strategy", 
                "Start hybrid cryptographic implementations",
                "Upgrade most critical systems first"
            ]
        elif vulnerability_ratio > 0.1:
            return [
                "Plan quantum-safe migration timeline",
                "Evaluate post-quantum cryptographic options",
                "Monitor quantum computing developments"
            ]
        else:
            return [
                "Maintain current quantum readiness monitoring",
                "Continue following quantum security best practices"
            ]
    
    async def save_models(self):
        """Save trained ML models to disk."""
        if not SKLEARN_AVAILABLE:
            return
        
        try:
            # Save threat classifier
            if self.threat_classifier:
                with open(self.models_path / "threat_classifier.pkl", 'wb') as f:
                    pickle.dump(self.threat_classifier, f)
            
            # Save anomaly detector
            if self.anomaly_detector:
                with open(self.models_path / "anomaly_detector.pkl", 'wb') as f:
                    pickle.dump(self.anomaly_detector, f)
            
            # Save scaler
            if self.scaler:
                with open(self.models_path / "feature_scaler.pkl", 'wb') as f:
                    pickle.dump(self.scaler, f)
            
            logger.info("ML models saved successfully")
            
        except Exception as e:
            logger.error(f"Failed to save ML models: {e}")
    
    async def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models."""
        return {
            "model_version": self.model_version,
            "sklearn_available": SKLEARN_AVAILABLE,
            "threat_classifier_trained": (
                hasattr(self.threat_classifier, 'classes_') 
                if self.threat_classifier else False
            ),
            "anomaly_detector_trained": (
                hasattr(self.anomaly_detector, 'offset_') 
                if self.anomaly_detector else False
            ),
            "feature_extractor_ready": True,
            "threat_patterns_count": len(self.threat_patterns),
            "last_training_date": self.last_training_date
        }
