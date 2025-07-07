#!/usr/bin/env python3
"""
Test script for the Quantum Security Platform API endpoints.
"""

import requests
import json
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
                    "location": str(Path(__file__).parent)
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

def test_attack_simulation():
    """Test the attack simulation endpoint."""
    print("\n🧪 Testing Attack Simulation endpoint...")
    try:
        payload = {
            "target_algorithms": ["rsa-2048", "ecdsa-p256"],
            "attack_types": ["shors_algorithm", "grovers_algorithm"],
            "target_assets": ["test-server"],
            "simulation_depth": "basic"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/attack-simulator/simulate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        print(f"✅ Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"📊 Risk score: {result.get('overall_risk_score', 0):.1f}")
            print(f"🎯 Scenarios: {len(result.get('scenarios', []))}")
        else:
            print(f"❌ Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Run all API tests."""
    print("🚀 Quantum Security Platform API Tests")
    print("=" * 50)
    
    tests = [
        test_root_endpoint,
        test_cbom_scan,
        test_quantum_agility,
        test_attack_simulation
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
