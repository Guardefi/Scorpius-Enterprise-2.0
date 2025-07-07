"""
Scorpius Integration Client for Quantum Scanner AI Threat Predictor

This module provides a client interface for Scorpius microservices to integrate
with the Quantum Scanner's AI threat prediction capabilities.
"""

import asyncio
import aiohttp
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass, asdict
import json

logger = logging.getLogger(__name__)


@dataclass
class ScanResult:
    """Standardized scan result format for integration"""
    asset_id: str
    asset_type: str
    vulnerabilities: List[Dict[str, Any]]
    quantum_risk_score: float
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class ThreatPrediction:
    """AI threat prediction result"""
    threat_score: float
    threat_types: List[str]
    confidence: float
    mitigation_steps: List[str]
    predicted_at: datetime


@dataclass
class AnomalyDetection:
    """Anomaly detection result"""
    is_anomaly: bool
    anomaly_score: float
    anomaly_types: List[str]
    confidence: float
    detected_at: datetime


class QuantumScannerClient:
    """
    Client for integrating Scorpius with Quantum Scanner AI capabilities
    
    This client provides async methods to communicate with the Quantum Scanner's
    AI threat predictor service.
    """
    
    def __init__(
        self,
        base_url: str = "http://quantum-scanner:8000",
        timeout: int = 30,
        max_retries: int = 3
    ):
        self.base_url = base_url.rstrip('/')
        self.timeout = aiohttp.ClientTimeout(total=timeout)
        self.max_retries = max_retries
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(timeout=self.timeout)
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make HTTP request with retry logic"""
        if not self.session:
            raise RuntimeError("Client not initialized. Use async context manager.")
            
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(self.max_retries):
            try:
                async with self.session.request(
                    method, url, json=data, params=params
                ) as response:
                    response.raise_for_status()
                    return await response.json()
                    
            except aiohttp.ClientError as e:
                logger.warning(
                    f"Request failed (attempt {attempt + 1}/{self.max_retries}): {e}"
                )
                if attempt == self.max_retries - 1:
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
                
        raise RuntimeError(f"Failed to complete request after {self.max_retries} attempts")
    
    async def predict_threats(
        self,
        scan_results: List[ScanResult]
    ) -> List[ThreatPrediction]:
        """
        Predict threats based on scan results
        
        Args:
            scan_results: List of standardized scan results
            
        Returns:
            List of threat predictions
        """
        try:
            # Convert scan results to the format expected by Quantum Scanner
            quantum_format = []
            for result in scan_results:
                quantum_format.append({
                    "asset_id": result.asset_id,
                    "asset_type": result.asset_type,
                    "vulnerabilities": result.vulnerabilities,
                    "quantum_risk_score": result.quantum_risk_score,
                    "timestamp": result.timestamp.isoformat(),
                    "metadata": result.metadata or {}
                })
            
            response = await self._make_request(
                "POST",
                "/ai-threat-predictor/predict",
                data={"scan_results": quantum_format}
            )
            
            predictions = []
            for pred_data in response.get("predictions", []):
                prediction = ThreatPrediction(
                    threat_score=pred_data["threat_score"],
                    threat_types=pred_data["threat_types"],
                    confidence=pred_data["confidence"],
                    mitigation_steps=pred_data["mitigation_steps"],
                    predicted_at=datetime.fromisoformat(pred_data["predicted_at"])
                )
                predictions.append(prediction)
                
            logger.info(f"Generated {len(predictions)} threat predictions")
            return predictions
            
        except Exception as e:
            logger.error(f"Failed to predict threats: {e}")
            raise
    
    async def detect_anomalies(
        self,
        scan_results: List[ScanResult]
    ) -> List[AnomalyDetection]:
        """
        Detect anomalies in scan results
        
        Args:
            scan_results: List of standardized scan results
            
        Returns:
            List of anomaly detections
        """
        try:
            # Convert scan results to the format expected by Quantum Scanner
            quantum_format = []
            for result in scan_results:
                quantum_format.append({
                    "asset_id": result.asset_id,
                    "asset_type": result.asset_type,
                    "vulnerabilities": result.vulnerabilities,
                    "quantum_risk_score": result.quantum_risk_score,
                    "timestamp": result.timestamp.isoformat(),
                    "metadata": result.metadata or {}
                })
            
            response = await self._make_request(
                "POST",
                "/ai-threat-predictor/detect-anomalies",
                data={"scan_results": quantum_format}
            )
            
            detections = []
            for detection_data in response.get("anomalies", []):
                detection = AnomalyDetection(
                    is_anomaly=detection_data["is_anomaly"],
                    anomaly_score=detection_data["anomaly_score"],
                    anomaly_types=detection_data["anomaly_types"],
                    confidence=detection_data["confidence"],
                    detected_at=datetime.fromisoformat(detection_data["detected_at"])
                )
                detections.append(detection)
                
            logger.info(f"Processed {len(detections)} anomaly detections")
            return detections
            
        except Exception as e:
            logger.error(f"Failed to detect anomalies: {e}")
            raise
    
    async def get_model_info(self) -> Dict[str, Any]:
        """Get information about the AI models"""
        try:
            response = await self._make_request("GET", "/ai-threat-predictor/model-info")
            return response
        except Exception as e:
            logger.error(f"Failed to get model info: {e}")
            raise
    
    async def health_check(self) -> bool:
        """Check if the Quantum Scanner AI service is healthy"""
        try:
            response = await self._make_request("GET", "/ai-threat-predictor/health")
            return response.get("status") == "healthy"
        except Exception as e:
            logger.warning(f"Health check failed: {e}")
            return False
    
    async def train_model(
        self,
        training_data: List[ScanResult],
        model_type: str = "threat_predictor"
    ) -> Dict[str, Any]:
        """
        Train/retrain the AI model with new data
        
        Args:
            training_data: List of scan results for training
            model_type: Type of model to train
            
        Returns:
            Training result information
        """
        try:
            # Convert training data to quantum format
            quantum_format = []
            for result in training_data:
                quantum_format.append({
                    "asset_id": result.asset_id,
                    "asset_type": result.asset_type,
                    "vulnerabilities": result.vulnerabilities,
                    "quantum_risk_score": result.quantum_risk_score,
                    "timestamp": result.timestamp.isoformat(),
                    "metadata": result.metadata or {}
                })
            
            response = await self._make_request(
                "POST",
                "/ai-threat-predictor/train",
                data={
                    "training_data": quantum_format,
                    "model_type": model_type
                }
            )
            
            logger.info(f"Model training completed: {model_type}")
            return response
            
        except Exception as e:
            logger.error(f"Failed to train model: {e}")
            raise


class ScorpiusQuantumBridge:
    """
    High-level bridge for integrating Scorpius scan results with Quantum Scanner AI
    
    This class provides simplified methods for common integration patterns.
    """
    
    def __init__(self, quantum_client: QuantumScannerClient):
        self.quantum_client = quantum_client
        
    async def enhanced_scan_analysis(
        self,
        scorpius_results: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Perform enhanced analysis by combining Scorpius results with Quantum AI
        
        Args:
            scorpius_results: Raw results from Scorpius scanners
            
        Returns:
            Enhanced analysis with AI predictions and anomaly detection
        """
        try:
            # Convert Scorpius results to standardized format
            scan_results = []
            for result in scorpius_results:
                scan_result = ScanResult(
                    asset_id=result.get("asset_id", "unknown"),
                    asset_type=result.get("asset_type", "unknown"),
                    vulnerabilities=result.get("vulnerabilities", []),
                    quantum_risk_score=result.get("quantum_risk_score", 0.0),
                    timestamp=datetime.fromisoformat(
                        result.get("timestamp", datetime.now().isoformat())
                    ),
                    metadata=result.get("metadata")
                )
                scan_results.append(scan_result)
            
            # Get AI predictions and anomaly detection in parallel
            predictions_task = self.quantum_client.predict_threats(scan_results)
            anomalies_task = self.quantum_client.detect_anomalies(scan_results)
            
            predictions, anomalies = await asyncio.gather(
                predictions_task, anomalies_task
            )
            
            # Combine results
            enhanced_results = {
                "original_results": scorpius_results,
                "ai_predictions": [asdict(pred) for pred in predictions],
                "anomaly_detections": [asdict(anom) for anom in anomalies],
                "analysis_timestamp": datetime.now().isoformat(),
                "enhanced_risk_assessment": self._calculate_enhanced_risk(
                    scan_results, predictions, anomalies
                )
            }
            
            return enhanced_results
            
        except Exception as e:
            logger.error(f"Enhanced analysis failed: {e}")
            raise
    
    def _calculate_enhanced_risk(
        self,
        scan_results: List[ScanResult],
        predictions: List[ThreatPrediction],
        anomalies: List[AnomalyDetection]
    ) -> Dict[str, Any]:
        """Calculate enhanced risk assessment"""
        if not scan_results:
            return {"overall_risk": 0.0, "risk_factors": []}
        
        # Calculate weighted risk score
        total_quantum_risk = sum(r.quantum_risk_score for r in scan_results)
        avg_quantum_risk = total_quantum_risk / len(scan_results)
        
        total_threat_score = sum(p.threat_score for p in predictions)
        avg_threat_score = total_threat_score / len(predictions) if predictions else 0.0
        
        anomaly_count = sum(1 for a in anomalies if a.is_anomaly)
        anomaly_rate = anomaly_count / len(anomalies) if anomalies else 0.0
        
        # Weighted overall risk (quantum: 40%, AI threats: 40%, anomalies: 20%)
        overall_risk = (
            avg_quantum_risk * 0.4 +
            avg_threat_score * 0.4 +
            anomaly_rate * 0.2
        )
        
        risk_factors = []
        if avg_quantum_risk > 0.7:
            risk_factors.append("High quantum vulnerability detected")
        if avg_threat_score > 0.8:
            risk_factors.append("High AI-predicted threat probability")
        if anomaly_rate > 0.3:
            risk_factors.append("Significant anomalous behavior detected")
        
        return {
            "overall_risk": min(overall_risk, 1.0),
            "quantum_risk": avg_quantum_risk,
            "ai_threat_risk": avg_threat_score,
            "anomaly_rate": anomaly_rate,
            "risk_factors": risk_factors,
            "risk_level": self._get_risk_level(overall_risk)
        }
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to human-readable level"""
        if risk_score >= 0.8:
            return "CRITICAL"
        elif risk_score >= 0.6:
            return "HIGH"
        elif risk_score >= 0.4:
            return "MEDIUM"
        elif risk_score >= 0.2:
            return "LOW"
        else:
            return "MINIMAL"


# Example usage function for Scorpius integration
async def integrate_with_scorpius(scorpius_scan_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Example integration function for Scorpius microservices
    
    This function demonstrates how to integrate Scorpius scan results
    with Quantum Scanner AI capabilities.
    """
    async with QuantumScannerClient() as client:
        # Check if Quantum Scanner is available
        if not await client.health_check():
            logger.warning("Quantum Scanner AI service is not available")
            return {"error": "Quantum Scanner AI service unavailable"}
        
        # Create bridge and perform enhanced analysis
        bridge = ScorpiusQuantumBridge(client)
        enhanced_results = await bridge.enhanced_scan_analysis(scorpius_scan_results)
        
        return enhanced_results


if __name__ == "__main__":
    # Example usage
    import asyncio
    
    async def main():
        # Mock Scorpius results for testing
        mock_results = [
            {
                "asset_id": "app-001",
                "asset_type": "web_application",
                "vulnerabilities": [
                    {"type": "weak_crypto", "severity": "high", "algorithm": "RSA-1024"}
                ],
                "quantum_risk_score": 0.85,
                "timestamp": datetime.now().isoformat()
            }
        ]
        
        result = await integrate_with_scorpius(mock_results)
        print(json.dumps(result, indent=2, default=str))
    
    asyncio.run(main())
