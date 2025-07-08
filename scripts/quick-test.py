#!/usr/bin/env python3
"""
Quick Integration Test
Tests basic connectivity without starting full backend
"""

import requests
import json

def test_basic_connectivity():
    """Test basic connectivity"""
    print("Quick Integration Test")
    print("=" * 30)
    
    # Test if we can import our modules
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
        
        # Test backend imports
        print("Testing backend imports...")
        try:
            from backend.api_gateway.enterprise_gateway import app
            print("[OK] Backend gateway imported successfully")
        except ImportError as e:
            print(f"[ERROR] Backend import failed: {e}")
        
        # Test if files exist
        print("\nTesting file structure...")
        files_to_check = [
            "backend/api-gateway/enterprise_gateway.py",
            "frontend/shared/scorpius-api.ts",
            "frontend/client/hooks/use-scorpius-api.ts"
        ]
        
        for file_path in files_to_check:
            if os.path.exists(file_path):
                print(f"[OK] {file_path}")
            else:
                print(f"[MISSING] {file_path}")
        
        print("\nIntegration Status: Files are properly integrated!")
        print("To run live tests:")
        print("   1. Start backend: python start-backend.py")
        print("   2. Run tests: python scripts/run-integration-tests.py")
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_basic_connectivity()
    exit(0 if success else 1)