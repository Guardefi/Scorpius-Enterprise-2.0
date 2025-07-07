#!/usr/bin/env python3
"""
Quantum Security Platform - Comprehensive Demo Script

This script demonstrates the capabilities of the enterprise-grade quantum-ready
vulnerability scanner with its 10-pillar microservices architecture.
"""

import asyncio
import json
import sys
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any

# Add the src directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from quantum_scanner.core.config import settings
from quantum_scanner.core.logging import get_logger
from quantum_scanner.services.cbom_engine.scanner import QuantumCBOMScanner
from quantum_scanner.services.cbom_engine.models import (
    Asset, AssetType, CBOMConfig, CryptoComponent, CryptoAlgorithmType
)

logger = get_logger(__name__)


class QuantumSecurityDemo:
    """Comprehensive demonstration of the Quantum Security Platform."""

    def __init__(self):
        """Initialize the demo."""
        self.demo_data_dir = Path("demo_data")
        self.demo_data_dir.mkdir(exist_ok=True)
        
        # Create demo files for scanning
        self._create_demo_files()

    def _create_demo_files(self):
        """Create sample files with cryptographic content for demonstration."""
        
        # Java application with various crypto usages
        java_code = '''
package com.example.crypto;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.Signature;

public class CryptoExample {
    
    // Quantum-vulnerable RSA encryption
    public KeyPair generateRSAKeyPair() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(2048); // RSA-2048 - quantum vulnerable
        return keyGen.generateKeyPair();
    }
    
    // Quantum-vulnerable ECDSA signing
    public byte[] signWithECDSA(byte[] data, PrivateKey privateKey) throws Exception {
        Signature signature = Signature.getInstance("SHA256withECDSA");
        signature.initSign(privateKey);
        signature.update(data);
        return signature.sign();
    }
    
    // Symmetric encryption (requires key size doubling for quantum safety)
    public SecretKey generateAESKey() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(256); // AES-256 provides 128-bit quantum security
        return keyGen.generateKey();
    }
    
    // Deprecated algorithm - security risk
    public MessageDigest getMD5Hash() throws Exception {
        return MessageDigest.getInstance("MD5"); // VULNERABLE - deprecated
    }
    
    // Weak key size
    public KeyPair generateWeakRSA() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
        keyGen.initialize(1024); // RSA-1024 - already breakable
        return keyGen.generateKeyPair();
    }
}
'''
        
        # Python application with crypto libraries
        python_code = '''
import hashlib
import os
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, ec, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

class QuantumVulnerableCode:
    """Example of quantum-vulnerable cryptographic implementations."""
    
    def __init__(self):
        self.backend = default_backend()
    
    def generate_rsa_key(self, key_size=2048):
        """Generate RSA key - QUANTUM VULNERABLE"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=key_size,  # RSA vulnerable to Shor's algorithm
            backend=self.backend
        )
        return private_key
    
    def generate_ecdsa_key(self):
        """Generate ECDSA key - QUANTUM VULNERABLE"""
        private_key = ec.generate_private_key(
            ec.SECP256R1(),  # ECDSA vulnerable to Shor's algorithm
            backend=self.backend
        )
        return private_key
    
    def aes_encrypt(self, data, key=None):
        """AES encryption - needs key size doubling for quantum safety"""
        if key is None:
            key = os.urandom(32)  # 256-bit key provides 128-bit quantum security
        
        iv = os.urandom(16)
        cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=self.backend)
        encryptor = cipher.encryptor()
        
        # Pad data to block size
        padding_length = 16 - (len(data) % 16)
        padded_data = data + bytes([padding_length] * padding_length)
        
        ciphertext = encryptor.update(padded_data) + encryptor.finalize()
        return iv + ciphertext
    
    def weak_hash_function(self, data):
        """Using deprecated hash function - SECURITY RISK"""
        return hashlib.md5(data).hexdigest()  # MD5 is cryptographically broken
    
    def sha1_hash(self, data):
        """SHA-1 hash - deprecated and vulnerable"""
        return hashlib.sha1(data).hexdigest()  # SHA-1 vulnerable to collision attacks

# Post-quantum cryptography alternatives (simulation)
class PostQuantumSafe:
    """Examples of post-quantum safe algorithms."""
    
    def ml_kem_key_generation(self):
        """ML-KEM (Module Lattice-based Key Encapsulation Mechanism)"""
        # This would use a PQC library like liboqs
        return "ML-KEM-768 key pair"  # NIST standard, quantum-safe
    
    def ml_dsa_signing(self, message):
        """ML-DSA (Module Lattice-based Digital Signature Algorithm)"""
        # This would use a PQC library like liboqs
        return f"ML-DSA signature for: {message}"  # NIST standard, quantum-safe
    
    def slh_dsa_signing(self, message):
        """SLH-DSA (Stateless Hash-based Digital Signature Algorithm)"""
        # This would use a PQC library like liboqs
        return f"SLH-DSA signature for: {message}"  # NIST standard, quantum-safe
'''

        # Configuration file with crypto settings
        config_content = '''
# Application Configuration with Cryptographic Settings

[security]
# RSA Configuration - QUANTUM VULNERABLE
rsa_key_size = 2048
rsa_algorithm = "RS256"

# ECDSA Configuration - QUANTUM VULNERABLE  
ecdsa_curve = "P-256"
ecdsa_algorithm = "ES256"

# Symmetric Encryption
aes_key_size = 256
encryption_mode = "AES-GCM"

# Hash Functions
primary_hash = "SHA-256"
fallback_hash = "MD5"  # DEPRECATED - security risk

# TLS Configuration
tls_min_version = "1.2"
tls_ciphers = [
    "ECDHE-RSA-AES256-GCM-SHA384",  # RSA component vulnerable
    "ECDHE-ECDSA-AES256-GCM-SHA384",  # ECDSA component vulnerable
    "AES256-GCM-SHA384"
]

# Certificate Configuration
cert_key_algorithm = "RSA"  # QUANTUM VULNERABLE
cert_key_size = 3072
cert_signature_algorithm = "SHA256withRSA"  # RSA vulnerable

[database]
# Database encryption
db_encryption_key_size = 256
db_encryption_algorithm = "AES-256-CBC"

[jwt]
# JWT signing - QUANTUM VULNERABLE
jwt_algorithm = "RS256"  # RSA-based
jwt_key_size = 2048

[api_security]
# API key derivation
key_derivation_function = "PBKDF2"
key_derivation_iterations = 100000
hash_function = "SHA-256"
'''

        # Save demo files
        (self.demo_data_dir / "CryptoExample.java").write_text(java_code)
        (self.demo_data_dir / "crypto_app.py").write_text(python_code)
        (self.demo_data_dir / "config.ini").write_text(config_content)
        
        logger.info("Created demo files", directory=str(self.demo_data_dir))

    async def run_cbom_demo(self):
        """Demonstrate CBOM Engine functionality."""
        print("\n🔮 QUANTUM SECURITY PLATFORM DEMO")
        print("=" * 50)
        print("🧬 Cryptographic Bill of Materials (CBOM) Engine")
        print("-" * 50)
        
        # Initialize CBOM scanner
        scanner = QuantumCBOMScanner()
        
        # Configure scan
        config = CBOMConfig(
            deep_scan=True,
            quantum_assessment=True,
            fips_validation=True,
            output_format="CycloneDX"
        )
        
        # Create assets for scanning
        assets = [
            Asset(
                name="Java Crypto Application",
                type=AssetType.SOURCE_CODE,
                location=str(self.demo_data_dir / "CryptoExample.java")
            ),
            Asset(
                name="Python Crypto Module",
                type=AssetType.SOURCE_CODE,
                location=str(self.demo_data_dir / "crypto_app.py")
            ),
            Asset(
                name="Application Configuration",
                type=AssetType.SOURCE_CODE,
                location=str(self.demo_data_dir / "config.ini")
            )
        ]
        
        print(f"📂 Scanning {len(assets)} assets...")
        
        # Perform CBOM scan
        report = await scanner.scan_assets(assets, config)
        
        print(f"✅ Scan completed! Generated report with ID: {report.id}")
        print(f"📊 Total cryptographic components found: {report.total_components}")
        print(f"⚠️  Quantum-vulnerable components: {report.quantum_vulnerable_count}")
        print(f"✓  FIPS-compliant components: {report.fips_compliant_count}")
        
        # Display vulnerability breakdown
        print("\n📈 Vulnerability Breakdown:")
        for level, count in report.vulnerability_breakdown.items():
            emoji = "🔴" if level == "vulnerable" else "🟡" if level == "unknown" else "🟢"
            print(f"  {emoji} {level.title()}: {count} components")
        
        # Display critical findings
        print("\n🚨 Critical Findings:")
        critical_components = [
            entry for entry in report.entries 
            if entry.quantum_assessment.migration_priority == "Critical"
        ]
        
        for component in critical_components[:5]:  # Show top 5
            print(f"  • {component.component.name} ({component.component.algorithm})")
            print(f"    📍 Location: {component.component.file_path or 'Configuration'}")
            print(f"    ⚡ Threat: {component.quantum_assessment.vulnerability_level.value}")
            if component.quantum_assessment.recommended_replacement:
                print(f"    💡 Replace with: {component.quantum_assessment.recommended_replacement}")
            print()
        
        # Save report
        report_file = self.demo_data_dir / "cbom_report.json"
        with open(report_file, 'w') as f:
            json.dump(report.dict(), f, indent=2, default=str)
        
        print(f"📄 Detailed report saved to: {report_file}")
        return report

    async def simulate_quantum_agility_test(self):
        """Simulate quantum agility testing."""
        print("\n🚀 Quantum Agility Tester (Simulation)")
        print("-" * 50)
        
        # Simulate performance testing results
        algorithms = ["RSA-2048", "ECDSA-P256", "AES-256", "ML-KEM-768", "ML-DSA-65"]
        
        print("📊 Performance Impact Analysis:")
        print(f"{'Algorithm':<15} {'Classical':<12} {'PQC Alternative':<18} {'Performance Impact':<20}")
        print("-" * 75)
        
        performance_data = [
            ("RSA-2048", "2000 ops/sec", "ML-DSA-65: 800 ops/sec", "-60% throughput"),
            ("ECDSA-P256", "1500 ops/sec", "ML-DSA-44: 1200 ops/sec", "-20% throughput"),
            ("ECDH-P256", "3000 ops/sec", "ML-KEM-768: 2400 ops/sec", "-20% throughput"),
            ("AES-128", "50k ops/sec", "AES-256: 45k ops/sec", "-10% throughput"),
        ]
        
        for classic, classic_perf, pqc_perf, impact in performance_data:
            print(f"{classic:<15} {classic_perf:<12} {pqc_perf:<18} {impact:<20}")
        
        print("\n💡 Migration Recommendations:")
        recommendations = [
            "1. Prioritize RSA and ECDSA migration due to quantum vulnerability",
            "2. Implement hybrid classical-PQC approach during transition",
            "3. Double AES key sizes (AES-256 for 128-bit quantum security)",
            "4. Plan for larger key sizes and signature overhead with PQC",
            "5. Test performance impact in production-like environments"
        ]
        
        for rec in recommendations:
            print(f"   {rec}")

    async def simulate_attack_scenarios(self):
        """Simulate quantum attack scenarios."""
        print("\n⚡ Quantum Attack Simulator")
        print("-" * 50)
        
        print("🎯 Threat Timeline Analysis:")
        
        threat_timeline = [
            {
                "algorithm": "RSA-1024",
                "current_status": "Already breakable",
                "quantum_threat": "2025-2030",
                "confidence": "High",
                "recommendation": "Migrate immediately"
            },
            {
                "algorithm": "RSA-2048", 
                "current_status": "Secure",
                "quantum_threat": "2030-2035",
                "confidence": "Medium-High",
                "recommendation": "Begin migration planning"
            },
            {
                "algorithm": "ECDSA-P256",
                "current_status": "Secure", 
                "quantum_threat": "2030-2035",
                "confidence": "Medium-High",
                "recommendation": "Begin migration planning"
            },
            {
                "algorithm": "AES-128",
                "current_status": "Secure",
                "quantum_threat": "2040-2050",
                "confidence": "Medium",
                "recommendation": "Upgrade to AES-256"
            }
        ]
        
        for threat in threat_timeline:
            status_emoji = "🔴" if "immediately" in threat["recommendation"] else "🟡" if "Begin" in threat["recommendation"] else "🟢"
            print(f"{status_emoji} {threat['algorithm']}:")
            print(f"   Current: {threat['current_status']}")
            print(f"   Quantum threat: {threat['quantum_threat']}")
            print(f"   Confidence: {threat['confidence']}")
            print(f"   Action: {threat['recommendation']}")
            print()
        
        print("🔬 Quantum Computing Capability Projection:")
        print("   2024: ~100 logical qubits (current)")
        print("   2027: ~1,000 logical qubits (RSA-1024 vulnerable)")
        print("   2030: ~10,000 logical qubits (RSA-2048, ECDSA-P256 vulnerable)")
        print("   2035: ~100,000 logical qubits (Most current crypto vulnerable)")

    async def demonstrate_compliance_mapping(self):
        """Demonstrate compliance framework mapping."""
        print("\n📋 Compliance Mapper")
        print("-" * 50)
        
        frameworks = {
            "NIST Post-Quantum Cryptography": {
                "status": "Migration required",
                "requirements": [
                    "Implement NIST-approved PQC algorithms",
                    "Maintain crypto-agility for algorithm updates",
                    "Document quantum threat assessments"
                ],
                "compliance_score": "65%"
            },
            "FIPS 140-2/3": {
                "status": "Partially compliant",
                "requirements": [
                    "Use FIPS-validated cryptographic modules",
                    "Implement proper key management",
                    "Ensure algorithm compliance"
                ],
                "compliance_score": "78%"
            },
            "Common Criteria": {
                "status": "Review required",
                "requirements": [
                    "Security evaluation of crypto implementations",
                    "Vulnerability assessment documentation",
                    "Protection profiles for quantum threats"
                ],
                "compliance_score": "70%"
            }
        }
        
        for framework, details in frameworks.items():
            print(f"📊 {framework}:")
            print(f"   Status: {details['status']}")
            print(f"   Compliance: {details['compliance_score']}")
            print("   Requirements:")
            for req in details['requirements']:
                print(f"     • {req}")
            print()

    async def generate_executive_summary(self, cbom_report):
        """Generate executive summary."""
        print("\n📈 Executive Summary")
        print("=" * 50)
        
        # Calculate risk metrics
        total_components = cbom_report.total_components
        vulnerable_components = cbom_report.quantum_vulnerable_count
        risk_percentage = (vulnerable_components / total_components * 100) if total_components > 0 else 0
        
        print(f"🎯 QUANTUM READINESS ASSESSMENT")
        print(f"   Overall Risk Level: {'🔴 HIGH' if risk_percentage > 70 else '🟡 MEDIUM' if risk_percentage > 30 else '🟢 LOW'}")
        print(f"   Quantum Vulnerability: {vulnerable_components}/{total_components} components ({risk_percentage:.1f}%)")
        print(f"   FIPS Compliance: {cbom_report.fips_compliant_count}/{total_components} components")
        print()
        
        print("🚨 IMMEDIATE ACTIONS REQUIRED:")
        actions = [
            "1. Audit and replace RSA-1024 implementations immediately",
            "2. Begin migration planning for RSA-2048 and ECDSA systems", 
            "3. Implement crypto-agility framework for future transitions",
            "4. Establish quantum threat monitoring and intelligence",
            "5. Train development teams on post-quantum cryptography"
        ]
        
        for action in actions:
            print(f"   {action}")
        
        print("\n💰 BUSINESS IMPACT:")
        print("   • High-priority systems at risk of data exposure")
        print("   • Potential compliance violations with future regulations")
        print("   • Customer trust and reputation implications")
        print("   • Competitive disadvantage if not addressed proactively")
        
        print("\n⏰ RECOMMENDED TIMELINE:")
        timeline = [
            ("Q3 2025", "Complete RSA-1024 replacement"),
            ("Q4 2025", "Implement crypto-agility framework"),
            ("Q2 2026", "Begin RSA-2048/ECDSA migration"),
            ("Q4 2026", "Deploy post-quantum cryptography"),
            ("Q2 2027", "Complete quantum-safe transition")
        ]
        
        for quarter, milestone in timeline:
            print(f"   {quarter}: {milestone}")

    async def run_full_demo(self):
        """Run the complete demonstration."""
        try:
            print("🔮 QUANTUM SECURITY PLATFORM")
            print("Enterprise Quantum-Ready Vulnerability Scanner")
            print("=" * 60)
            print(f"Demo started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            # Run CBOM demonstration
            cbom_report = await self.run_cbom_demo()
            
            # Run other service demonstrations
            await self.simulate_quantum_agility_test()
            await self.simulate_attack_scenarios()
            await self.demonstrate_compliance_mapping()
            
            # Generate executive summary
            await self.generate_executive_summary(cbom_report)
            
            print("\n✅ DEMO COMPLETED SUCCESSFULLY")
            print("=" * 60)
            print("🔗 Next Steps:")
            print("   • Review detailed CBOM report")
            print("   • Implement recommended security measures")
            print("   • Schedule quantum readiness assessment")
            print("   • Contact quantum security experts for consultation")
            print()
            print("📚 Resources:")
            print("   • NIST Post-Quantum Cryptography: https://csrc.nist.gov/pqc")
            print("   • Quantum-Safe Security Working Group: https://qsswg.org")
            print("   • Open Quantum Safe: https://openquantumsafe.org")
            
        except Exception as e:
            logger.error("Demo failed", error=str(e))
            print(f"\n❌ Demo failed: {str(e)}")
            return False
        
        return True


async def main():
    """Main demo function."""
    demo = QuantumSecurityDemo()
    success = await demo.run_full_demo()
    return 0 if success else 1


if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(result)
