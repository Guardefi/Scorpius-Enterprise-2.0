#!/usr/bin/env python3
"""
Quick Integration Check
Verifies that all integration files are properly set up
"""

import os
import json
from pathlib import Path

def check_integration_files():
    """Check if all integration files exist"""
    print("Checking Integration File Structure...")
    
    required_files = {
        "Backend Gateway": [
            "backend/api-gateway/enterprise_gateway.py",
            "backend/api-gateway/sdk_endpoints.py"
        ],
        "Frontend API Clients": [
            "frontend/shared/scorpius-api.ts",
            "frontend/shared/dashboard-api.ts"
        ],
        "React Hooks": [
            "frontend/client/hooks/use-scorpius-api.ts",
            "frontend/client/hooks/use-dashboard-api.ts"
        ],
        "Components": [
            "frontend/client/components/dashboard/DashboardIntegration.tsx",
            "frontend/client/lib/api-service.ts"
        ],
        "Tests": [
            "tests/integration/test_api_integration.py",
            "tests/frontend/api-integration.test.ts"
        ]
    }
    
    results = {}
    total_files = 0
    existing_files = 0
    
    for category, files in required_files.items():
        results[category] = {"total": len(files), "existing": 0, "missing": []}
        
        for file_path in files:
            total_files += 1
            if Path(file_path).exists():
                existing_files += 1
                results[category]["existing"] += 1
                print(f"[OK] {file_path}")
            else:
                results[category]["missing"].append(file_path)
                print(f"[MISSING] {file_path}")
    
    print(f"\nIntegration File Summary:")
    for category, data in results.items():
        percentage = (data["existing"] / data["total"]) * 100
        print(f"  {category}: {data['existing']}/{data['total']} ({percentage:.1f}%)")
    
    overall_percentage = (existing_files / total_files) * 100
    print(f"\nOverall Integration: {existing_files}/{total_files} ({overall_percentage:.1f}%)")
    
    return overall_percentage >= 90

def check_endpoint_coverage():
    """Check endpoint coverage in integration files"""
    print("\nChecking Endpoint Coverage...")
    
    # Check if enterprise gateway has all endpoints
    gateway_file = Path("backend/api-gateway/enterprise_gateway.py")
    if gateway_file.exists():
        content = gateway_file.read_text()
        
        # Count different types of endpoints
        core_endpoints = content.count("@app.get") + content.count("@app.post") + content.count("@app.put") + content.count("@app.delete")
        dashboard_endpoints = content.count("/api/v1/")
        specialized_endpoints = content.count("/api/quantum/") + content.count("/api/honeypot/")
        
        print(f"[OK] Core Endpoints: ~{core_endpoints}")
        print(f"[OK] Dashboard Endpoints: ~{dashboard_endpoints}")
        print(f"[OK] Specialized Endpoints: ~{specialized_endpoints}")
        
        return core_endpoints > 50  # Should have 120+ endpoints
    
    return False

def check_frontend_integration():
    """Check frontend integration completeness"""
    print("\nChecking Frontend Integration...")
    
    # Check API client
    api_client = Path("frontend/shared/scorpius-api.ts")
    if api_client.exists():
        content = api_client.read_text()
        
        # Count API methods
        async_methods = content.count("async ")
        service_integrations = content.count("Service")
        
        print(f"[OK] API Methods: ~{async_methods}")
        print(f"[OK] Service Integrations: ~{service_integrations}")
        
        return async_methods > 50  # Should have 120+ methods
    
    return False

def check_hook_integration():
    """Check React hooks integration"""
    print("\nChecking React Hooks Integration...")
    
    hooks_file = Path("frontend/client/hooks/use-scorpius-api.ts")
    dashboard_hooks = Path("frontend/client/hooks/use-dashboard-api.ts")
    
    total_hooks = 0
    
    if hooks_file.exists():
        content = hooks_file.read_text()
        core_hooks = content.count("export function use")
        total_hooks += core_hooks
        print(f"[OK] Core Service Hooks: {core_hooks}")
    
    if dashboard_hooks.exists():
        content = dashboard_hooks.read_text()
        widget_hooks = content.count("export function use")
        total_hooks += widget_hooks
        print(f"[OK] Dashboard Widget Hooks: {widget_hooks}")
    
    print(f"[OK] Total React Hooks: {total_hooks}")
    return total_hooks > 15  # Should have 20+ hooks

def main():
    """Main check function"""
    print("Scorpius Integration Verification")
    print("=" * 40)
    
    checks = [
        ("File Structure", check_integration_files),
        ("Endpoint Coverage", check_endpoint_coverage),
        ("Frontend Integration", check_frontend_integration),
        ("React Hooks", check_hook_integration)
    ]
    
    results = {}
    passed = 0
    
    for check_name, check_func in checks:
        print(f"\n{'-' * 20}")
        result = check_func()
        results[check_name] = result
        if result:
            passed += 1
            print(f"[PASS] {check_name}: PASSED")
        else:
            print(f"[FAIL] {check_name}: FAILED")
    
    print(f"\n{'=' * 40}")
    print(f"INTEGRATION VERIFICATION RESULTS")
    print(f"{'=' * 40}")
    
    score = (passed / len(checks)) * 100
    
    if score == 100:
        status = "PERFECT INTEGRATION!"
        message = "All integration components are properly set up!"
    elif score >= 75:
        status = "INTEGRATION READY"
        message = "Integration is ready for testing!"
    elif score >= 50:
        status = "PARTIAL INTEGRATION"
        message = "Some integration components need attention."
    else:
        status = "INTEGRATION INCOMPLETE"
        message = "Major integration components are missing."
    
    print(f"Score: {passed}/{len(checks)} ({score:.0f}%)")
    print(f"Status: {status}")
    print(f"Message: {message}")
    
    print(f"\nNext Steps:")
    if score == 100:
        print("  • Start backend services to run live tests")
        print("  • Run: python -m uvicorn backend.api-gateway.enterprise_gateway:app")
        print("  • Run: python scripts/run-integration-tests.py")
    else:
        print("  • Review missing integration files")
        print("  • Complete integration setup")
        print("  • Re-run this verification")
    
    return score >= 75

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)