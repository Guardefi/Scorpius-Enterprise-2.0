#!/usr/bin/env python3
"""
Simplified test script for working API endpoints.
"""

import requests
import sys
from pathlib import Path

BASE_URL = "http://localhost:8001"

def test_root_endpoint():
    """Test the root endpoint."""
    print("🧪 Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Status: {response.status_code}")
        print(f"📄 Response: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_cbom_scan():
    """Test the CBOM scan endpoint."""
    print("\n🧪 Testing CBOM scan endpoint...")
    try:
        payload = {
            "assets": [
                {
                    "name": "test-asset",
                    "type": "source_code", 
                    "location": "./demo.py"  # Use a single file instead of directory
                }
            ],
            "config": {
                "deep_scan": True,
                "quantum_assessment": True,
                "fips_validation": True
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/cbom/scan",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"✅ Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"📊 Components found: {len(result.get('components', []))}")
            print(f"🔍 Vulnerability rate: {result.get('vulnerability_rate', 0):.1%}")
        else:
            print(f"❌ Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_quantum_agility():
    """Test the quantum agility endpoint."""
    print("\n🧪 Testing Quantum Agility endpoint...")
    try:
        payload = {
            "target_systems": ["test-system"],
            "algorithms_to_test": ["rsa-2048", "ml-kem-768"],
            "test_types": ["throughput", "latency"],
            "include_migration_tests": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/quantum-agility/scan",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"✅ Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"📊 Risk score: {result.get('risk_score', 0):.1f}")
            print(f"🚀 Readiness score: {result.get('readiness_score', 0):.1f}")
        else:
            print(f"❌ Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run working API tests."""
    print("🚀 Quantum Security Platform API Tests (Working Endpoints)")
    print("=" * 60)
    
    tests = [
        test_root_endpoint,
        test_cbom_scan,
        test_quantum_agility
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Test Results: {passed}/{total} passed")
    
    if passed == total:
        print("🎉 All tests passed!")
        return 0
    else:
        print("❌ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
