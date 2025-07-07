"""Test the CBOM Engine functionality."""

import pytest
from pathlib import Path

from quantum_scanner.services.cbom_engine.models import (
    Asset, AssetType, CBOMConfig, CryptoAlgorithmType
)
from quantum_scanner.services.cbom_engine.scanner import QuantumCBOMScanner
from quantum_scanner.services.cbom_engine.parsers import SourceCodeCryptoParser


class TestCBOMEngine:
    """Test cases for the CBOM Engine."""
    
    @pytest.mark.asyncio
    async def test_source_code_parser(self, sample_python_file):
        """Test parsing of Python source code for crypto components."""
        parser = SourceCodeCryptoParser()
        components = await parser.parse(str(sample_python_file))
        
        assert len(components) > 0
        
        # Check for expected crypto components
        algorithms = [comp.algorithm.lower() for comp in components]
        assert any('aes' in alg for alg in algorithms)
        assert any('sha256' in alg or 'hashlib' in alg for alg in algorithms)
    
    @pytest.mark.asyncio
    async def test_cbom_scanner_basic(self, sample_assets):
        """Test basic CBOM scanning functionality."""
        config = CBOMConfig(deep_scan=True, quantum_assessment=True)
        scanner = QuantumCBOMScanner(config)
        
        report = await scanner.generate_comprehensive_cbom(sample_assets)
        
        assert report is not None
        assert report.total_components >= 0
        assert len(report.scanned_assets) == len(sample_assets)
        assert report.summary is not None
    
    @pytest.mark.asyncio 
    async def test_quantum_vulnerability_assessment(self, sample_assets):
        """Test quantum vulnerability assessment."""
        config = CBOMConfig(quantum_assessment=True)
        scanner = QuantumCBOMScanner(config)
        
        report = await scanner.generate_comprehensive_cbom(sample_assets)
        
        # Check that quantum assessment was performed
        for entry in report.entries:
            assert entry.quantum_assessment is not None
            assert entry.quantum_assessment.vulnerability_level is not None
            assert isinstance(entry.quantum_assessment.is_vulnerable, bool)
    
    def test_cbom_config_defaults(self):
        """Test CBOM configuration defaults."""
        config = CBOMConfig()
        
        assert config.deep_scan is True
        assert config.quantum_assessment is True
        assert config.fips_validation is True
        assert config.output_format == "CycloneDX"
    
    def test_asset_creation(self):
        """Test asset creation and validation."""
        asset = Asset(
            name="Test Asset",
            type=AssetType.SOURCE_CODE,
            location="/path/to/asset"
        )
        
        assert asset.name == "Test Asset"
        assert asset.type == AssetType.SOURCE_CODE
        assert asset.location == "/path/to/asset"
        assert asset.id is not None
