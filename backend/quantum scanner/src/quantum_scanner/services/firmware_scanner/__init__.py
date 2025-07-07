"""
Firmware Scanner Service - IoT/Embedded Crypto Discovery

This service provides cryptographic discovery and assessment for IoT devices,
embedded systems, and firmware images to identify quantum vulnerabilities.
"""

from .models import (
    FirmwareTarget,
    FirmwareScanRequest,
    FirmwareScanResult,
    CryptoImplementation,
    VulnerabilityFinding,
    DeviceProfile,
    FirmwareAnalysisReport
)
from .scanner import FirmwareScanner
from .analyzers import (
    BinaryAnalyzer,
    ProtocolAnalyzer,
    CertificateAnalyzer
)
from .api import router

__all__ = [
    "FirmwareTarget",
    "FirmwareScanRequest",
    "FirmwareScanResult", 
    "CryptoImplementation",
    "VulnerabilityFinding",
    "DeviceProfile",
    "FirmwareAnalysisReport",
    "FirmwareScanner",
    "BinaryAnalyzer",
    "ProtocolAnalyzer", 
    "CertificateAnalyzer",
    "router"
]
