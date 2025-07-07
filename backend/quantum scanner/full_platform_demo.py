#!/usr/bin/env python3
"""
Full platform demonstration - all pillars integrated.
This script tests all major pillars and provides a complete overview.
"""

import asyncio
import sys
from pathlib import Path
import tempfile

# Add src to path
src_path = Path(__file__).parent / "src"
sys.path.insert(0, str(src_path))

from quantum_scanner.services.cbom_engine.scanner import QuantumCBOMScanner
from quantum_scanner.services.cbom_engine.models import Asset, AssetType, CBOMConfig
from quantum_scanner.services.cbom_engine.api import ScanRequest
from quantum_scanner.services.quantum_agility_tester.scanner import QuantumAgilityTester
from quantum_scanner.services.quantum_agility_tester.models import AgilityScanRequest, TestType
from quantum_scanner.services.threat_intelligence.scanner import ThreatIntelligenceScanner
from quantum_scanner.services.threat_intelligence.models import ThreatIntelligenceRequest


async def demo_integrated_scan():
    """Demonstrate integrated multi-pillar scanning."""
    print("\n" + "="*60)
    print("🔍 INTEGRATED MULTI-PILLAR SCAN")
    print("="*60)
    
    # Create sample crypto code
    sample_code = '''
import hashlib
import hmac
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from Crypto.Cipher import AES, RSA
import ssl

def encrypt_data(data, key):
    """Encrypt data using AES."""
    cipher = AES.new(key, AES.MODE_EAX)
    ciphertext, tag = cipher.encrypt_and_digest(data)
    return cipher.nonce + tag + ciphertext

def rsa_sign(data, private_key):
    """Sign data using RSA."""
    return private_key.sign(data)
'''

    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(sample_code)
        temp_file = f.name

    try:
        print("🔍 Step 1: CBOM Generation & Analysis")
        print("-" * 40)
        
        # CBOM Scanning
        cbom_scanner = QuantumCBOMScanner()
        assets = [Asset(
            name="Sample Application",
            type=AssetType.SOURCE_CODE,
            location=temp_file
        )]

        config = ScanConfiguration(
            deep_scan=True,
            quantum_assessment=True,
            fips_validation=True
        )

        cbom_request = CBOMScanRequest(assets=assets, config=config)
        cbom_result = await cbom_scanner.generate_cbom(cbom_request)
        
        print(f"✅ CBOM Analysis Complete:")
        print(f"   📊 Components Found: {len(cbom_result.components)}")
        print(f"   ⚠️  Quantum Vulnerable: {cbom_result.quantum_vulnerable_count}")
        print(f"   📈 Vulnerability Rate: {cbom_result.vulnerability_rate:.1%}")
        
        # Extract algorithms for further testing
        algorithms = list(set([comp.algorithm for comp in cbom_result.components]))
        print(f"   🔍 Algorithms Detected: {', '.join(algorithms)}")
        
        print("\n⚡ Step 2: Quantum Agility Assessment")
        print("-" * 40)
        
        # Quantum Agility Testing
        agility_tester = QuantumAgilityTester()
        agility_request = AgilityScanRequest(
            target_systems=["sample-application"],
            algorithms_to_test=algorithms[:3] if algorithms else ["rsa-2048"],
            test_types=[TestType.THROUGHPUT, TestType.LATENCY],
            include_migration_tests=True
        )
        
        agility_result = await agility_tester.scan_system_agility(agility_request)
        
        print(f"✅ Agility Assessment Complete:")
        print(f"   📊 Risk Score: {agility_result.risk_score:.1f}/10.0")
        print(f"   🚀 Readiness Score: {agility_result.readiness_score:.1f}/10.0")
        print(f"   ⚡ Performance Tests: {len(agility_result.performance_results)}")
        
        print("\n🛡️  Step 3: Threat Intelligence Analysis")
        print("-" * 40)
        
        # Threat Intelligence
        threat_scanner = ThreatIntelligenceScanner()
        threat_request = ThreatIntelligenceRequest(
            algorithms=algorithms[:3] if algorithms else ["rsa"],
            include_cve_data=True,
            include_research_updates=True,
            time_range_days=30
        )
        
        threat_result = await threat_scanner.scan_threats(threat_request)
        
        print(f"✅ Threat Analysis Complete:")
        print(f"   📊 Algorithms Analyzed: {len(threat_result.algorithms_analyzed)}")
        print(f"   🔍 Vulnerabilities: {len(threat_result.vulnerabilities)}")
        print(f"   ⚠️  Threat Level: {threat_result.threat_level.value}")
        
        print("\n📊 INTEGRATED ASSESSMENT SUMMARY")
        print("="*60)
        
        # Overall risk assessment
        overall_risk = (cbom_result.vulnerability_rate * 4 + 
                       (agility_result.risk_score / 10) * 3 +
                       (4 if threat_result.threat_level.value == "HIGH" else 
                        3 if threat_result.threat_level.value == "MEDIUM" else 2) * 3) / 10
        
        print(f"🎯 Overall Security Score: {(10-overall_risk):.1f}/10.0")
        print(f"📈 Quantum Readiness: {agility_result.readiness_score:.1f}/10.0")
        print(f"🔐 Cryptographic Assets: {len(cbom_result.components)}")
        print(f"⚠️  Critical Issues: {cbom_result.quantum_vulnerable_count}")
        
        # Recommendations
        print(f"\n💡 PRIORITY RECOMMENDATIONS:")
        recommendations = []
        
        if cbom_result.vulnerability_rate > 0.3:
            recommendations.append("🔴 HIGH: Immediate quantum-safe migration needed")
        elif cbom_result.vulnerability_rate > 0.1:
            recommendations.append("🟡 MEDIUM: Plan quantum-safe migration timeline")
        
        if agility_result.risk_score > 7:
            recommendations.append("🔴 HIGH: Performance optimization required")
        elif agility_result.risk_score > 4:
            recommendations.append("🟡 MEDIUM: Monitor performance degradation")
        
        if threat_result.threat_level.value == "HIGH":
            recommendations.append("🔴 HIGH: Active threat monitoring needed")
        
        if not recommendations:
            recommendations.append("✅ LOW: System shows good quantum readiness")
        
        for i, rec in enumerate(recommendations, 1):
            print(f"   {i}. {rec}")
        
    finally:
        Path(temp_file).unlink(missing_ok=True)


async def main():
    """Run integrated platform demonstration."""
    print("🚀 QUANTUM SECURITY PLATFORM")
    print("🔐 Enterprise-Grade Integrated Analysis")
    print("=" * 80)
    print("Demonstrating integrated workflow across multiple pillars:")
    print("• CBOM Engine → Quantum Agility → Threat Intelligence")
    print("=" * 80)
    
    try:
        await demo_integrated_scan()
        
        print("\n" + "="*80)
        print("🎉 INTEGRATED DEMONSTRATION COMPLETED")
        print("="*80)
        print("Platform Benefits:")
        print("• 🔄 Seamless multi-pillar workflow")
        print("• 📊 Correlated risk assessment")
        print("• 🎯 Prioritized recommendations")
        print("• ⚡ Real-time quantum readiness scoring")
        print("\n🌐 Full API Available: http://localhost:8001/docs")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
