"""
Key Audit Scanner - HSM/KMS Quantum Readiness Assessment

Provides comprehensive assessment of key stores, HSMs, and KMS systems
for quantum readiness and post-quantum cryptographic migration planning.
"""

import asyncio
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from uuid import UUID

import structlog

from ...core.exceptions import ScanError
from .models import (
    KeyStore,
    KeyStoreType,
    KeyAuditRequest,
    KeyAuditResult,
    HSMCapability,
    KMSAssessment,
    VulnerabilityFinding,
    MigrationRecommendation,
    QuantumReadinessLevel,
    CryptographicCapability,
    QuantumReadinessReport
)

logger = structlog.get_logger(__name__)


class KeyAuditScanner:
    """Scanner for key store quantum readiness assessment."""
    
    def __init__(self):
        self.quantum_safe_algorithms = {
            # NIST PQC Standards
            "ML-KEM-512", "ML-KEM-768", "ML-KEM-1024",  # Kyber
            "ML-DSA-44", "ML-DSA-65", "ML-DSA-87",      # Dilithium
            "SLH-DSA-SHAKE-128s", "SLH-DSA-SHAKE-256s",  # SPHINCS+
            "FALCON-512", "FALCON-1024",
            # Symmetric algorithms
            "AES-256", "AES-192", "AES-128",
            "SHA3-256", "SHA3-384", "SHA3-512",
            "SHAKE128", "SHAKE256"
        }
        
        self.vulnerable_algorithms = {
            "RSA", "ECDSA", "ECDH", "DSA", "DH", "ECDHE"
        }
        
        self.deprecated_algorithms = {
            "MD5", "SHA-1", "DES", "3DES", "RC4", "RC2"
        }

    async def audit_key_store(self, request: KeyAuditRequest) -> KeyAuditResult:
        """
        Perform comprehensive quantum readiness audit of a key store.
        
        Args:
            request: Audit request parameters
            
        Returns:
            KeyAuditResult: Comprehensive audit results
            
        Raises:
            ScanError: If audit fails
        """
        start_time = time.time()
        
        try:
            logger.info(
                "Starting key store audit",
                target=request.target,
                store_type=request.store_type,
                scan_depth=request.scan_depth
            )
            
            # Discover key store details
            key_store = await self._discover_key_store(request)
            
            # Assess cryptographic capabilities
            capabilities = await self._assess_capabilities(key_store, request)
            key_store.capabilities = capabilities
            
            # Perform vulnerability assessment
            vulnerabilities = await self._assess_vulnerabilities(key_store)
            
            # Generate migration recommendations
            recommendations = await self._generate_migration_recommendations(
                key_store, vulnerabilities
            )
            
            # Assess compliance status
            compliance_status = await self._assess_compliance(
                key_store, request.check_compliance
            )
            
            # Performance benchmarking (if requested)
            performance_metrics = {}
            if request.include_performance:
                performance_metrics = await self._benchmark_performance(key_store)
            
            # Determine overall quantum readiness
            readiness_level = self._calculate_readiness_level(
                key_store, vulnerabilities, recommendations
            )
            
            # Store-specific assessments
            hsm_capabilities = None
            kms_assessment = None
            
            if request.store_type in [KeyStoreType.HSM, KeyStoreType.CLOUD_HSM]:
                hsm_capabilities = await self._assess_hsm_capabilities(key_store)
            elif request.store_type == KeyStoreType.KMS:
                kms_assessment = await self._assess_kms_features(key_store)
            
            scan_duration = time.time() - start_time
            
            result = KeyAuditResult(
                request_id=UUID(str(request.target)[:36].ljust(36, '0')[:36]),
                key_store=key_store,
                quantum_readiness=readiness_level,
                hsm_capabilities=hsm_capabilities,
                kms_assessment=kms_assessment,
                vulnerabilities=vulnerabilities,
                migration_recommendations=recommendations,
                compliance_status=compliance_status,
                performance_metrics=performance_metrics,
                scan_duration=scan_duration
            )
            
            logger.info(
                "Key store audit completed",
                target=request.target,
                readiness_level=readiness_level,
                vulnerabilities_found=len(vulnerabilities),
                scan_duration=scan_duration
            )
            
            return result
            
        except Exception as e:
            logger.error(
                "Key store audit failed",
                target=request.target,
                error=str(e)
            )
            raise ScanError(f"Failed to audit key store {request.target}: {str(e)}")

    async def _discover_key_store(self, request: KeyAuditRequest) -> KeyStore:
        """Discover key store details and metadata."""
        # Simulate key store discovery
        await asyncio.sleep(0.1)
        
        store_info = self._get_store_info(request.target, request.store_type)
        
        return KeyStore(
            name=request.target,
            type=request.store_type,
            vendor=store_info.get("vendor", "Unknown"),
            model=store_info.get("model", "Unknown"),
            firmware_version=store_info.get("firmware_version"),
            location=store_info.get("location"),
            metadata=request.connection_params
        )

    def _get_store_info(self, target: str, store_type: KeyStoreType) -> Dict[str, Any]:
        """Get simulated store information based on target and type."""
        store_database = {
            "hsm-prod-01": {
                "vendor": "Thales",
                "model": "Luna SA 7000",
                "firmware_version": "7.7.0",
                "location": "Datacenter-A"
            },
            "aws-kms": {
                "vendor": "Amazon",
                "model": "AWS KMS",
                "firmware_version": "2023.1",
                "location": "us-east-1"
            },
            "azure-keyvault": {
                "vendor": "Microsoft",
                "model": "Azure Key Vault",
                "firmware_version": "2023.2",
                "location": "East US"
            }
        }
        
        return store_database.get(target, {
            "vendor": "Unknown",
            "model": f"{store_type.value.upper()} Device",
            "firmware_version": "Unknown"
        })

    async def _assess_capabilities(
        self, 
        key_store: KeyStore, 
        request: KeyAuditRequest
    ) -> List[CryptographicCapability]:
        """Assess cryptographic capabilities of the key store."""
        await asyncio.sleep(0.2)
        
        capabilities = []
        
        # Simulated capability discovery based on store type and vendor
        if key_store.type in [KeyStoreType.HSM, KeyStoreType.CLOUD_HSM]:
            capabilities.extend(self._get_hsm_capabilities(key_store))
        elif key_store.type == KeyStoreType.KMS:
            capabilities.extend(self._get_kms_capabilities(key_store))
        else:
            capabilities.extend(self._get_software_capabilities())
        
        return capabilities

    def _get_hsm_capabilities(self, key_store: KeyStore) -> List[CryptographicCapability]:
        """Get HSM-specific cryptographic capabilities."""
        capabilities = [
            CryptographicCapability(
                algorithm="RSA",
                key_sizes=[2048, 3072, 4096],
                quantum_safe=False,
                fips_approved=True,
                performance_rating="High"
            ),
            CryptographicCapability(
                algorithm="ECDSA",
                key_sizes=[256, 384, 521],
                quantum_safe=False,
                fips_approved=True,
                performance_rating="Very High"
            ),
            CryptographicCapability(
                algorithm="AES",
                key_sizes=[128, 192, 256],
                quantum_safe=True,
                fips_approved=True,
                performance_rating="Very High"
            )
        ]
        
        # Add PQC capabilities for newer HSMs
        if "Luna SA 7000" in key_store.model or "2023" in (key_store.firmware_version or ""):
            capabilities.extend([
                CryptographicCapability(
                    algorithm="ML-KEM-768",
                    key_sizes=[768],
                    quantum_safe=True,
                    fips_approved=True,
                    performance_rating="Medium"
                ),
                CryptographicCapability(
                    algorithm="ML-DSA-65",
                    key_sizes=[65],
                    quantum_safe=True,
                    fips_approved=True,
                    performance_rating="Medium"
                )
            ])
        
        return capabilities

    def _get_kms_capabilities(self, key_store: KeyStore) -> List[CryptographicCapability]:
        """Get KMS-specific cryptographic capabilities."""
        capabilities = [
            CryptographicCapability(
                algorithm="AES",
                key_sizes=[128, 256],
                quantum_safe=True,
                fips_approved=True,
                performance_rating="High"
            ),
            CryptographicCapability(
                algorithm="RSA",
                key_sizes=[2048, 3072, 4096],
                quantum_safe=False,
                fips_approved=True,
                performance_rating="Medium"
            )
        ]
        
        # Cloud KMS services increasingly support PQC
        if "AWS" in key_store.vendor or "Azure" in key_store.vendor:
            capabilities.append(
                CryptographicCapability(
                    algorithm="ML-KEM-768",
                    key_sizes=[768],
                    quantum_safe=True,
                    fips_approved=True,
                    performance_rating="Medium"
                )
            )
        
        return capabilities

    def _get_software_capabilities(self) -> List[CryptographicCapability]:
        """Get software-based cryptographic capabilities."""
        return [
            CryptographicCapability(
                algorithm="AES",
                key_sizes=[128, 192, 256],
                quantum_safe=True,
                fips_approved=False,
                performance_rating="High"
            ),
            CryptographicCapability(
                algorithm="RSA",
                key_sizes=[2048, 3072, 4096],
                quantum_safe=False,
                fips_approved=False,
                performance_rating="Medium"
            )
        ]

    async def _assess_vulnerabilities(
        self, 
        key_store: KeyStore
    ) -> List[VulnerabilityFinding]:
        """Assess quantum vulnerabilities in the key store."""
        await asyncio.sleep(0.1)
        
        vulnerabilities = []
        
        for capability in key_store.capabilities:
            if capability.algorithm in self.vulnerable_algorithms:
                severity = "critical" if capability.algorithm == "RSA" else "high"
                vulnerabilities.append(
                    VulnerabilityFinding(
                        severity=severity,
                        title=f"Quantum-vulnerable algorithm: {capability.algorithm}",
                        description=f"The {capability.algorithm} algorithm is vulnerable to quantum attacks using Shor's algorithm",
                        algorithm=capability.algorithm,
                        quantum_impact="Complete compromise of cryptographic security",
                        remediation=f"Migrate to post-quantum alternatives such as ML-KEM or ML-DSA"
                    )
                )
            elif capability.algorithm in self.deprecated_algorithms:
                vulnerabilities.append(
                    VulnerabilityFinding(
                        severity="medium",
                        title=f"Deprecated algorithm: {capability.algorithm}",
                        description=f"The {capability.algorithm} algorithm is cryptographically weak",
                        algorithm=capability.algorithm,
                        quantum_impact="Already vulnerable to classical attacks",
                        remediation="Replace with modern cryptographic algorithms"
                    )
                )
        
        return vulnerabilities

    async def _generate_migration_recommendations(
        self,
        key_store: KeyStore,
        vulnerabilities: List[VulnerabilityFinding]
    ) -> List[MigrationRecommendation]:
        """Generate post-quantum migration recommendations."""
        await asyncio.sleep(0.1)
        
        recommendations = []
        migration_map = {
            "RSA": "ML-DSA-65",
            "ECDSA": "ML-DSA-65", 
            "ECDH": "ML-KEM-768",
            "DH": "ML-KEM-768"
        }
        
        for vulnerability in vulnerabilities:
            if vulnerability.algorithm in migration_map:
                recommendations.append(
                    MigrationRecommendation(
                        current_algorithm=vulnerability.algorithm,
                        recommended_algorithm=migration_map[vulnerability.algorithm],
                        migration_effort="Medium to High",
                        performance_impact="Moderate increase in key/signature sizes",
                        compliance_notes="Ensure FIPS 203-205 compliance for regulated environments",
                        timeline="6-12 months for production migration"
                    )
                )
        
        return recommendations

    async def _assess_compliance(
        self, 
        key_store: KeyStore, 
        frameworks: List[str]
    ) -> Dict[str, str]:
        """Assess compliance with security frameworks."""
        await asyncio.sleep(0.1)
        
        compliance_status = {}
        
        for framework in frameworks:
            if framework.upper() == "FIPS":
                fips_compliance = any(cap.fips_approved for cap in key_store.capabilities)
                compliance_status["FIPS"] = "Compliant" if fips_compliance else "Non-compliant"
            elif framework.upper() == "NIST":
                pqc_support = any(
                    cap.algorithm.startswith("ML-") for cap in key_store.capabilities
                )
                compliance_status["NIST PQC"] = "Ready" if pqc_support else "Not Ready"
            else:
                compliance_status[framework] = "Assessment Required"
        
        return compliance_status

    async def _benchmark_performance(self, key_store: KeyStore) -> Dict[str, Any]:
        """Benchmark cryptographic performance."""
        await asyncio.sleep(0.5)  # Simulate benchmarking
        
        # Simulated performance metrics
        return {
            "rsa_2048_sign_ops_per_sec": 2500,
            "rsa_2048_verify_ops_per_sec": 45000,
            "ecdsa_p256_sign_ops_per_sec": 8000,
            "ecdsa_p256_verify_ops_per_sec": 3500,
            "aes_256_encrypt_mbps": 1200,
            "ml_dsa_65_sign_ops_per_sec": 1800,
            "ml_dsa_65_verify_ops_per_sec": 2200,
            "ml_kem_768_keygen_ops_per_sec": 15000,
            "ml_kem_768_encaps_ops_per_sec": 12000,
            "ml_kem_768_decaps_ops_per_sec": 11000
        }

    def _calculate_readiness_level(
        self,
        key_store: KeyStore,
        vulnerabilities: List[VulnerabilityFinding],
        recommendations: List[MigrationRecommendation]
    ) -> QuantumReadinessLevel:
        """Calculate overall quantum readiness level."""
        critical_vulns = [v for v in vulnerabilities if v.severity == "critical"]
        pqc_algorithms = [
            cap for cap in key_store.capabilities 
            if cap.quantum_safe and cap.algorithm in self.quantum_safe_algorithms
        ]
        
        if len(critical_vulns) == 0 and len(pqc_algorithms) >= 2:
            return QuantumReadinessLevel.READY
        elif len(pqc_algorithms) > 0:
            return QuantumReadinessLevel.PARTIALLY_READY
        elif len(critical_vulns) > 0:
            return QuantumReadinessLevel.NOT_READY
        else:
            return QuantumReadinessLevel.UNKNOWN

    async def _assess_hsm_capabilities(self, key_store: KeyStore) -> HSMCapability:
        """Assess HSM-specific capabilities."""
        await asyncio.sleep(0.1)
        
        pqc_algorithms = [
            cap.algorithm for cap in key_store.capabilities 
            if cap.quantum_safe and cap.algorithm.startswith(("ML-", "SLH-", "FALCON"))
        ]
        
        return HSMCapability(
            fips_level="Level 3" if "Luna" in key_store.model else "Level 2",
            common_criteria="EAL4+" if "Luna" in key_store.model else None,
            pqc_support=len(pqc_algorithms) > 0,
            key_generation=["RSA", "ECDSA", "AES"] + pqc_algorithms,
            digital_signatures=["RSA", "ECDSA"] + [alg for alg in pqc_algorithms if "DSA" in alg],
            key_exchange=["ECDH"] + [alg for alg in pqc_algorithms if "KEM" in alg],
            hash_functions=["SHA-256", "SHA-384", "SHA-512", "SHA3-256"],
            random_number_generation=True
        )

    async def _assess_kms_features(self, key_store: KeyStore) -> KMSAssessment:
        """Assess KMS-specific features and capabilities."""
        await asyncio.sleep(0.1)
        
        return KMSAssessment(
            encryption_at_rest=True,
            encryption_in_transit=True,
            key_rotation=True,
            access_controls=["IAM", "RBAC", "Attribute-based"],
            audit_logging=True,
            multi_tenancy="AWS" in key_store.vendor or "Azure" in key_store.vendor,
            api_security=["TLS 1.3", "OAuth 2.0", "API Keys", "Mutual TLS"]
        )

    async def generate_readiness_report(
        self, 
        audit_results: List[KeyAuditResult],
        organization: str
    ) -> QuantumReadinessReport:
        """Generate comprehensive quantum readiness report."""
        logger.info(
            "Generating quantum readiness report",
            organization=organization,
            key_stores_count=len(audit_results)
        )
        
        # Calculate readiness breakdown
        readiness_breakdown = {}
        for level in QuantumReadinessLevel:
            readiness_breakdown[level] = sum(
                1 for result in audit_results 
                if result.quantum_readiness == level
            )
        
        # Determine overall readiness
        if readiness_breakdown.get(QuantumReadinessLevel.READY, 0) == len(audit_results):
            overall_readiness = QuantumReadinessLevel.READY
        elif readiness_breakdown.get(QuantumReadinessLevel.NOT_READY, 0) > 0:
            overall_readiness = QuantumReadinessLevel.NOT_READY
        else:
            overall_readiness = QuantumReadinessLevel.PARTIALLY_READY
        
        # Collect critical findings
        critical_findings = []
        for result in audit_results:
            critical_findings.extend([
                v for v in result.vulnerabilities 
                if v.severity == "critical"
            ])
        
        # Generate migration priorities
        migration_priority = []
        for result in audit_results:
            for rec in result.migration_recommendations:
                if rec.current_algorithm == "RSA":
                    migration_priority.append(f"{result.key_store.name}: {rec.current_algorithm} → {rec.recommended_algorithm}")
        
        # Compliance gap analysis
        compliance_gaps = {}
        for result in audit_results:
            for framework, status in result.compliance_status.items():
                if status != "Compliant":
                    if framework not in compliance_gaps:
                        compliance_gaps[framework] = []
                    compliance_gaps[framework].append(result.key_store.name)
        
        # Executive summary
        ready_count = readiness_breakdown.get(QuantumReadinessLevel.READY, 0)
        total_count = len(audit_results)
        
        executive_summary = (
            f"Quantum readiness assessment for {organization} reveals "
            f"{ready_count}/{total_count} key stores are quantum-ready. "
            f"{len(critical_findings)} critical vulnerabilities identified requiring immediate attention. "
            f"Recommend prioritizing migration of RSA and ECDSA implementations to NIST-approved PQC algorithms."
        )
        
        return QuantumReadinessReport(
            organization=organization,
            key_stores_audited=len(audit_results),
            overall_readiness=overall_readiness,
            readiness_breakdown=readiness_breakdown,
            critical_findings=critical_findings[:10],  # Top 10 critical findings
            migration_priority=migration_priority[:5],  # Top 5 migration priorities
            compliance_gaps=compliance_gaps,
            executive_summary=executive_summary,
            technical_recommendations=[
                "Prioritize migration of RSA and ECDSA to ML-DSA",
                "Implement hybrid cryptography during transition period",
                "Update key management policies for PQC algorithms",
                "Conduct regular quantum readiness assessments",
                "Establish quantum-safe cryptographic standards"
            ]
        )
