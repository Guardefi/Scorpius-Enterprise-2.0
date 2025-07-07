"""
Tests for AI Threat Predictor service.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from datetime import datetime, timedelta

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '../src'))

from quantum_scanner.app import create_app
from quantum_scanner.services.ai_threat_predictor.models import (
    ThreatPrediction, CryptoAnomaly, ThreatLevel, AnomalyType
)


@pytest.fixture
def app():
    """Create test app."""
    return create_app()


@pytest.fixture
def client(app):
    """Create test client."""
    return TestClient(app)


@pytest.fixture
def sample_cbom_report():
    """Create a simple CBOM report for testing."""
    return {
        "id": "test-report-123",
        "timestamp": datetime.now().isoformat(),
        "scan_type": "comprehensive",
        "target": "test-application",
        "entries": [
            {
                "id": "entry-1",
                "component": {
                    "name": "RSA Key Exchange", 
                    "algorithm": "RSA",
                    "key_size": 2048
                },
                "quantum_vulnerable": True
            },
            {
                "id": "entry-2",
                "component": {
                    "name": "AES Encryption",
                    "algorithm": "AES", 
                    "key_size": 256
                },
                "quantum_vulnerable": False
            }
        ],
        "metadata": {
            "scan_duration": 1.5,
            "tools_used": ["static_analysis"]
        }
    }


@pytest.fixture
def sample_threat_prediction():
    """Create a sample threat prediction."""
    return ThreatPrediction(
        id="threat-1",
        target_component="RSA Key Exchange",
        threat_type="quantum_cryptanalysis",
        threat_level=ThreatLevel.HIGH,
        confidence_score=0.85,
        predicted_timeline=datetime.now() + timedelta(days=365*5),  # 5 years
        attack_vectors=[
            "Shor's algorithm implementation",
            "Fault injection attacks"
        ],
        mitigation_suggestions=[
            "Migrate to ML-KEM-768 for key exchange",
            "Implement hybrid cryptography as interim solution"
        ],
        threat_indicators={
            "quantum_vulnerability": True,
            "algorithm_age": 30,
            "key_size": 2048
        },
        created_at=datetime.now()
    )


class TestAIThreatPredictorAPI:
    """Test AI Threat Predictor API endpoints."""

    @pytest.mark.asyncio
    async def test_predict_threats_endpoint(self, client, sample_cbom_report):
        """Test threat prediction endpoint."""
        with patch('src.quantum_scanner.services.ai_threat_predictor.api.predictor') as mock_predictor:
            # Mock the predictor response
            mock_prediction = ThreatPrediction(
                id="threat-1",
                target_component="RSA Key Exchange",
                threat_type="quantum_cryptanalysis", 
                threat_level=ThreatLevel.HIGH,
                confidence_score=0.85,
                predicted_timeline=datetime.now() + timedelta(days=1825),
                attack_vectors=["Shor's algorithm"],
                mitigation_suggestions=["Migrate to ML-KEM-768"],
                threat_indicators={"quantum_vulnerable": True},
                created_at=datetime.now()
            )
            
            mock_predictor.predict_threats.return_value = [mock_prediction]
            
            # Use the CBOM report dict directly
            report_dict = sample_cbom_report
            
            response = client.post(
                "/api/v1/ai-threat-predictor/predict",
                json=report_dict
            )
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["target_component"] == "RSA Key Exchange"
            assert data[0]["threat_level"] == "HIGH"

    @pytest.mark.asyncio
    async def test_detect_anomalies_endpoint(self, client, sample_cbom_report):
        """Test anomaly detection endpoint."""
        with patch('src.quantum_scanner.services.ai_threat_predictor.api.predictor') as mock_predictor:
            # Mock the predictor response
            mock_anomaly = CryptoAnomaly(
                id="anomaly-1",
                component_id="entry-1",
                anomaly_type=AnomalyType.DEPRECATED_ALGORITHM,
                severity_score=0.8,
                description="RSA-2048 is deprecated for new implementations",
                detection_method="rule_based",
                confidence=0.9,
                metadata={"algorithm": "RSA", "key_size": 2048},
                detected_at=datetime.now()
            )
            
            mock_predictor.detect_anomalies.return_value = [mock_anomaly]
            
            # Use the CBOM report dict directly
            report_dict = sample_cbom_report
            
            response = client.post(
                "/api/v1/ai-threat-predictor/detect-anomalies",
                json=report_dict
            )
            
            assert response.status_code == 200
            data = response.json()
            assert len(data) == 1
            assert data[0]["component_id"] == "entry-1"
            assert data[0]["anomaly_type"] == "DEPRECATED_ALGORITHM"

    def test_model_info_endpoint(self, client):
        """Test model information endpoint."""
        response = client.get("/api/v1/ai-threat-predictor/model-info")
        
        assert response.status_code == 200
        data = response.json()
        assert "model_version" in data
        assert "training_data_size" in data
        assert "last_updated" in data
        assert "supported_algorithms" in data

    def test_health_endpoint(self, client):
        """Test health check endpoint."""
        response = client.get("/api/v1/ai-threat-predictor/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "model_loaded" in data
        assert "predictor_ready" in data

    @pytest.mark.asyncio
    async def test_train_model_endpoint(self, client):
        """Test model training endpoint."""
        with patch('src.quantum_scanner.services.ai_threat_predictor.api.predictor') as mock_predictor:
            mock_predictor.train_model.return_value = {
                "training_samples": 1000,
                "validation_accuracy": 0.92,
                "model_version": "v2.1.0"
            }
            
            response = client.post("/api/v1/ai-threat-predictor/train")
            
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "training_started"
            assert "message" in data


class TestAIThreatPredictorIntegration:
    """Test integration with main platform."""

    def test_ai_predictor_router_included(self, client):
        """Test that AI threat predictor routes are included in main app."""
        response = client.get("/api/v1/ai-threat-predictor/health")
        assert response.status_code == 200

    def test_platform_status_includes_ai_predictor(self, client):
        """Test that platform status includes AI threat predictor."""
        response = client.get("/status")
        
        assert response.status_code == 200
        data = response.json()
        assert "services" in data
        assert "ai_threat_predictor" in data["services"]
        assert data["services"]["ai_threat_predictor"] == "active"

    @pytest.mark.asyncio
    async def test_background_task_integration(self, client, sample_cbom_report):
        """Test that background tasks are properly scheduled."""
        with patch('src.quantum_scanner.services.ai_threat_predictor.api.predictor') as mock_predictor:
            mock_predictor.predict_threats.return_value = []
            
            report_dict = sample_cbom_report
            
            response = client.post(
                "/api/v1/ai-threat-predictor/predict",
                json=report_dict
            )
            
            assert response.status_code == 200
            # Background task should be scheduled but we can't easily test it
            # In a real scenario, we'd check the task queue


class TestAIThreatPredictorModels:
    """Test AI threat predictor data models."""

    def test_threat_prediction_model(self, sample_threat_prediction):
        """Test ThreatPrediction model validation."""
        # Test serialization
        data = sample_threat_prediction.dict()
        assert data["threat_level"] == "HIGH"
        assert data["confidence_score"] == 0.85
        
        # Test deserialization
        new_prediction = ThreatPrediction(**data)
        assert new_prediction.threat_level == ThreatLevel.HIGH
        assert new_prediction.confidence_score == 0.85

    def test_crypto_anomaly_model(self):
        """Test CryptoAnomaly model validation."""
        anomaly = CryptoAnomaly(
            id="test-anomaly",
            component_id="comp-1",
            anomaly_type=AnomalyType.WEAK_KEY,
            severity_score=0.7,
            description="Weak key detected",
            detection_method="ml_model",
            confidence=0.85,
            metadata={"key_length": 1024},
            detected_at=datetime.now()
        )
        
        data = anomaly.dict()
        assert data["anomaly_type"] == "WEAK_KEY"
        assert data["severity_score"] == 0.7

    def test_threat_level_enum(self):
        """Test ThreatLevel enum values."""
        assert ThreatLevel.LOW.value == "LOW"
        assert ThreatLevel.MEDIUM.value == "MEDIUM" 
        assert ThreatLevel.HIGH.value == "HIGH"
        assert ThreatLevel.CRITICAL.value == "CRITICAL"

    def test_anomaly_type_enum(self):
        """Test AnomalyType enum values."""
        assert AnomalyType.WEAK_KEY.value == "WEAK_KEY"
        assert AnomalyType.DEPRECATED_ALGORITHM.value == "DEPRECATED_ALGORITHM"
        assert AnomalyType.UNUSUAL_USAGE.value == "UNUSUAL_USAGE"
        assert AnomalyType.CONFIGURATION_ERROR.value == "CONFIGURATION_ERROR"


@pytest.mark.integration
class TestFullWorkflow:
    """Test complete workflow integration."""

    @pytest.mark.asyncio
    async def test_cbom_to_ai_prediction_workflow(self, client, sample_cbom_report):
        """Test complete workflow from CBOM generation to AI threat prediction."""
        # This would be a more complex integration test
        # For now, we'll test the API endpoints work together
        
        with patch('src.quantum_scanner.services.ai_threat_predictor.api.predictor') as mock_predictor:
            mock_predictor.predict_threats.return_value = []
            mock_predictor.detect_anomalies.return_value = []
            
            report_dict = sample_cbom_report
            
            # Test threat prediction
            response1 = client.post(
                "/api/v1/ai-threat-predictor/predict",
                json=report_dict
            )
            assert response1.status_code == 200
            
            # Test anomaly detection
            response2 = client.post(
                "/api/v1/ai-threat-predictor/detect-anomalies", 
                json=report_dict
            )
            assert response2.status_code == 200
            
            # Both should work without interference
            assert len(response1.json()) == 0
            assert len(response2.json()) == 0


if __name__ == "__main__":
    pytest.main([__file__])
