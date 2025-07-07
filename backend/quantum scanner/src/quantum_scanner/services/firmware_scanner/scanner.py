"""
Firmware Scanner - IoT/Embedded Crypto Discovery

Main scanner class for comprehensive firmware and IoT device analysis.
"""

import asyncio
import time
from typing import Dict, List, Any
from uuid import UUID, uuid4

import structlog

from quantum_scanner.core.exceptions import ScanError
from .models import (
    FirmwareTarget,
    FirmwareScanRequest,
    FirmwareScanResult,
    DeviceProfile,
    CryptoImplementation,
    VulnerabilityFinding,
    FirmwareAnalysisReport,
    CryptoDiscoveryStats,
    VulnerabilitySeverity,
    DeviceType
)
from .analyzers import BinaryAnalyzer, ProtocolAnalyzer, CertificateAnalyzer

logger = structlog.get_logger(__name__)


class FirmwareScanner:
    """Main scanner for firmware and IoT device analysis."""
    
    def __init__(self):
        self.binary_analyzer = BinaryAnalyzer()
        self.protocol_analyzer = ProtocolAnalyzer()
        self.certificate_analyzer = CertificateAnalyzer()

    async def scan_firmware(self, request: FirmwareScanRequest) -> FirmwareScanResult:
        """
        Perform comprehensive firmware/device scanning.
        
        Args:
            request: Scan request parameters
            
        Returns:
            FirmwareScanResult: Comprehensive scan results
        """
        start_time = time.time()
        request_id = uuid4()
        
        try:
            logger.info(
                "Starting firmware scan",
                target=request.target.name,
                device_type=request.target.device_type,
                scan_methods=request.scan_methods
            )
            
            # Build device profile
            device_profile = await self._build_device_profile(request.target)
            
            # Collect crypto implementations and vulnerabilities
            all_implementations = []
            all_vulnerabilities = []
            
            # Binary analysis
            if request.include_binary_analysis and request.target.firmware_path:
                binary_impls, binary_vulns = await self.binary_analyzer.analyze_binary(
                    request.target.firmware_path, request.target
                )
                all_implementations.extend(binary_impls)
                all_vulnerabilities.extend(binary_vulns)
            
            # Protocol analysis
            if request.include_network_scan and request.target.ip_address:
                protocol_impls, protocol_vulns = await self.protocol_analyzer.analyze_protocols(
                    request.target
                )
                all_implementations.extend(protocol_impls)
                all_vulnerabilities.extend(protocol_vulns)
            
            # Certificate analysis
            if request.check_certificates:
                cert_impls, cert_vulns = await self.certificate_analyzer.analyze_certificates(
                    request.target
                )
                all_implementations.extend(cert_impls)
                all_vulnerabilities.extend(cert_vulns)
            
            # Calculate quantum risk score
            quantum_risk_score = self._calculate_risk_score(
                all_implementations, all_vulnerabilities
            )
            
            # Assess compliance
            compliance_status = await self._assess_compliance(
                all_implementations, all_vulnerabilities, request.compliance_frameworks
            )
            
            # Generate recommendations
            recommendations = self._generate_recommendations(
                all_implementations, all_vulnerabilities
            )
            
            scan_duration = time.time() - start_time
            
            result = FirmwareScanResult(
                request_id=request_id,
                target=request.target,
                device_profile=device_profile,
                crypto_implementations=all_implementations,
                vulnerabilities=all_vulnerabilities,
                quantum_risk_score=quantum_risk_score,
                compliance_status=compliance_status,
                remediation_recommendations=recommendations,
                scan_metadata={
                    "scan_methods_used": request.scan_methods,
                    "scan_depth": request.scan_depth,
                    "analyzers_used": ["binary", "protocol", "certificate"]
                },
                scan_duration=scan_duration
            )
            
            logger.info(
                "Firmware scan completed",
                target=request.target.name,
                implementations_found=len(all_implementations),
                vulnerabilities_found=len(all_vulnerabilities),
                risk_score=quantum_risk_score,
                scan_duration=scan_duration
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "Firmware scan failed",
                target=request.target.name,
                error=str(e)
            )
            raise ScanError(f"Failed to scan firmware {request.target.name}: {str(e)}")

    async def _build_device_profile(self, target: FirmwareTarget) -> DeviceProfile:
        """Build comprehensive device profile."""
        await asyncio.sleep(0.1)
        
        # Simulate device profiling
        profile_data = self._get_device_profile_data(target)
        
        return DeviceProfile(
            device_info=target,
            operating_system=profile_data.get("os"),
            architecture=profile_data.get("arch"),
            open_ports=profile_data.get("ports", []),
            services=profile_data.get("services", []),
            certificates=profile_data.get("certificates", []),
            crypto_libraries=profile_data.get("crypto_libs", []),
            security_features=profile_data.get("security_features", []),
            update_mechanism=profile_data.get("update_mechanism")
        )

    def _get_device_profile_data(self, target: FirmwareTarget) -> Dict[str, Any]:
        """Get simulated device profile data."""
        profiles = {
            "router": {
                "os": "Linux 4.14",
                "arch": "MIPS",
                "ports": [22, 23, 80, 443],
                "services": ["SSH", "Telnet", "HTTP", "HTTPS"],
                "crypto_libs": ["OpenSSL", "mbedTLS"],
                "security_features": ["WPA2", "Firewall"],
                "update_mechanism": "Web interface"
            },
            "camera": {
                "os": "Linux 3.10",
                "arch": "ARM",
                "ports": [80, 443, 554],
                "services": ["HTTP", "HTTPS", "RTSP"],
                "crypto_libs": ["mbedTLS"],
                "security_features": ["WPA2"],
                "update_mechanism": "Manual firmware upload"
            },
            "sensor": {
                "os": "FreeRTOS",
                "arch": "ARM Cortex-M",
                "ports": [443],
                "services": ["HTTPS"],
                "crypto_libs": ["tinyCrypt"],
                "security_features": ["TLS"],
                "update_mechanism": "OTA updates"
            }
        }
        
        return profiles.get(
            target.device_type.value,
            {
                "os": "Unknown",
                "arch": "Unknown",
                "ports": [],
                "services": [],
                "crypto_libs": [],
                "security_features": [],
                "update_mechanism": "Unknown"
            }
        )

    def _calculate_risk_score(
        self, 
        implementations: List[CryptoImplementation],
        vulnerabilities: List[VulnerabilityFinding]
    ) -> float:
        """Calculate quantum risk score (0-10)."""
        if not implementations and not vulnerabilities:
            return 0.0
        
        risk_score = 0.0
        
        # Score based on vulnerabilities
        for vuln in vulnerabilities:
            if vuln.severity == VulnerabilitySeverity.CRITICAL:
                risk_score += 3.0
            elif vuln.severity == VulnerabilitySeverity.HIGH:
                risk_score += 2.0
            elif vuln.severity == VulnerabilitySeverity.MEDIUM:
                risk_score += 1.0
            elif vuln.severity == VulnerabilitySeverity.LOW:
                risk_score += 0.5
        
        # Score based on quantum-vulnerable implementations
        quantum_vulnerable_count = sum(
            1 for impl in implementations if impl.quantum_vulnerable
        )
        risk_score += quantum_vulnerable_count * 1.5
        
        # Score based on deprecated algorithms
        deprecated_count = sum(
            1 for impl in implementations if impl.deprecated
        )
        risk_score += deprecated_count * 1.0
        
        # Normalize to 0-10 scale
        return min(risk_score, 10.0)

    async def _assess_compliance(
        self,
        implementations: List[CryptoImplementation],
        vulnerabilities: List[VulnerabilityFinding],
        frameworks: List[str]
    ) -> Dict[str, str]:
        """Assess compliance with security frameworks."""
        await asyncio.sleep(0.1)
        
        compliance_status = {}
        
        for framework in frameworks:
            if framework.upper() == "NIST":
                # Check for NIST compliance
                has_deprecated = any(impl.deprecated for impl in implementations)
                compliance_status["NIST"] = "Non-compliant" if has_deprecated else "Compliant"
            
            elif framework.upper() == "FIPS":
                # Check for FIPS compliance
                has_fips_algorithms = any(
                    impl.algorithm in ["AES", "SHA-256", "SHA-384", "SHA-512"]
                    for impl in implementations
                )
                compliance_status["FIPS"] = "Compliant" if has_fips_algorithms else "Non-compliant"
            
            elif framework.upper() == "IOT_SECURITY":
                # IoT security best practices
                critical_vulns = [v for v in vulnerabilities if v.severity == VulnerabilitySeverity.CRITICAL]
                compliance_status["IoT Security"] = "Non-compliant" if critical_vulns else "Compliant"
            
            else:
                compliance_status[framework] = "Assessment Required"
        
        return compliance_status

    def _generate_recommendations(
        self,
        implementations: List[CryptoImplementation],
        vulnerabilities: List[VulnerabilityFinding]
    ) -> List[str]:
        """Generate remediation recommendations."""
        recommendations = []
        
        # Check for quantum-vulnerable algorithms
        quantum_vulnerable = [impl for impl in implementations if impl.quantum_vulnerable]
        if quantum_vulnerable:
            recommendations.append(
                "Migrate quantum-vulnerable algorithms (RSA, ECDSA) to post-quantum alternatives"
            )
        
        # Check for deprecated algorithms
        deprecated = [impl for impl in implementations if impl.deprecated]
        if deprecated:
            recommendations.append(
                "Replace deprecated cryptographic algorithms with modern alternatives"
            )
        
        # Check for critical vulnerabilities
        critical_vulns = [v for v in vulnerabilities if v.severity == VulnerabilitySeverity.CRITICAL]
        if critical_vulns:
            recommendations.append(
                "Address critical security vulnerabilities immediately"
            )
        
        # Check for custom crypto implementations
        custom_crypto = [impl for impl in implementations if impl.custom_implementation]
        if custom_crypto:
            recommendations.append(
                "Review custom cryptographic implementations for security flaws"
            )
        
        # General recommendations
        recommendations.extend([
            "Implement regular firmware security assessments",
            "Establish secure firmware update mechanisms",
            "Monitor for cryptographic vulnerabilities and patches"
        ])
        
        return recommendations

    async def generate_analysis_report(
        self,
        scan_results: List[FirmwareScanResult],
        organization: str
    ) -> FirmwareAnalysisReport:
        """Generate comprehensive firmware analysis report."""
        logger.info(
            "Generating firmware analysis report",
            organization=organization,
            devices_scanned=len(scan_results)
        )
        
        # Calculate crypto discovery statistics
        all_implementations = []
        all_vulnerabilities = []
        
        for result in scan_results:
            all_implementations.extend(result.crypto_implementations)
            all_vulnerabilities.extend(result.vulnerabilities)
        
        crypto_stats = CryptoDiscoveryStats(
            total_implementations=len(all_implementations),
            quantum_vulnerable_count=sum(1 for impl in all_implementations if impl.quantum_vulnerable),
            deprecated_count=sum(1 for impl in all_implementations if impl.deprecated),
            custom_crypto_count=sum(1 for impl in all_implementations if impl.custom_implementation),
            algorithm_breakdown=self._get_algorithm_breakdown(all_implementations),
            library_breakdown=self._get_library_breakdown(all_implementations)
        )
        
        # Risk distribution
        risk_distribution = {}
        for severity in VulnerabilitySeverity:
            risk_distribution[severity] = sum(
                1 for vuln in all_vulnerabilities if vuln.severity == severity
            )
        
        # Device type breakdown
        device_breakdown = {}
        for device_type in DeviceType:
            device_breakdown[device_type] = sum(
                1 for result in scan_results if result.target.device_type == device_type
            )
        
        # Executive summary
        total_devices = len(scan_results)
        vulnerable_devices = sum(1 for result in scan_results if result.quantum_risk_score >= 7.0)
        
        executive_summary = (
            f"Firmware analysis for {organization} assessed {total_devices} devices. "
            f"{vulnerable_devices} devices have high quantum risk scores (≥7.0). "
            f"{crypto_stats.quantum_vulnerable_count} quantum-vulnerable crypto implementations found. "
            f"Immediate attention required for {risk_distribution.get(VulnerabilitySeverity.CRITICAL, 0)} critical vulnerabilities."
        )
        
        return FirmwareAnalysisReport(
            organization=organization,
            devices_scanned=total_devices,
            scan_results=scan_results,
            crypto_discovery_stats=crypto_stats,
            risk_distribution=risk_distribution,
            device_type_breakdown=device_breakdown,
            top_vulnerabilities=sorted(
                all_vulnerabilities,
                key=lambda v: {"critical": 4, "high": 3, "medium": 2, "low": 1}.get(v.severity.value, 0),
                reverse=True
            )[:10],
            quantum_readiness_summary={
                "total_implementations": len(all_implementations),
                "quantum_safe_count": len(all_implementations) - crypto_stats.quantum_vulnerable_count,
                "readiness_percentage": round(
                    ((len(all_implementations) - crypto_stats.quantum_vulnerable_count) / max(len(all_implementations), 1)) * 100, 1
                )
            },
            executive_summary=executive_summary,
            technical_recommendations=[
                "Prioritize quantum-safe algorithm migration for critical devices",
                "Implement automated firmware security scanning",
                "Establish device inventory and crypto asset management",
                "Deploy quantum-safe cryptographic standards",
                "Regular security assessment and penetration testing"
            ],
            compliance_summary=self._generate_compliance_summary(scan_results)
        )

    def _get_algorithm_breakdown(self, implementations: List[CryptoImplementation]) -> Dict[str, int]:
        """Get breakdown of implementations by algorithm."""
        breakdown = {}
        for impl in implementations:
            algorithm = impl.algorithm
            breakdown[algorithm] = breakdown.get(algorithm, 0) + 1
        return breakdown

    def _get_library_breakdown(self, implementations: List[CryptoImplementation]) -> Dict[str, int]:
        """Get breakdown of implementations by library."""
        breakdown = {}
        for impl in implementations:
            library = impl.library_name or "Unknown"
            breakdown[library] = breakdown.get(library, 0) + 1
        return breakdown

    def _generate_compliance_summary(self, scan_results: List[FirmwareScanResult]) -> Dict[str, str]:
        """Generate compliance summary across all scanned devices."""
        all_compliance = {}
        
        for result in scan_results:
            for framework, status in result.compliance_status.items():
                if framework not in all_compliance:
                    all_compliance[framework] = []
                all_compliance[framework].append(status)
        
        # Determine overall compliance status
        compliance_summary = {}
        for framework, statuses in all_compliance.items():
            compliant_count = sum(1 for status in statuses if status == "Compliant")
            total_count = len(statuses)
            
            if compliant_count == total_count:
                compliance_summary[framework] = "Fully Compliant"
            elif compliant_count > total_count / 2:
                compliance_summary[framework] = "Mostly Compliant"
            else:
                compliance_summary[framework] = "Non-compliant"
        
        return compliance_summary
