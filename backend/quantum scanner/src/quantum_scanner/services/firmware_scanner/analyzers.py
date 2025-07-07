"""
Firmware Scanner Analyzers

Specialized analyzers for different aspects of firmware and device scanning.
"""

import asyncio
import re
import struct
from typing import Dict, List, Optional, Any, Tuple
import hashlib

import structlog

from .models import (
    CryptoImplementation,
    CryptoImplementationType,
    VulnerabilityFinding,
    VulnerabilitySeverity,
    FirmwareTarget
)

logger = structlog.get_logger(__name__)


class BinaryAnalyzer:
    """Analyzes firmware binaries for cryptographic implementations."""
    
    def __init__(self):
        # Common cryptographic constants and patterns
        self.crypto_patterns = {
            # RSA
            b'\x30\x82': 'RSA_DER_SEQUENCE',
            b'\x02\x01\x00': 'RSA_VERSION',
            # AES S-boxes
            b'\x63\x7c\x77\x7b\xf2\x6b\x6f\xc5': 'AES_SBOX',
            # Common crypto strings
            b'OpenSSL': 'OPENSSL_LIBRARY',
            b'mbedTLS': 'MBEDTLS_LIBRARY',
            b'WolfSSL': 'WOLFSSL_LIBRARY',
            # Certificates
            b'\x30\x82.*\x30\x82': 'X509_CERTIFICATE',
        }
        
        # Algorithm signatures
        self.algorithm_signatures = {
            'AES': [
                b'\x63\x7c\x77\x7b\xf2\x6b\x6f\xc5',  # AES S-box
                b'AES',
                b'aes'
            ],
            'RSA': [
                b'RSA',
                b'rsa', 
                b'\x30\x82',  # DER encoding
            ],
            'ECDSA': [
                b'ECDSA',
                b'ecdsa',
                b'secp256r1',
                b'prime256v1'
            ],
            'SHA': [
                b'SHA',
                b'sha',
                b'\x67\x45\x23\x01',  # SHA-1 initial values
            ],
            'MD5': [
                b'MD5',
                b'md5',
                b'\x01\x23\x45\x67',  # MD5 initial values
            ]
        }

    async def analyze_binary(self, firmware_path: str, target: FirmwareTarget) -> Tuple[List[CryptoImplementation], List[VulnerabilityFinding]]:
        """
        Analyze firmware binary for cryptographic implementations.
        
        Args:
            firmware_path: Path to firmware binary
            target: Target device information
            
        Returns:
            Tuple of (crypto implementations, vulnerabilities)
        """
        logger.info("Starting binary analysis", firmware_path=firmware_path)
        
        try:
            with open(firmware_path, 'rb') as f:
                binary_data = f.read()
        except FileNotFoundError:
            # Simulate binary analysis for demo
            binary_data = b"DEMO_FIRMWARE_DATA" * 1000
        
        await asyncio.sleep(0.2)  # Simulate analysis time
        
        implementations = []
        vulnerabilities = []
        
        # Detect crypto libraries
        libraries = self._detect_crypto_libraries(binary_data)
        for lib_name, version in libraries:
            implementations.append(
                CryptoImplementation(
                    algorithm="LIBRARY_DETECTION",
                    implementation_type=CryptoImplementationType.LIBRARY,
                    library_name=lib_name,
                    library_version=version,
                    location=f"Binary offset: 0x{hash(lib_name) % 0xFFFF:04x}",
                    usage_context="Cryptographic library",
                    quantum_vulnerable=lib_name.lower() in ['openssl', 'mbedtls'] and version < "3.0",
                    deprecated=False
                )
            )
        
        # Detect algorithm implementations
        algorithms = self._detect_algorithms(binary_data)
        for algo_name, contexts in algorithms.items():
            for context in contexts:
                is_vulnerable = algo_name in ['RSA', 'ECDSA', 'DH']
                is_deprecated = algo_name in ['MD5', 'SHA1', 'DES']
                
                implementations.append(
                    CryptoImplementation(
                        algorithm=algo_name,
                        implementation_type=CryptoImplementationType.CUSTOM if 'custom' in context else CryptoImplementationType.LIBRARY,
                        location=context,
                        usage_context=f"{algo_name} implementation",
                        quantum_vulnerable=is_vulnerable,
                        deprecated=is_deprecated,
                        custom_implementation='custom' in context.lower()
                    )
                )
                
                # Generate vulnerabilities for problematic algorithms
                if is_vulnerable:
                    vulnerabilities.append(
                        VulnerabilityFinding(
                            title=f"Quantum-vulnerable algorithm: {algo_name}",
                            description=f"The {algo_name} algorithm is vulnerable to quantum attacks",
                            severity=VulnerabilitySeverity.CRITICAL if algo_name == 'RSA' else VulnerabilitySeverity.HIGH,
                            crypto_related=True,
                            quantum_impact="Complete cryptographic compromise possible with quantum computers",
                            affected_component=context,
                            remediation=f"Replace {algo_name} with post-quantum alternatives"
                        )
                    )
                elif is_deprecated:
                    vulnerabilities.append(
                        VulnerabilityFinding(
                            title=f"Deprecated algorithm: {algo_name}",
                            description=f"The {algo_name} algorithm is cryptographically weak",
                            severity=VulnerabilitySeverity.MEDIUM,
                            crypto_related=True,
                            quantum_impact="Already vulnerable to classical attacks",
                            affected_component=context,
                            remediation=f"Replace {algo_name} with modern secure algorithms"
                        )
                    )
        
        logger.info(
            "Binary analysis completed",
            implementations_found=len(implementations),
            vulnerabilities_found=len(vulnerabilities)
        )
        
        return implementations, vulnerabilities

    def _detect_crypto_libraries(self, binary_data: bytes) -> List[Tuple[str, str]]:
        """Detect cryptographic libraries in binary."""
        libraries = []
        
        # Check for OpenSSL
        if b'OpenSSL' in binary_data:
            # Try to extract version
            version_match = re.search(rb'OpenSSL\s+(\d+\.\d+\.\d+)', binary_data)
            version = version_match.group(1).decode() if version_match else "unknown"
            libraries.append(("OpenSSL", version))
        
        # Check for mbedTLS
        if b'mbedTLS' in binary_data or b'mbed TLS' in binary_data:
            version_match = re.search(rb'mbed.*?(\d+\.\d+\.\d+)', binary_data)
            version = version_match.group(1).decode() if version_match else "unknown"
            libraries.append(("mbedTLS", version))
        
        # Check for WolfSSL
        if b'wolfSSL' in binary_data or b'WolfSSL' in binary_data:
            libraries.append(("WolfSSL", "unknown"))
        
        # Check for BoringSSL
        if b'BoringSSL' in binary_data:
            libraries.append(("BoringSSL", "unknown"))
        
        return libraries

    def _detect_algorithms(self, binary_data: bytes) -> Dict[str, List[str]]:
        """Detect cryptographic algorithm implementations."""
        algorithms = {}
        
        for algo_name, signatures in self.algorithm_signatures.items():
            contexts = []
            for signature in signatures:
                matches = [m.start() for m in re.finditer(re.escape(signature), binary_data)]
                for match_offset in matches:
                    context = f"Binary offset: 0x{match_offset:08x}"
                    contexts.append(context)
            
            if contexts:
                algorithms[algo_name] = contexts[:3]  # Limit to first 3 matches
        
        return algorithms


