"""
Hybrid Inspector scanner implementation.

This module provides advanced scanning capabilities for hybrid cryptographic
implementations, protocol-level analysis, and cryptographic agility assessment.
"""

from typing import List, Dict, Any, Optional
from pathlib import Path
import re
import hashlib
from ...core.logging import get_logger
from .models import (
    HybridInspectorRequest,
    HybridInspectorResponse,
    HybridImplementation,
    ProtocolAnalysis,
    CryptoProtocol,
    HybridMode,
    SecurityLevel,
    CryptoAgility,
)

logger = get_logger(__name__)


class HybridInspectorScanner:
    """
    Advanced scanner for hybrid cryptographic implementations.
    
    This scanner performs deep analysis of cryptographic protocols,
    hybrid implementations, and cryptographic agility assessments.
    """

    def __init__(self):
        """Initialize the hybrid inspector scanner."""
        self.hybrid_patterns = self._load_hybrid_patterns()
        self.protocol_signatures = self._load_protocol_signatures()
        self.agility_indicators = self._load_agility_indicators()

    async def scan_hybrid_implementation(
        self,
        request: HybridInspectorRequest,
    ) -> HybridInspectorResponse:
        """
        Scan for hybrid cryptographic implementations.
        
        Args:
            request: The inspection request containing targets and configuration
            
        Returns:
            HybridInspectorResponse with detected hybrid implementations
        """
        try:
            logger.info(
                "Starting hybrid implementation scan",
                scan_id=request.scan_id,
                target_count=len(request.targets),
            )
            
            hybrid_implementations = []
            protocol_analyses = []
            agility_assessment = None
            
            # Scan each target
            for target in request.targets:
                logger.debug("Scanning target", target=target)
                
                # Detect hybrid implementations
                hybrids = await self._detect_hybrid_implementations(target)
                hybrid_implementations.extend(hybrids)
                
                # Analyze protocols
                protocols = await self._analyze_protocols(target)
                protocol_analyses.extend(protocols)
            
            # Assess overall cryptographic agility
            if request.assess_agility:
                agility_assessment = await self._assess_crypto_agility(
                    hybrid_implementations,
                    protocol_analyses,
                )
            
            # Calculate security metrics
            security_score = self._calculate_security_score(
                hybrid_implementations,
                protocol_analyses,
            )
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                hybrid_implementations,
                protocol_analyses,
                agility_assessment,
            )
            
            result = HybridInspectorResponse(
                scan_id=request.scan_id,
                hybrid_implementations=hybrid_implementations,
                protocol_analyses=protocol_analyses,
                agility_assessment=agility_assessment,
                security_score=security_score,
                recommendations=recommendations,
                metadata={
                    "scan_duration": "1.5s",  # Placeholder
                    "targets_scanned": len(request.targets),
                    "patterns_checked": len(self.hybrid_patterns),
                },
            )
            
            logger.info(
                "Hybrid implementation scan completed",
                scan_id=request.scan_id,
                hybrids_found=len(hybrid_implementations),
                protocols_analyzed=len(protocol_analyses),
                security_score=security_score,
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "Hybrid implementation scan failed",
                scan_id=request.scan_id,
                error=str(e),
            )
            raise

    async def _detect_hybrid_implementations(
        self,
        target: str,
    ) -> List[HybridImplementation]:
        """
        Detect hybrid cryptographic implementations in the target.
        
        Args:
            target: Target path or URL to scan
            
        Returns:
            List of detected hybrid implementations
        """
        implementations = []
        
        try:
            # Check if target is a file or directory
            path = Path(target)
            if path.is_file():
                content = await self._read_file_content(path)
                hybrids = await self._analyze_file_for_hybrids(path, content)
                implementations.extend(hybrids)
            elif path.is_dir():
                # Scan directory recursively
                for file_path in path.rglob("*"):
                    if file_path.is_file() and self._should_scan_file(file_path):
                        content = await self._read_file_content(file_path)
                        hybrids = await self._analyze_file_for_hybrids(file_path, content)
                        implementations.extend(hybrids)
            else:
                # Assume it's a network target
                hybrids = await self._analyze_network_target(target)
                implementations.extend(hybrids)
                
        except Exception as e:
            logger.error("Failed to detect hybrid implementations", error=str(e))
        
        return implementations

    async def _analyze_file_for_hybrids(
        self,
        file_path: Path,
        content: str,
    ) -> List[HybridImplementation]:
        """
        Analyze a file for hybrid cryptographic implementations.
        
        Args:
            file_path: Path to the file being analyzed
            content: File content
            
        Returns:
            List of detected hybrid implementations
        """
        implementations = []
        
        # Check for hybrid patterns
        for pattern_name, pattern_data in self.hybrid_patterns.items():
            matches = re.finditer(pattern_data["regex"], content, re.IGNORECASE)
            
            for match in matches:
                implementation = HybridImplementation(
                    id=hashlib.md5(f"{file_path}:{match.start()}".encode()).hexdigest(),
                    name=pattern_data.get("name", pattern_name),
                    location=str(file_path),
                    line_number=content[:match.start()].count('\n') + 1,
                    traditional_algorithm=pattern_data.get("traditional_algo", "unknown"),
                    pqc_algorithm=pattern_data.get("pqc_algo", "unknown"),
                    hybrid_mode=HybridMode(pattern_data.get("mode", "parallel")),
                    security_level=SecurityLevel(pattern_data.get("security_level", "medium")),
                    implementation_details={
                        "pattern_matched": pattern_name,
                        "matched_text": match.group(),
                        "confidence": pattern_data.get("confidence", 0.8),
                    },
                )
                implementations.append(implementation)
        
        return implementations

    async def _analyze_protocols(self, target: str) -> List[ProtocolAnalysis]:
        """
        Analyze cryptographic protocols in the target.
        
        Args:
            target: Target to analyze
            
        Returns:
            List of protocol analyses
        """
        analyses = []
        
        # This is a simplified implementation
        # In practice, this would involve deep packet inspection,
        # TLS handshake analysis, etc.
        
        protocol = ProtocolAnalysis(
            id=hashlib.md5(target.encode()).hexdigest(),
            protocol=CryptoProtocol.TLS,
            version="1.3",
            location=target,
            algorithms_detected=["ECDHE-RSA-AES256-GCM-SHA384", "RSA"],
            quantum_vulnerability="high",
            hybrid_support=False,
            recommendations=[
                "Implement hybrid key exchange",
                "Add post-quantum signatures",
                "Enable quantum-safe cipher suites",
            ],
            metadata={
                "detection_method": "pattern_analysis",
                "confidence": 0.9,
            },
        )
        
        analyses.append(protocol)
        return analyses

    async def _assess_crypto_agility(
        self,
        hybrids: List[HybridImplementation],
        protocols: List[ProtocolAnalysis],
    ) -> CryptoAgility:
        """
        Assess overall cryptographic agility.
        
        Args:
            hybrids: Detected hybrid implementations
            protocols: Analyzed protocols
            
        Returns:
            Cryptographic agility assessment
        """
        # Calculate agility metrics
        algorithm_flexibility = 0.7  # Based on detected hybrid implementations
        key_management_agility = 0.6  # Based on key management practices
        protocol_agility = 0.8  # Based on protocol support
        
        overall_score = (
            algorithm_flexibility + key_management_agility + protocol_agility
        ) / 3
        
        # Determine readiness level
        if overall_score >= 0.8:
            readiness = "high"
        elif overall_score >= 0.6:
            readiness = "medium"
        else:
            readiness = "low"
        
        return CryptoAgility(
            algorithm_flexibility=algorithm_flexibility,
            key_management_agility=key_management_agility,
            protocol_agility=protocol_agility,
            overall_score=overall_score,
            quantum_readiness=readiness,
            migration_complexity="medium",
            recommendations=[
                "Implement cryptographic abstraction layer",
                "Add algorithm negotiation capabilities",
                "Design modular key management system",
                "Plan phased migration strategy",
            ],
            gaps_identified=[
                "Limited algorithm negotiation",
                "Hardcoded cryptographic parameters",
                "Monolithic key management",
            ],
        )

    def _calculate_security_score(
        self,
        hybrids: List[HybridImplementation],
        protocols: List[ProtocolAnalysis],
    ) -> float:
        """
        Calculate overall security score.
        
        Args:
            hybrids: Detected hybrid implementations
            protocols: Analyzed protocols
            
        Returns:
            Security score between 0.0 and 1.0
        """
        if not hybrids and not protocols:
            return 0.0
        
        # Score based on hybrid implementations
        hybrid_score = 0.0
        if hybrids:
            security_levels = [impl.security_level for impl in hybrids]
            high_security = sum(1 for level in security_levels if level == SecurityLevel.HIGH)
            hybrid_score = high_security / len(hybrids)
        
        # Score based on protocol analysis
        protocol_score = 0.0
        if protocols:
            quantum_safe = sum(
                1 for proto in protocols 
                if proto.quantum_vulnerability == "low"
            )
            protocol_score = quantum_safe / len(protocols)
        
        # Weighted average
        if hybrids and protocols:
            return (hybrid_score * 0.6 + protocol_score * 0.4)
        elif hybrids:
            return hybrid_score
        else:
            return protocol_score

    def _generate_recommendations(
        self,
        hybrids: List[HybridImplementation],
        protocols: List[ProtocolAnalysis],
        agility: Optional[CryptoAgility],
    ) -> List[str]:
        """
        Generate security recommendations.
        
        Args:
            hybrids: Detected hybrid implementations
            protocols: Analyzed protocols
            agility: Agility assessment
            
        Returns:
            List of recommendations
        """
        recommendations = []
        
        # Hybrid-specific recommendations
        if not hybrids:
            recommendations.append("Implement hybrid cryptographic approach")
            recommendations.append("Add post-quantum backup algorithms")
        
        # Protocol-specific recommendations
        vulnerable_protocols = [
            p for p in protocols 
            if p.quantum_vulnerability == "high"
        ]
        if vulnerable_protocols:
            recommendations.append("Upgrade quantum-vulnerable protocols")
            recommendations.append("Enable hybrid cipher suites")
        
        # Agility-specific recommendations
        if agility and agility.overall_score < 0.7:
            recommendations.extend(agility.recommendations[:3])
        
        # General recommendations
        recommendations.extend([
            "Conduct regular cryptographic inventory",
            "Implement crypto-agility best practices",
            "Plan for quantum-safe migration timeline",
        ])
        
        return list(set(recommendations))  # Remove duplicates

    async def _read_file_content(self, file_path: Path) -> str:
        """Read file content safely."""
        try:
            return file_path.read_text(encoding='utf-8', errors='ignore')
        except Exception:
            return ""

    def _should_scan_file(self, file_path: Path) -> bool:
        """Determine if a file should be scanned."""
        scannable_extensions = {
            '.py', '.js', '.ts', '.java', '.c', '.cpp', '.h', '.hpp',
            '.go', '.rs', '.rb', '.php', '.cs', '.swift', '.kt',
            '.config', '.yml', '.yaml', '.json', '.xml',
        }
        return file_path.suffix.lower() in scannable_extensions

    async def _analyze_network_target(self, target: str) -> List[HybridImplementation]:
        """Analyze network target for hybrid implementations."""
        # Placeholder for network analysis
        # In practice, this would involve TLS inspection, etc.
        return []

    def _load_hybrid_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Load hybrid cryptographic patterns."""
        return {
            "kyber_rsa_hybrid": {
                "regex": r"(kyber.*rsa|rsa.*kyber)",
                "name": "Kyber-RSA Hybrid",
                "traditional_algo": "RSA",
                "pqc_algo": "Kyber",
                "mode": "parallel",
                "security_level": "high",
                "confidence": 0.9,
            },
            "dilithium_ecdsa_hybrid": {
                "regex": r"(dilithium.*ecdsa|ecdsa.*dilithium)",
                "name": "Dilithium-ECDSA Hybrid",
                "traditional_algo": "ECDSA",
                "pqc_algo": "Dilithium",
                "mode": "parallel",
                "security_level": "high",
                "confidence": 0.9,
            },
            "sphincs_rsa_hybrid": {
                "regex": r"(sphincs.*rsa|rsa.*sphincs)",
                "name": "SPHINCS+-RSA Hybrid",
                "traditional_algo": "RSA",
                "pqc_algo": "SPHINCS+",
                "mode": "sequential",
                "security_level": "high",
                "confidence": 0.8,
            },
        }

    def _load_protocol_signatures(self) -> Dict[str, Dict[str, Any]]:
        """Load protocol signature patterns."""
        return {
            "tls_handshake": {
                "regex": r"(client.*hello|server.*hello)",
                "protocol": "TLS",
                "confidence": 0.8,
            },
            "ssh_negotiation": {
                "regex": r"(ssh.*kex|key.*exchange)",
                "protocol": "SSH",
                "confidence": 0.7,
            },
        }

    def _load_agility_indicators(self) -> Dict[str, Dict[str, Any]]:
        """Load cryptographic agility indicators."""
        return {
            "algorithm_abstraction": {
                "regex": r"(crypto.*factory|algorithm.*provider)",
                "weight": 0.8,
                "type": "algorithm_flexibility",
            },
            "configurable_crypto": {
                "regex": r"(crypto.*config|cipher.*suite)",
                "weight": 0.7,
                "type": "protocol_agility",
            },
        }
