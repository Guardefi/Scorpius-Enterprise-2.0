"""Demonstration script for the Quantum Security Platform."""

import asyncio
import json
from pathlib import Path
import tempfile

from src.quantum_scanner.services.cbom_engine.models import Asset, AssetType, CBOMConfig
from src.quantum_scanner.services.cbom_engine.scanner import QuantumCBOMScanner


async def demo_cbom_scan():
    """Demonstrate CBOM scanning functionality."""
    
    print("🔍 Quantum Security Platform - CBOM Engine Demo")
    print("=" * 50)
    
    # Create a sample file with cryptographic code
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        crypto_code = '''
import hashlib
import hmac
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import hashes
from Crypto.Cipher import AES
from Crypto.PublicKey import RSA

def encrypt_with_aes(data, key):
    """Encrypt data using AES-256."""
    cipher = AES.new(key, AES.MODE_GCM)
    ciphertext, tag = cipher.encrypt_and_digest(data)
    return cipher.nonce + tag + ciphertext

def hash_with_sha256(data):
    """Hash data using SHA-256."""
    return hashlib.sha256(data).hexdigest()

def hash_with_md5(data):
    """Hash data using MD5 (deprecated)."""
    return hashlib.md5(data).hexdigest()

def generate_rsa_key():
    """Generate RSA key pair."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    return private_key

def hmac_signature(key, message):
    """Create HMAC signature."""
    return hmac.new(key, message, hashlib.sha256).hexdigest()

# Example of quantum-vulnerable RSA usage
rsa_key = RSA.generate(1024)  # Weak key size

# Example of deprecated algorithm
old_hash = hashlib.md5(b"example").hexdigest()
'''
        f.write(crypto_code)
        sample_file = f.name
    
    try:
        # Create asset
        asset = Asset(
            name="Sample Crypto Code",
            type=AssetType.SOURCE_CODE,
            location=sample_file
        )
        
        print(f"📁 Created sample file: {Path(sample_file).name}")
        print(f"🎯 Asset type: {asset.type}")
        
        # Configure scanner
        config = CBOMConfig(
            deep_scan=True,
            quantum_assessment=True,
            fips_validation=True,
            output_format="JSON"
        )
        
        print("⚙️  Scanner configuration:")
        print(f"   Deep scan: {config.deep_scan}")
        print(f"   Quantum assessment: {config.quantum_assessment}")
        print(f"   FIPS validation: {config.fips_validation}")
        
        # Initialize scanner
        scanner = QuantumCBOMScanner(config)
        
        print("\n🚀 Starting CBOM scan...")
        
        # Perform scan
        report = await scanner.generate_comprehensive_cbom([asset])
        
        print("✅ Scan completed successfully!")
        print("\n📊 CBOM Report Summary:")
        print("-" * 30)
        print(f"🔍 Total Components: {report.total_components}")
        print(f"⚠️  Quantum Vulnerable: {report.quantum_vulnerable_count}")
        print(f"📈 Vulnerability Rate: {report.summary.get('quantum_vulnerable_percentage', 0):.1f}%")
        print(f"✅ FIPS Compliant: {report.fips_compliant_count}")
        print(f"📊 FIPS Compliance Rate: {report.summary.get('fips_compliant_percentage', 0):.1f}%")
        
        if report.vulnerability_breakdown:
            print("\n🎯 Vulnerability Breakdown:")
            for level, count in report.vulnerability_breakdown.items():
                print(f"   {level.title().replace('_', ' ')}: {count}")
        
        if report.entries:
            print("\n🔐 Discovered Components:")
            for i, entry in enumerate(report.entries[:5], 1):  # Show first 5
                component = entry.component
                assessment = entry.quantum_assessment
                
                status_icon = "⚠️" if assessment.is_vulnerable else "✅"
                fips_icon = "✅" if entry.fips_compliant else "❌"
                
                print(f"   {i}. {status_icon} {component.algorithm}")
                print(f"      Library: {component.library}")
                print(f"      Type: {component.algorithm_type}")
                print(f"      Quantum Safe: {'No' if assessment.is_vulnerable else 'Yes'}")
                print(f"      FIPS Compliant: {fips_icon}")
                print(f"      Migration Priority: {assessment.migration_priority}")
                if assessment.recommended_replacement:
                    print(f"      Recommended: {assessment.recommended_replacement}")
                print()
        
        print("🎉 Demo completed successfully!")
        
        # Save report to file
        output_file = Path("demo_cbom_report.json")
        with open(output_file, 'w') as f:
            json.dump(report.model_dump(), f, indent=2, default=str)
        
        print(f"💾 Full report saved to: {output_file}")
        
    finally:
        # Clean up
        Path(sample_file).unlink()


if __name__ == "__main__":
    asyncio.run(demo_cbom_scan())
