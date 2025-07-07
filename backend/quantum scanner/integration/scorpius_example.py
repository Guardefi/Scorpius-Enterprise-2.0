"""
Example Scorpius Integration Implementation

This file demonstrates how to integrate the Quantum Scanner AI threat predictor
into a Scorpius microservice.
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import json

# Import the integration client
from integration.scorpius_client import (
    QuantumScannerClient, 
    ScorpiusQuantumBridge,
    ScanResult,
    integrate_with_scorpius
)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ScorpiusScanResult:
    """Original Scorpius scan result format"""
    target_id: str
    target_type: str
    scan_time: datetime
    findings: List[Dict[str, Any]]
    risk_score: float
    scan_metadata: Optional[Dict[str, Any]] = None


class EnhancedScorpiusScanner:
    """
    Enhanced Scorpius scanner with Quantum Scanner AI integration
    
    This class demonstrates how to integrate Quantum Scanner's AI capabilities
    into an existing Scorpius scanning workflow.
    """
    
    def __init__(self, quantum_scanner_url: str = "http://quantum-scanner:8000"):
        self.quantum_scanner_url = quantum_scanner_url
        self.enable_ai_prediction = True
        self.enable_anomaly_detection = True
        
    async def perform_enhanced_scan(
        self, 
        target: str, 
        scan_type: str = "comprehensive"
    ) -> Dict[str, Any]:
        """
        Perform an enhanced scan combining Scorpius and Quantum Scanner capabilities
        
        Args:
            target: Target to scan (URL, IP, etc.)
            scan_type: Type of scan to perform
            
        Returns:
            Enhanced scan results with AI analysis
        """
        try:
            # Step 1: Perform traditional Scorpius scan
            logger.info(f"Starting Scorpius scan for target: {target}")
            scorpius_results = await self._perform_scorpius_scan(target, scan_type)
            
            # Step 2: Convert to standardized format for Quantum Scanner
            logger.info("Converting results for Quantum Scanner analysis")
            standardized_results = self._convert_to_quantum_format(scorpius_results)
            
            # Step 3: Get AI-enhanced analysis (if enabled)
            if self.enable_ai_prediction or self.enable_anomaly_detection:
                logger.info("Performing AI-enhanced analysis")
                ai_analysis = await self._get_ai_analysis(standardized_results)
            else:
                ai_analysis = None
            
            # Step 4: Combine results
            enhanced_results = self._combine_results(
                scorpius_results, 
                standardized_results, 
                ai_analysis
            )
            
            logger.info(f"Enhanced scan completed for target: {target}")
            return enhanced_results
            
        except Exception as e:
            logger.error(f"Enhanced scan failed for target {target}: {e}")
            # Fallback to Scorpius-only results
            scorpius_results = await self._perform_scorpius_scan(target, scan_type)
            return {
                "target": target,
                "scan_type": scan_type,
                "scorpius_results": scorpius_results,
                "ai_analysis": None,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    async def _perform_scorpius_scan(
        self, 
        target: str, 
        scan_type: str
    ) -> List[ScorpiusScanResult]:
        """
        Simulate traditional Scorpius scanning
        
        In a real implementation, this would call your existing Scorpius
        scanning logic.
        """
        # Simulate scan delay
        await asyncio.sleep(1)
        
        # Mock Scorpius scan results
        mock_findings = [
            {
                "vulnerability_type": "weak_encryption",
                "severity": "high",
                "details": {
                    "algorithm": "RSA-1024",
                    "location": "/api/auth",
                    "quantum_vulnerable": True
                }
            },
            {
                "vulnerability_type": "outdated_protocol",
                "severity": "medium", 
                "details": {
                    "protocol": "TLS 1.1",
                    "location": "/api/data",
                    "quantum_vulnerable": False
                }
            }
        ]
        
        result = ScorpiusScanResult(
            target_id=target,
            target_type="web_application",
            scan_time=datetime.now(),
            findings=mock_findings,
            risk_score=0.75,
            scan_metadata={"scan_type": scan_type, "scanner_version": "2.1.0"}
        )
        
        return [result]
    
    def _convert_to_quantum_format(
        self, 
        scorpius_results: List[ScorpiusScanResult]
    ) -> List[Dict[str, Any]]:
        """
        Convert Scorpius results to Quantum Scanner format
        """
        quantum_format = []
        
        for result in scorpius_results:
            # Calculate quantum risk score based on findings
            quantum_risk = self._calculate_quantum_risk(result.findings)
            
            quantum_result = {
                "asset_id": result.target_id,
                "asset_type": result.target_type,
                "vulnerabilities": result.findings,
                "quantum_risk_score": quantum_risk,
                "timestamp": result.scan_time.isoformat(),
                "metadata": result.scan_metadata
            }
            quantum_format.append(quantum_result)
            
        return quantum_format
    
    def _calculate_quantum_risk(self, findings: List[Dict[str, Any]]) -> float:
        """
        Calculate quantum vulnerability risk score from findings
        """
        if not findings:
            return 0.0
            
        quantum_vulnerable_count = sum(
            1 for finding in findings 
            if finding.get("details", {}).get("quantum_vulnerable", False)
        )
        
        high_severity_count = sum(
            1 for finding in findings
            if finding.get("severity") == "high"
        )
        
        # Simple risk calculation
        base_risk = len(findings) * 0.1
        quantum_penalty = quantum_vulnerable_count * 0.3
        severity_penalty = high_severity_count * 0.2
        
        return min(base_risk + quantum_penalty + severity_penalty, 1.0)
    
    async def _get_ai_analysis(
        self, 
        standardized_results: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Get AI analysis from Quantum Scanner
        """
        try:
            # Use the integration client
            ai_analysis = await integrate_with_scorpius(standardized_results)
            return ai_analysis
            
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return None
    
    def _combine_results(
        self,
        scorpius_results: List[ScorpiusScanResult],
        standardized_results: List[Dict[str, Any]],
        ai_analysis: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Combine Scorpius and AI analysis results
        """
        combined_results = {
            "scan_summary": {
                "total_targets": len(scorpius_results),
                "scan_timestamp": datetime.now().isoformat(),
                "scanner_version": "Scorpius 2.1.0 + Quantum AI 1.0.0"
            },
            "scorpius_results": [
                {
                    "target_id": result.target_id,
                    "target_type": result.target_type,
                    "scan_time": result.scan_time.isoformat(),
                    "findings": result.findings,
                    "risk_score": result.risk_score,
                    "metadata": result.scan_metadata
                }
                for result in scorpius_results
            ],
            "ai_analysis": ai_analysis,
            "enhanced_insights": self._generate_insights(scorpius_results, ai_analysis)
        }
        
        return combined_results
    
    def _generate_insights(
        self,
        scorpius_results: List[ScorpiusScanResult],
        ai_analysis: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generate actionable insights from combined analysis
        """
        insights = {
            "key_findings": [],
            "risk_assessment": "UNKNOWN",
            "recommendations": [],
            "quantum_readiness": "UNKNOWN"
        }
        
        if not ai_analysis:
            # Fallback insights from Scorpius only
            total_findings = sum(len(result.findings) for result in scorpius_results)
            avg_risk = sum(result.risk_score for result in scorpius_results) / len(scorpius_results)
            
            insights["key_findings"].append(f"Found {total_findings} vulnerabilities")
            insights["risk_assessment"] = "MEDIUM" if avg_risk > 0.5 else "LOW"
            insights["recommendations"].append("Consider upgrading cryptographic implementations")
            
            return insights
        
        # Enhanced insights with AI analysis
        enhanced_risk = ai_analysis.get("enhanced_risk_assessment", {})
        overall_risk = enhanced_risk.get("overall_risk", 0.0)
        risk_level = enhanced_risk.get("risk_level", "UNKNOWN")
        
        insights["risk_assessment"] = risk_level
        insights["key_findings"].extend(enhanced_risk.get("risk_factors", []))
        
        # AI predictions insights
        ai_predictions = ai_analysis.get("ai_predictions", [])
        if ai_predictions:
            avg_threat_score = sum(p.get("threat_score", 0) for p in ai_predictions) / len(ai_predictions)
            insights["key_findings"].append(f"AI predicted threat score: {avg_threat_score:.2f}")
            
            # Collect mitigation steps
            all_mitigations = []
            for prediction in ai_predictions:
                all_mitigations.extend(prediction.get("mitigation_steps", []))
            
            # Deduplicate and add to recommendations
            unique_mitigations = list(set(all_mitigations))
            insights["recommendations"].extend(unique_mitigations[:5])  # Top 5
        
        # Anomaly detection insights
        anomalies = ai_analysis.get("anomaly_detections", [])
        anomaly_count = sum(1 for a in anomalies if a.get("is_anomaly", False))
        if anomaly_count > 0:
            insights["key_findings"].append(f"Detected {anomaly_count} anomalous patterns")
            insights["recommendations"].append("Investigate unusual security patterns")
        
        # Quantum readiness assessment
        quantum_risk = enhanced_risk.get("quantum_risk", 0.0)
        if quantum_risk < 0.3:
            insights["quantum_readiness"] = "GOOD"
        elif quantum_risk < 0.7:
            insights["quantum_readiness"] = "NEEDS_IMPROVEMENT"
        else:
            insights["quantum_readiness"] = "CRITICAL"
            insights["recommendations"].insert(0, "URGENT: Migrate to post-quantum cryptography")
        
        return insights


class ScorpiusAPIIntegration:
    """
    API integration layer for Scorpius with Quantum Scanner
    
    This class provides REST API endpoints that can be integrated into
    your existing Scorpius API.
    """
    
    def __init__(self):
        self.scanner = EnhancedScorpiusScanner()
    
    async def scan_endpoint(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhanced scan endpoint for Scorpius API
        
        Request format:
        {
            "target": "https://example.com",
            "scan_type": "comprehensive",
            "options": {
                "enable_ai": true,
                "include_recommendations": true
            }
        }
        """
        target = request_data.get("target")
        scan_type = request_data.get("scan_type", "comprehensive")
        options = request_data.get("options", {})
        
        if not target:
            return {"error": "Target is required"}
        
        # Configure scanner based on options
        self.scanner.enable_ai_prediction = options.get("enable_ai", True)
        self.scanner.enable_anomaly_detection = options.get("enable_ai", True)
        
        try:
            results = await self.scanner.perform_enhanced_scan(target, scan_type)
            
            # Filter response based on options
            if not options.get("include_recommendations", True):
                if "enhanced_insights" in results:
                    results["enhanced_insights"].pop("recommendations", None)
            
            return {
                "status": "success",
                "data": results
            }
            
        except Exception as e:
            logger.error(f"Scan endpoint failed: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def health_check_endpoint(self) -> Dict[str, Any]:
        """
        Health check endpoint including Quantum Scanner connectivity
        """
        health_status = {
            "scorpius": "healthy",
            "quantum_scanner": "unknown",
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            async with QuantumScannerClient() as client:
                is_healthy = await client.health_check()
                health_status["quantum_scanner"] = "healthy" if is_healthy else "unhealthy"
        except Exception as e:
            health_status["quantum_scanner"] = "error"
            health_status["quantum_error"] = str(e)
        
        overall_status = (
            "healthy" if health_status["quantum_scanner"] in ["healthy", "unknown"]
            else "degraded"
        )
        
        return {
            "status": overall_status,
            "services": health_status
        }


# Example usage and testing
async def example_usage():
    """
    Example demonstrating how to use the enhanced Scorpius scanner
    """
    print("🔍 Starting Enhanced Scorpius Scanner Example...")
    
    # Initialize the enhanced scanner
    scanner = EnhancedScorpiusScanner()
    
    # Perform enhanced scan
    target = "https://example.com"
    results = await scanner.perform_enhanced_scan(target)
    
    # Display results
    print(f"\n📊 Scan Results for {target}:")
    print(f"Risk Assessment: {results['enhanced_insights']['risk_assessment']}")
    print(f"Quantum Readiness: {results['enhanced_insights']['quantum_readiness']}")
    
    print("\n🔑 Key Findings:")
    for finding in results['enhanced_insights']['key_findings']:
        print(f"  • {finding}")
    
    print("\n💡 Recommendations:")
    for rec in results['enhanced_insights']['recommendations']:
        print(f"  • {rec}")
    
    # Test API integration
    print("\n🌐 Testing API Integration...")
    api = ScorpiusAPIIntegration()
    
    # Test scan endpoint
    request = {
        "target": target,
        "scan_type": "comprehensive",
        "options": {
            "enable_ai": True,
            "include_recommendations": True
        }
    }
    
    api_result = await api.scan_endpoint(request)
    print(f"API Response Status: {api_result['status']}")
    
    # Test health check
    health = await api.health_check_endpoint()
    print(f"Health Check: {health['status']}")
    print(f"Quantum Scanner: {health['services']['quantum_scanner']}")


if __name__ == "__main__":
    # Run example
    asyncio.run(example_usage())