class ProtocolAnalyzer:
    """Analyzes network protocols for cryptographic usage."""
    
    def __init__(self):
        self.protocol_ports = {
            443: 'HTTPS/TLS',
            22: 'SSH',
            990: 'FTPS',
            993: 'IMAPS',
            995: 'POP3S',
            636: 'LDAPS',
            8443: 'HTTPS_ALT'
        }

    async def analyze_protocols(self, target: FirmwareTarget) -> Tuple[List[CryptoImplementation], List[VulnerabilityFinding]]:
        """
        Analyze network protocols for cryptographic usage.
        
        Args:
            target: Target device information
            
        Returns:
            Tuple of (crypto implementations, vulnerabilities)
        """
        logger.info("Starting protocol analysis", target=target.name)
        
        await asyncio.sleep(0.3)  # Simulate network scanning
        
        implementations = []
        vulnerabilities = []
        
        if not target.ip_address:
            logger.warning("No IP address provided for protocol analysis")
            return implementations, vulnerabilities
        
        # Simulate port scanning and protocol detection
        detected_protocols = self._simulate_protocol_detection(target)
        
        for port, protocol_info in detected_protocols.items():
            protocol_name = protocol_info['name']
            tls_version = protocol_info.get('tls_version')
            cipher_suite = protocol_info.get('cipher_suite')
            
            # Create crypto implementation for protocol
            is_vulnerable = False
            if tls_version and tls_version in ['TLSv1.0', 'TLSv1.1', 'SSLv3']:
                is_vulnerable = True
            
            implementations.append(
                CryptoImplementation(
                    algorithm=f"{protocol_name}_{tls_version}" if tls_version else protocol_name,
                    implementation_type=CryptoImplementationType.PROTOCOL,
                    location=f"Port {port}",
                    usage_context=f"{protocol_name} service on port {port}",
                    quantum_vulnerable=cipher_suite and 'RSA' in cipher_suite,
                    deprecated=is_vulnerable
                )
            )
            
            # Check for protocol vulnerabilities
            if is_vulnerable:
                vulnerabilities.append(
                    VulnerabilityFinding(
                        title=f"Outdated TLS version: {tls_version}",
                        description=f"Service uses deprecated {tls_version} protocol",
                        severity=VulnerabilitySeverity.HIGH,
                        crypto_related=True,
                        quantum_impact="Vulnerable to downgrade attacks",
                        affected_component=f"Port {port} - {protocol_name}",
                        remediation="Upgrade to TLS 1.2 or higher"
                    )
                )
            
            if cipher_suite and any(weak in cipher_suite for weak in ['RC4', 'DES', 'MD5']):
                vulnerabilities.append(
                    VulnerabilityFinding(
                        title=f"Weak cipher suite: {cipher_suite}",
                        description="Service uses weak cryptographic cipher suite",
                        severity=VulnerabilitySeverity.MEDIUM,
                        crypto_related=True,
                        quantum_impact="Vulnerable to classical cryptanalytic attacks",
                        affected_component=f"Port {port} - {protocol_name}",
                        remediation="Configure strong cipher suites (AES-GCM, ChaCha20-Poly1305)"
                    )
                )
        
        logger.info(
            "Protocol analysis completed",
            protocols_found=len(detected_protocols),
            implementations_found=len(implementations)
        )
        
        return implementations, vulnerabilities

    def _simulate_protocol_detection(self, target: FirmwareTarget) -> Dict[int, Dict[str, Any]]:
        """Simulate protocol detection for demo purposes."""
        # Simulate common IoT device protocols
        protocols = {}
        
        if target.device_type.value in ['router', 'gateway']:
            protocols[443] = {
                'name': 'HTTPS',
                'tls_version': 'TLSv1.2',
                'cipher_suite': 'ECDHE-RSA-AES256-GCM-SHA384'
            }
            protocols[22] = {
                'name': 'SSH',
                'version': 'SSH-2.0'
            }
        elif target.device_type.value in ['camera', 'sensor']:
            protocols[443] = {
                'name': 'HTTPS',
                'tls_version': 'TLSv1.1',  # Older version for IoT
                'cipher_suite': 'AES128-SHA'
            }
        
        return protocols


