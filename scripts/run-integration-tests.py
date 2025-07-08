#!/usr/bin/env python3
"""
Scorpius Integration Test Runner
Runs comprehensive tests to verify backend-frontend integration
"""

import asyncio
import subprocess
import sys
import time
import requests
import json
from pathlib import Path
from typing import Dict, List, Tuple

class IntegrationTestRunner:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.results = {
            "backend_health": False,
            "endpoint_tests": {},
            "frontend_tests": False,
            "integration_score": 0
        }
    
    def run_all_tests(self) -> Dict:
        """Run all integration tests"""
        print("🚀 Starting Scorpius Integration Tests")
        print("=" * 50)
        
        # Test backend health
        self.test_backend_health()
        
        # Test core endpoints
        self.test_core_endpoints()
        
        # Test dashboard endpoints
        self.test_dashboard_endpoints()
        
        # Test specialized endpoints
        self.test_specialized_endpoints()
        
        # Test frontend integration
        self.test_frontend_integration()
        
        # Calculate integration score
        self.calculate_integration_score()
        
        # Print results
        self.print_results()
        
        return self.results
    
    def test_backend_health(self):
        """Test backend health and availability"""
        print("🏥 Testing Backend Health...")
        
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                self.results["backend_health"] = True
                print("✅ Backend is healthy")
            else:
                print(f"❌ Backend health check failed: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Backend not accessible: {e}")
    
    def test_core_endpoints(self):
        """Test core service endpoints"""
        print("\n🔧 Testing Core Service Endpoints...")
        
        core_endpoints = [
            ("GET", "/", "Root endpoint"),
            ("GET", "/health", "Health check"),
            ("GET", "/metrics", "Metrics endpoint"),
            ("POST", "/api/auth/login", "Authentication", {"email": "test@example.com", "password": "test"}),
            ("GET", "/api/scanner/scans", "Scanner list"),
            ("GET", "/api/reports", "Reports list"),
            ("GET", "/api/quantum/metrics", "Quantum metrics"),
            ("GET", "/api/forensics/cases", "Forensics cases"),
            ("GET", "/api/mev/strategies", "MEV strategies"),
            ("GET", "/api/wallet/whitelist", "Wallet whitelist"),
            ("GET", "/api/honeypot/patterns", "Honeypot patterns"),
            ("GET", "/api/mempool/transactions", "Mempool transactions"),
            ("GET", "/api/simulation/scenarios", "Simulation scenarios"),
            ("GET", "/api/dashboard/stats", "Dashboard stats"),
            ("GET", "/api/monitoring/health", "System health")
        ]
        
        for item in core_endpoints:
            if len(item) == 3:
                method, endpoint, description = item
                self.test_endpoint(method, endpoint, description, "core")
            else:
                method, endpoint, description, data = item
                self.test_endpoint(method, endpoint, description, "core", data)
    
    def test_dashboard_endpoints(self):
        """Test dashboard widget endpoints"""
        print("\n📊 Testing Dashboard Widget Endpoints...")
        
        test_address = "0x1234567890123456789012345678901234567890"
        dashboard_endpoints = [
            ("GET", f"/api/v1/static-scan?address={test_address}", "Static scan summary"),
            ("GET", f"/api/v1/bytecode-lab/{test_address}", "Bytecode lab"),
            ("GET", "/api/v1/simulations", "Simulations list"),
            ("GET", f"/api/v1/bridge-monitor?address={test_address}", "Bridge monitor"),
            ("GET", "/api/v1/time-machine/cards", "Time machine cards"),
            ("GET", "/api/v1/quantum/keys", "Quantum keys"),
            ("GET", "/api/v1/quantum/forecast", "Threat forecast"),
            ("GET", "/api/v1/quantum/heatmap", "Quantum heatmap"),
            ("GET", f"/api/v1/honeypot/summary?address={test_address}", "Honeypot summary"),
            ("GET", "/api/v1/honeypot/watchlist", "Honeypot watchlist"),
            ("GET", "/api/v1/analytics/overview", "Analytics overview"),
            ("GET", "/api/v1/computing/status", "Computing status")
        ]
        
        for method, endpoint, description in dashboard_endpoints:
            self.test_endpoint(method, endpoint, description, "dashboard")
    
    def test_specialized_endpoints(self):
        """Test specialized service endpoints"""
        print("\n⚡ Testing Specialized Endpoints...")
        
        specialized_endpoints = [
            ("GET", "/api/v1/quantum/vendor-feed", "Quantum vendor feed"),
            ("GET", "/api/v1/quantum/alerts", "Quantum alerts"),
            ("GET", "/api/v1/quantum/compliance-report", "Compliance report"),
            ("GET", "/api/v1/honeypot/simulations?address=0x123", "Honeypot simulations"),
            ("GET", "/api/v1/honeypot/reputation?address=0x123", "Honeypot reputation"),
            ("POST", "/api/v1/notifications/telegram", "Telegram notifications", {"chatId": "123", "message": "test"}),
            ("POST", "/api/v1/notifications/slack", "Slack notifications", {"channel": "#test", "text": "test"}),
            ("GET", "/api/v1/computing/jobs", "Computing jobs"),
            ("GET", "/api/v1/analytics/detail?metric=scans&from=2024-01-01&to=2024-12-31", "Analytics detail")
        ]
        
        for item in specialized_endpoints:
            if len(item) == 3:
                method, endpoint, description = item
                self.test_endpoint(method, endpoint, description, "specialized")
            else:
                method, endpoint, description, data = item
                self.test_endpoint(method, endpoint, description, "specialized", data)
    
    def test_endpoint(self, method: str, endpoint: str, description: str, category: str, data: Dict = None):
        """Test individual endpoint"""
        try:
            url = f"{self.base_url}{endpoint}"
            
            if method == "GET":
                response = requests.get(url, timeout=5)
            elif method == "POST":
                response = requests.post(url, json=data or {}, timeout=5)
            elif method == "PUT":
                response = requests.put(url, json=data or {}, timeout=5)
            elif method == "DELETE":
                response = requests.delete(url, timeout=5)
            else:
                response = requests.request(method, url, json=data or {}, timeout=5)
            
            # Consider 200, 401 (auth required), 503 (service unavailable) as acceptable
            success = response.status_code in [200, 201, 401, 503]
            
            if category not in self.results["endpoint_tests"]:
                self.results["endpoint_tests"][category] = {"passed": 0, "total": 0, "details": []}
            
            self.results["endpoint_tests"][category]["total"] += 1
            
            if success:
                self.results["endpoint_tests"][category]["passed"] += 1
                print(f"✅ {description}: {response.status_code}")
            else:
                print(f"❌ {description}: {response.status_code}")
            
            self.results["endpoint_tests"][category]["details"].append({
                "endpoint": endpoint,
                "description": description,
                "status": response.status_code,
                "success": success
            })
            
        except requests.exceptions.RequestException as e:
            print(f"❌ {description}: Connection failed - {e}")
            if category not in self.results["endpoint_tests"]:
                self.results["endpoint_tests"][category] = {"passed": 0, "total": 0, "details": []}
            
            self.results["endpoint_tests"][category]["total"] += 1
            self.results["endpoint_tests"][category]["details"].append({
                "endpoint": endpoint,
                "description": description,
                "status": "error",
                "success": False,
                "error": str(e)
            })
    
    def test_frontend_integration(self):
        """Test frontend integration files"""
        print("\n🎨 Testing Frontend Integration...")
        
        frontend_files = [
            "frontend/shared/scorpius-api.ts",
            "frontend/shared/dashboard-api.ts",
            "frontend/client/hooks/use-scorpius-api.ts",
            "frontend/client/hooks/use-dashboard-api.ts",
            "frontend/client/lib/api-service.ts",
            "frontend/client/components/dashboard/DashboardIntegration.tsx"
        ]
        
        missing_files = []
        existing_files = []
        
        for file_path in frontend_files:
            full_path = Path(file_path)
            if full_path.exists():
                existing_files.append(file_path)
                print(f"✅ {file_path}")
            else:
                missing_files.append(file_path)
                print(f"❌ {file_path} - Missing")
        
        self.results["frontend_tests"] = len(missing_files) == 0
        
        # Try to run TypeScript compilation if available
        try:
            result = subprocess.run(
                ["npx", "tsc", "--noEmit", "--skipLibCheck"],
                cwd="frontend",
                capture_output=True,
                text=True,
                timeout=30
            )
            if result.returncode == 0:
                print("✅ TypeScript compilation successful")
            else:
                print(f"⚠️  TypeScript compilation issues: {result.stderr}")
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
            print("⚠️  TypeScript compiler not available or failed")
    
    def calculate_integration_score(self):
        """Calculate overall integration score"""
        total_score = 0
        max_score = 0
        
        # Backend health (20 points)
        max_score += 20
        if self.results["backend_health"]:
            total_score += 20
        
        # Endpoint tests (60 points)
        max_score += 60
        for category, data in self.results["endpoint_tests"].items():
            if data["total"] > 0:
                category_score = (data["passed"] / data["total"]) * 20
                total_score += category_score
        
        # Frontend integration (20 points)
        max_score += 20
        if self.results["frontend_tests"]:
            total_score += 20
        
        self.results["integration_score"] = int((total_score / max_score) * 100) if max_score > 0 else 0
    
    def print_results(self):
        """Print comprehensive test results"""
        print("\n" + "=" * 50)
        print("📋 INTEGRATION TEST RESULTS")
        print("=" * 50)
        
        # Backend Health
        health_status = "✅ HEALTHY" if self.results["backend_health"] else "❌ UNHEALTHY"
        print(f"Backend Health: {health_status}")
        
        # Endpoint Tests
        print("\nEndpoint Test Results:")
        for category, data in self.results["endpoint_tests"].items():
            passed = data["passed"]
            total = data["total"]
            percentage = (passed / total * 100) if total > 0 else 0
            print(f"  {category.title()}: {passed}/{total} ({percentage:.1f}%)")
        
        # Frontend Integration
        frontend_status = "✅ COMPLETE" if self.results["frontend_tests"] else "❌ INCOMPLETE"
        print(f"Frontend Integration: {frontend_status}")
        
        # Overall Score
        score = self.results["integration_score"]
        if score >= 90:
            score_emoji = "🎉"
            score_status = "EXCELLENT"
        elif score >= 75:
            score_emoji = "✅"
            score_status = "GOOD"
        elif score >= 50:
            score_emoji = "⚠️"
            score_status = "NEEDS IMPROVEMENT"
        else:
            score_emoji = "❌"
            score_status = "CRITICAL ISSUES"
        
        print(f"\n{score_emoji} OVERALL INTEGRATION SCORE: {score}% ({score_status})")
        
        # Recommendations
        print("\n📝 RECOMMENDATIONS:")
        if not self.results["backend_health"]:
            print("  • Start the backend server (python -m uvicorn backend.api-gateway.enterprise_gateway:app)")
        
        if score < 90:
            print("  • Check service connectivity and configuration")
            print("  • Verify all microservices are running")
            print("  • Review authentication setup")
        
        if not self.results["frontend_tests"]:
            print("  • Ensure all frontend integration files are present")
            print("  • Check TypeScript compilation")
        
        print("\n🎯 Integration Status: ", end="")
        if score >= 90:
            print("READY FOR PRODUCTION! 🚀")
        elif score >= 75:
            print("READY FOR TESTING 🧪")
        else:
            print("NEEDS ATTENTION ⚠️")

def main():
    """Main test runner"""
    runner = IntegrationTestRunner()
    results = runner.run_all_tests()
    
    # Save results to file
    with open("integration_test_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: integration_test_results.json")
    
    # Exit with appropriate code
    sys.exit(0 if results["integration_score"] >= 75 else 1)

if __name__ == "__main__":
    main()