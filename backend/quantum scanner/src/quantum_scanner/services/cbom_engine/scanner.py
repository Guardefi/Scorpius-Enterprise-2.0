"""Main CBOM Scanner implementation with quantum vulnerability assessment."""

import asyncio
from pathlib import Path
from typing import List, Optional, Dict, Any
from uuid import UUID

from ...core.logging import get_logger
from ...core.exceptions import ScanError, CryptographicError
from ...core.cache import cached
from ...core.profiling import profile_function, performance_timer
from .models import (
    Asset,
    CBOMConfig,
    CBOMEntry,
    CBOMReport,
    CryptoComponent,
    QuantumVulnerabilityAssessment,
    QuantumVulnerabilityLevel,
)
from .parsers import (
    SourceCodeCryptoParser,
    BinaryCryptoAnalyzer,
    ContainerLayerScanner,
    TrafficCryptoInspector,
    X509CertificateAnalyzer,
)
from .classifiers import PQCComplianceClassifier, FIPS203205Validator

logger = get_logger(__name__)


class QuantumCBOMScanner:
    """Advanced CBOM generator with quantum vulnerability assessment."""
    
    def __init__(self, config: CBOMConfig):
        """Initialize the CBOM scanner with configuration."""
        self.config = config
        self.crypto_parsers = {
            'source_code': SourceCodeCryptoParser(),
            'binaries': BinaryCryptoAnalyzer(),
            'containers': ContainerLayerScanner(),
            'network_traffic': TrafficCryptoInspector(),
            'certificates': X509CertificateAnalyzer(),
        }
        self.pqc_classifier = PQCComplianceClassifier()
        self.fips_validator = FIPS203205Validator()
        
        # Performance optimizations
        self._enable_parallel_processing = getattr(config, 'parallel_processing', True)
        self._max_concurrent_scans = getattr(config, 'max_concurrent_scans', 4)
        
    @profile_function(name="cbom.generate_comprehensive", track_memory=True)
    async def generate_comprehensive_cbom(self, target_assets: List[Asset]) -> CBOMReport:
        """Generate comprehensive CBOM with quantum vulnerability tagging."""
        async with performance_timer("cbom.total_generation_time"):
            logger.info("Starting comprehensive CBOM generation", 
                       asset_count=len(target_assets))
            
            try:
                if self._enable_parallel_processing and len(target_assets) > 1:
                    # Process assets in parallel
                    cbom_entries, scanned_assets = await self._process_assets_parallel(target_assets)
                else:
                    # Process assets sequentially
                    cbom_entries, scanned_assets = await self._process_assets_sequential(target_assets)
                
                # Generate summary statistics
                async with performance_timer("cbom.summary_generation"):
                    summary = self._generate_summary(cbom_entries)
                
                report = CBOMReport(
                    title=f"Quantum CBOM Report - {len(scanned_assets)} Assets",
                    description="Comprehensive cryptographic bill of materials with quantum vulnerability assessment",
                    scan_config=self.config,
                    scanned_assets=scanned_assets,
                    entries=cbom_entries,
                    summary=summary,
                )
                
                logger.info("CBOM generation completed", 
                           total_components=report.total_components,
                           vulnerable_components=report.quantum_vulnerable_count)
                
                return report
                
            except Exception as e:
                logger.error("CBOM generation failed", error=str(e))
                raise ScanError(f"Failed to generate CBOM: {str(e)}")
    
    async def _process_assets_parallel(self, assets: List[Asset]) -> tuple[List[CBOMEntry], List[Asset]]:
        """Process assets in parallel for better performance."""
        async with performance_timer("cbom.parallel_processing"):
            # Create semaphore to limit concurrent operations
            semaphore = asyncio.Semaphore(self._max_concurrent_scans)
            
            async def process_single_asset(asset: Asset) -> tuple[List[CBOMEntry], Asset]:
                async with semaphore:
                    return await self._process_single_asset(asset)
            
            # Process all assets concurrently
            tasks = [process_single_asset(asset) for asset in assets]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Collect results and handle exceptions
            cbom_entries = []
            scanned_assets = []
            
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Failed to process asset {assets[i].name}: {result}")
                    continue
                
                entries, asset = result
                cbom_entries.extend(entries)
                scanned_assets.append(asset)
            
            return cbom_entries, scanned_assets
    
    async def _process_assets_sequential(self, assets: List[Asset]) -> tuple[List[CBOMEntry], List[Asset]]:
        """Process assets sequentially."""
        async with performance_timer("cbom.sequential_processing"):
            cbom_entries = []
            scanned_assets = []
            
            for asset in assets:
                try:
                    entries, scanned_asset = await self._process_single_asset(asset)
                    cbom_entries.extend(entries)
                    scanned_assets.append(scanned_asset)
                except Exception as e:
                    logger.error(f"Failed to process asset {asset.name}: {e}")
                    continue
            
            return cbom_entries, scanned_assets
    
    async def _process_single_asset(self, asset: Asset) -> tuple[List[CBOMEntry], Asset]:
        """Process a single asset and return CBOM entries."""
        logger.info("Scanning asset", asset_name=asset.name, asset_type=asset.type)
        
        # Multi-layer cryptographic discovery
        crypto_inventory = await self.discover_crypto_assets(asset)
        
        # Process crypto components in parallel if there are many
        if len(crypto_inventory) > 3:
            cbom_entries = await self._process_crypto_components_parallel(crypto_inventory, asset)
        else:
            cbom_entries = await self._process_crypto_components_sequential(crypto_inventory, asset)
        
        return cbom_entries, asset
    
    async def _process_crypto_components_parallel(self, crypto_inventory: List[CryptoComponent], asset: Asset) -> List[CBOMEntry]:
        """Process crypto components in parallel."""
        async def process_component(crypto_component: CryptoComponent) -> CBOMEntry:
            vulnerability_assessment = await self.assess_quantum_vulnerability(crypto_component)
            fips_compliant = await self.fips_validator.validate(crypto_component)
            
            return CBOMEntry(
                component=crypto_component,
                asset_id=asset.id,
                asset_location=asset.location,
                quantum_assessment=vulnerability_assessment,
                fips_compliant=fips_compliant,
            )
        
        # Process components concurrently
        tasks = [process_component(comp) for comp in crypto_inventory]
        return await asyncio.gather(*tasks)
    
    async def _process_crypto_components_sequential(self, crypto_inventory: List[CryptoComponent], asset: Asset) -> List[CBOMEntry]:
        """Process crypto components sequentially."""
        cbom_entries = []
        
        for crypto_component in crypto_inventory:
            vulnerability_assessment = await self.assess_quantum_vulnerability(crypto_component)
            fips_compliant = await self.fips_validator.validate(crypto_component)
            
            cbom_entry = CBOMEntry(
                component=crypto_component,
                asset_id=asset.id,
                asset_location=asset.location,
                quantum_assessment=vulnerability_assessment,
                fips_compliant=fips_compliant,
            )
            
            cbom_entries.append(cbom_entry)
        
        return cbom_entries
    
    @cached(ttl=3600, key_prefix="cbom.crypto_discovery")  # Cache for 1 hour
    @profile_function(name="cbom.discover_crypto_assets")
    async def discover_crypto_assets(self, asset: Asset) -> List[CryptoComponent]:
        """Discover cryptographic components in an asset."""
        crypto_components = []
        
        try:
            if asset.type == "source_code":
                components = await self.crypto_parsers['source_code'].parse(asset.location)
                crypto_components.extend(components)
            
            elif asset.type == "binary":
                components = await self.crypto_parsers['binaries'].analyze(asset.location)
                crypto_components.extend(components)
            
            elif asset.type == "container":
                components = await self.crypto_parsers['containers'].scan(asset.location)
                crypto_components.extend(components)
            
            elif asset.type == "network_endpoint" and self.config.include_network_traffic:
                components = await self.crypto_parsers['network_traffic'].inspect(asset.location)
                crypto_components.extend(components)
            
            elif asset.type == "certificate":
                components = await self.crypto_parsers['certificates'].analyze(asset.location)
                crypto_components.extend(components)
            
            logger.debug("Discovered crypto components", 
                        asset_name=asset.name, 
                        component_count=len(crypto_components))
            
            return crypto_components
            
        except Exception as e:
            logger.error("Crypto asset discovery failed", 
                        asset_name=asset.name, 
                        error=str(e))
            raise CryptographicError(f"Failed to discover crypto assets in {asset.name}: {str(e)}")
    
    @cached(ttl=7200, key_prefix="cbom.quantum_vulnerability")  # Cache for 2 hours
    @profile_function(name="cbom.assess_quantum_vulnerability")
    async def assess_quantum_vulnerability(self, crypto_component: CryptoComponent) -> QuantumVulnerabilityAssessment:
        """Assess quantum vulnerability of a cryptographic component."""
        try:
            # Use PQC classifier to determine quantum safety
            classification = await self.pqc_classifier.classify(crypto_component)
            
            # Determine vulnerability level based on algorithm
            vulnerability_level = self._determine_vulnerability_level(crypto_component.algorithm)
            is_vulnerable = vulnerability_level in [
                QuantumVulnerabilityLevel.VULNERABLE, 
                QuantumVulnerabilityLevel.DEPRECATED
            ]
            
            # Estimate break time for vulnerable algorithms
            estimated_break_time = None
            if is_vulnerable:
                estimated_break_time = self._estimate_break_time(crypto_component)
            
            # Determine migration priority
            migration_priority = self._calculate_migration_priority(
                vulnerability_level, crypto_component
            )
            
            # Get recommended replacement
            recommended_replacement = self._get_recommended_replacement(crypto_component)
            
            assessment = QuantumVulnerabilityAssessment(
                vulnerability_level=vulnerability_level,
                is_vulnerable=is_vulnerable,
                estimated_break_time=estimated_break_time,
                migration_priority=migration_priority,
                recommended_replacement=recommended_replacement,
                compliance_notes=classification.compliance_notes,
                assessment_confidence=classification.confidence,
            )
            
            return assessment
            
        except Exception as e:
            logger.error("Quantum vulnerability assessment failed", 
                        component_name=crypto_component.name, 
                        error=str(e))
            
            # Return conservative assessment on failure
            return QuantumVulnerabilityAssessment(
                vulnerability_level=QuantumVulnerabilityLevel.UNKNOWN,
                is_vulnerable=True,  # Conservative assumption
                migration_priority="High",
                assessment_confidence=0.0,
            )
    
    def _determine_vulnerability_level(self, algorithm: str) -> QuantumVulnerabilityLevel:
        """Determine quantum vulnerability level for an algorithm."""
        algorithm_lower = algorithm.lower()
        
        # Quantum-safe algorithms
        quantum_safe = [
            'kyber', 'dilithium', 'sphincs', 'falcon', 'rainbow', 'picnic',
            'ml-kem', 'ml-dsa', 'slh-dsa', 'aes-256', 'sha-3', 'shake'
        ]
        
        # Quantum-vulnerable algorithms
        quantum_vulnerable = [
            'rsa', 'ecdsa', 'ecdh', 'dh', 'dsa', 'elgamal'
        ]
        
        # Deprecated algorithms
        deprecated = [
            'md5', 'sha-1', 'des', '3des', 'rc4', 'md4'
        ]
        
        if any(safe_alg in algorithm_lower for safe_alg in quantum_safe):
            return QuantumVulnerabilityLevel.SAFE
        elif any(vuln_alg in algorithm_lower for vuln_alg in quantum_vulnerable):
            return QuantumVulnerabilityLevel.VULNERABLE
        elif any(dep_alg in algorithm_lower for dep_alg in deprecated):
            return QuantumVulnerabilityLevel.DEPRECATED
        else:
            return QuantumVulnerabilityLevel.UNKNOWN
    
    def _estimate_break_time(self, crypto_component: CryptoComponent) -> str:
        """Estimate time to break with quantum computer."""
        algorithm = crypto_component.algorithm.lower()
        key_size = crypto_component.key_size or 0
        
        if 'rsa' in algorithm:
            if key_size <= 1024:
                return "Minutes"
            elif key_size <= 2048:
                return "Hours"
            elif key_size <= 4096:
                return "Days"
            else:
                return "Weeks"
        elif 'ecc' in algorithm or 'ecdsa' in algorithm:
            if key_size <= 256:
                return "Hours"
            elif key_size <= 384:
                return "Days"
            else:
                return "Weeks"
        else:
            return "Variable"
    
    def _calculate_migration_priority(
        self, 
        vulnerability_level: QuantumVulnerabilityLevel, 
        crypto_component: CryptoComponent
    ) -> str:
        """Calculate migration priority based on vulnerability and usage."""
        if vulnerability_level == QuantumVulnerabilityLevel.DEPRECATED:
            return "Critical"
        elif vulnerability_level == QuantumVulnerabilityLevel.VULNERABLE:
            # Consider usage context for priority
            if crypto_component.usage_context and "signature" in crypto_component.usage_context.lower():
                return "High"
            else:
                return "Medium"
        elif vulnerability_level == QuantumVulnerabilityLevel.UNKNOWN:
            return "Medium"
        else:
            return "Low"
    
    def _get_recommended_replacement(self, crypto_component: CryptoComponent) -> Optional[str]:
        """Get recommended quantum-safe replacement for an algorithm."""
        algorithm = crypto_component.algorithm.lower()
        
        replacements = {
            'rsa': 'Dilithium3 (signatures) or Kyber768 (key exchange)',
            'ecdsa': 'Dilithium3',
            'ecdh': 'Kyber768',
            'aes-128': 'AES-256',
            'sha-256': 'SHA-3-256',
            'dh': 'Kyber768',
            'dsa': 'Dilithium3',
        }
        
        for alg, replacement in replacements.items():
            if alg in algorithm:
                return replacement
        
        return None
    
    def _generate_summary(self, cbom_entries: List[CBOMEntry]) -> Dict[str, Any]:
        """Generate summary statistics for the CBOM report."""
        total_components = len(cbom_entries)
        
        if total_components == 0:
            return {
                "total_components": 0,
                "quantum_vulnerable": 0,
                "fips_compliant": 0,
                "vulnerability_breakdown": {},
                "algorithm_distribution": {},
                "priority_breakdown": {},
            }
        
        quantum_vulnerable = sum(1 for entry in cbom_entries if entry.quantum_assessment.is_vulnerable)
        fips_compliant = sum(1 for entry in cbom_entries if entry.fips_compliant)
        
        # Vulnerability level breakdown
        vulnerability_breakdown = {}
        for entry in cbom_entries:
            level = entry.quantum_assessment.vulnerability_level
            vulnerability_breakdown[level] = vulnerability_breakdown.get(level, 0) + 1
        
        # Algorithm distribution
        algorithm_distribution = {}
        for entry in cbom_entries:
            alg = entry.component.algorithm
            algorithm_distribution[alg] = algorithm_distribution.get(alg, 0) + 1
        
        # Priority breakdown
        priority_breakdown = {}
        for entry in cbom_entries:
            priority = entry.quantum_assessment.migration_priority
            priority_breakdown[priority] = priority_breakdown.get(priority, 0) + 1
        
        return {
            "total_components": total_components,
            "quantum_vulnerable": quantum_vulnerable,
            "quantum_vulnerable_percentage": round((quantum_vulnerable / total_components) * 100, 2),
            "fips_compliant": fips_compliant,
            "fips_compliant_percentage": round((fips_compliant / total_components) * 100, 2),
            "vulnerability_breakdown": vulnerability_breakdown,
            "algorithm_distribution": algorithm_distribution,
            "priority_breakdown": priority_breakdown,
        }