class CertificateAnalyzer:
    """Analyzes SSL/TLS certificates for cryptographic weaknesses."""
    
    def __init__(self):
        self.weak_signature_algorithms = [
            'md5WithRSAEncryption',
            'sha1WithRSAEncryption'
        ]
        
        self.weak_key_sizes = {
            'RSA': 2048,  # Below 2048 is weak
            'DSA': 2048,
            'ECDSA': 256
        }

    async def analyze_certificates(self, target: FirmwareTarget) -> Tuple[List[CryptoImplementation], List[VulnerabilityFinding]]:
        """
        Analyze SSL/TLS certificates for cryptographic weaknesses.
        
        Args:
            target: Target device information
            
        Returns:
            Tuple of (crypto implementations, vulnerabilities)
        """
        logger.info("Starting certificate analysis", target=target.name)
        
        await asyncio.sleep(0.2)  # Simulate certificate retrieval
        
        implementations = []
        vulnerabilities = []
        
        # Simulate certificate analysis
        certificates = self._simulate_certificate_discovery(target)
        
        for cert_info in certificates:
            # Create implementation for certificate
            implementations.append(
                CryptoImplementation(
                    algorithm=cert_info['public_key_algorithm'],
                    implementation_type=CryptoImplementationType.CERTIFICATE,
                    key_size=cert_info.get('key_size'),
                    location=cert_info['location'],
                    usage_context="SSL/TLS certificate",
                    quantum_vulnerable=cert_info['public_key_algorithm'] in ['RSA', 'ECDSA'],
                    deprecated=cert_info['signature_algorithm'] in self.weak_signature_algorithms
                )
            )
            
            # Check for certificate vulnerabilities
            if cert_info['signature_algorithm'] in self.weak_signature_algorithms:
                vulnerabilities.append(
                    VulnerabilityFinding(
                        title=f"Weak certificate signature: {cert_info['signature_algorithm']}",
                        description="Certificate uses weak signature algorithm",
                        severity=VulnerabilitySeverity.MEDIUM,
                        crypto_related=True,
                        quantum_impact="Vulnerable to collision attacks",
                        affected_component=cert_info['location'],
                        remediation="Replace certificate with SHA-256 or higher signature algorithm"
                    )
                )
            
            # Check key size
            min_key_size = self.weak_key_sizes.get(cert_info['public_key_algorithm'])
            if min_key_size and cert_info.get('key_size', 0) < min_key_size:
                vulnerabilities.append(
                    VulnerabilityFinding(
                        title=f"Weak key size: {cert_info.get('key_size')} bits",
                        description=f"Certificate uses insufficient key size for {cert_info['public_key_algorithm']}",
                        severity=VulnerabilitySeverity.HIGH,
                        crypto_related=True,
                        quantum_impact="Vulnerable to key recovery attacks",
                        affected_component=cert_info['location'],
                        remediation=f"Use minimum {min_key_size}-bit keys for {cert_info['public_key_algorithm']}"
                    )
                )
            
            # Check for expired or expiring certificates
            if cert_info.get('expired', False):
                vulnerabilities.append(
                    VulnerabilityFinding(
                        title="Expired SSL certificate",
                        description="SSL certificate has expired",
                        severity=VulnerabilitySeverity.HIGH,
                        crypto_related=True,
                        quantum_impact="No encryption protection",
                        affected_component=cert_info['location'],
                        remediation="Renew SSL certificate immediately"
                    )
                )
        
        logger.info(
            "Certificate analysis completed",
            certificates_found=len(certificates),
            implementations_found=len(implementations)
        )
        
        return implementations, vulnerabilities

    def _simulate_certificate_discovery(self, target: FirmwareTarget) -> List[Dict[str, Any]]:
        """Simulate certificate discovery for demo purposes."""
        certificates = []
        
        # Simulate finding certificates based on device type
        if target.device_type.value in ['router', 'gateway', 'camera']:
            certificates.append({
                'location': 'HTTPS service (port 443)',
                'subject': f'CN={target.name}.local',
                'issuer': 'Self-signed',
                'public_key_algorithm': 'RSA',
                'key_size': 1024 if target.device_type.value == 'camera' else 2048,
                'signature_algorithm': 'sha1WithRSAEncryption' if target.device_type.value == 'camera' else 'sha256WithRSAEncryption',
                'expired': False
            })
        
        return certificates
