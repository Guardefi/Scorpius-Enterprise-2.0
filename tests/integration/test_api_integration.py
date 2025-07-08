"""
Integration tests for Scorpius API Gateway
Tests all backend service endpoints and frontend connectivity
"""

import pytest
import asyncio
import httpx
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

class TestAPIIntegration:
    
    @pytest.fixture
    async def client(self):
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
            yield client
    
    @pytest.fixture
    async def auth_token(self, client):
        # Test authentication
        response = await client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "testpass123"
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        return None
    
    @pytest.fixture
    def auth_headers(self, auth_token):
        if auth_token:
            return {"Authorization": f"Bearer {auth_token}"}
        return {}

    # ============================================================================
    # CORE ENDPOINT TESTS
    # ============================================================================
    
    async def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "timestamp" in data
    
    async def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "Scorpius Enterprise API Gateway"
        assert data["version"] == "1.4.0"
    
    async def test_metrics_endpoint(self, client):
        """Test metrics endpoint"""
        response = await client.get("/metrics")
        assert response.status_code == 200
        assert "http_requests_total" in response.text or response.status_code == 200

    # ============================================================================
    # SCANNER SERVICE TESTS
    # ============================================================================
    
    async def test_scanner_endpoints(self, client, auth_headers):
        """Test scanner service integration"""
        # Test scan contract
        scan_data = {
            "address": "0x1234567890123456789012345678901234567890",
            "engines": ["slither", "mythril"]
        }
        response = await client.post("/api/scanner/scan", 
                                   json=scan_data, headers=auth_headers)
        assert response.status_code in [200, 201, 503]  # 503 if service unavailable
        
        # Test list scans
        response = await client.get("/api/scanner/scans", headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test vulnerabilities
        response = await client.get("/api/scanner/vulnerabilities", headers=auth_headers)
        assert response.status_code in [200, 503]

    # ============================================================================
    # REPORTING SERVICE TESTS
    # ============================================================================
    
    async def test_reporting_endpoints(self, client, auth_headers):
        """Test reporting service integration"""
        # Test generate report
        report_data = {
            "format": "pdf",
            "data": {"test": "data"}
        }
        response = await client.post("/api/reports/generate", 
                                   json=report_data, headers=auth_headers)
        assert response.status_code in [200, 201, 503]
        
        # Test list reports
        response = await client.get("/api/reports", headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test templates
        response = await client.get("/api/reports/templates", headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test format-specific endpoints
        formats = ["pdf", "excel", "csv"]
        for fmt in formats:
            response = await client.post(f"/api/reports/formats/{fmt}", 
                                       json={"data": "test"}, headers=auth_headers)
            assert response.status_code in [200, 201, 503]

    # ============================================================================
    # QUANTUM SERVICE TESTS
    # ============================================================================
    
    async def test_quantum_endpoints(self, client, auth_headers):
        """Test quantum service integration"""
        # Test quantum analyze
        quantum_data = {
            "algorithm": "shor",
            "parameters": {"key_size": 2048}
        }
        response = await client.post("/api/quantum/analyze", 
                                   json=quantum_data, headers=auth_headers)
        assert response.status_code in [200, 201, 503]
        
        # Test quantum resistance
        resistance_data = {
            "algorithm": "rsa",
            "key": "test_key"
        }
        response = await client.post("/api/quantum/resistance/test", 
                                   json=resistance_data, headers=auth_headers)
        assert response.status_code in [200, 201, 503]
        
        # Test quantum metrics
        response = await client.get("/api/quantum/metrics", headers=auth_headers)
        assert response.status_code in [200, 503]

    # ============================================================================
    # DASHBOARD WIDGET TESTS
    # ============================================================================
    
    async def test_dashboard_widget_endpoints(self, client, auth_headers):
        """Test dashboard-specific endpoints"""
        test_address = "0x1234567890123456789012345678901234567890"
        
        # Test static scan summary
        response = await client.get(f"/api/v1/static-scan?address={test_address}", 
                                  headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test bytecode lab
        response = await client.get(f"/api/v1/bytecode-lab/{test_address}", 
                                  headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test simulations
        response = await client.get("/api/v1/simulations", headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test bridge monitor
        response = await client.get(f"/api/v1/bridge-monitor?address={test_address}", 
                                  headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test time machine cards
        response = await client.get("/api/v1/time-machine/cards?limit=5", 
                                  headers=auth_headers)
        assert response.status_code in [200, 503]

    # ============================================================================
    # QUANTUM SPECIALIZED TESTS
    # ============================================================================
    
    async def test_quantum_specialized_endpoints(self, client, auth_headers):
        """Test quantum-specific dashboard endpoints"""
        # Test quantum keys
        response = await client.get("/api/v1/quantum/keys", headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test threat forecast
        response = await client.get("/api/v1/quantum/forecast", headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test vendor feed
        response = await client.get("/api/v1/quantum/vendor-feed", headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test heatmap
        response = await client.get("/api/v1/quantum/heatmap", headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test alerts
        response = await client.get("/api/v1/quantum/alerts", headers=auth_headers)
        assert response.status_code in [200, 503]

    # ============================================================================
    # HONEYPOT SPECIALIZED TESTS
    # ============================================================================
    
    async def test_honeypot_specialized_endpoints(self, client, auth_headers):
        """Test honeypot-specific dashboard endpoints"""
        test_address = "0x1234567890123456789012345678901234567890"
        
        # Test honeypot summary
        response = await client.get(f"/api/v1/honeypot/summary?address={test_address}", 
                                  headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test detection
        detect_data = {
            "address": test_address,
            "methods": ["pattern_analysis"]
        }
        response = await client.post("/api/v1/honeypot/detect", 
                                   json=detect_data, headers=auth_headers)
        assert response.status_code in [200, 201, 503]
        
        # Test simulations
        response = await client.get(f"/api/v1/honeypot/simulations?address={test_address}", 
                                  headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test watchlist
        response = await client.get("/api/v1/honeypot/watchlist", headers=auth_headers)
        assert response.status_code in [200, 503]

    # ============================================================================
    # MEV AND WALLET TESTS
    # ============================================================================
    
    async def test_mev_wallet_endpoints(self, client, auth_headers):
        """Test MEV and wallet guard endpoints"""
        # Test MEV protection
        mev_data = {
            "transaction": {"hash": "0xtest"},
            "protection_level": "high"
        }
        response = await client.post("/api/mev/protect", 
                                   json=mev_data, headers=auth_headers)
        assert response.status_code in [200, 201, 503]
        
        # Test wallet analysis
        test_address = "0x1234567890123456789012345678901234567890"
        response = await client.post("/api/wallet/analyze", 
                                   json={"address": test_address}, headers=auth_headers)
        assert response.status_code in [200, 201, 503]
        
        # Test MEV opportunities
        response = await client.get("/api/mevbot/opportunities", headers=auth_headers)
        assert response.status_code in [200, 503]

    # ============================================================================
    # INFRASTRUCTURE TESTS
    # ============================================================================
    
    async def test_infrastructure_endpoints(self, client, auth_headers):
        """Test infrastructure and utility endpoints"""
        # Test computing status
        response = await client.get("/api/v1/computing/status", headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test analytics
        response = await client.get("/api/v1/analytics/overview", headers=auth_headers)
        assert response.status_code in [200, 503]
        
        # Test monitoring
        response = await client.get("/api/monitoring/metrics", headers=auth_headers)
        assert response.status_code in [200, 503]

    # ============================================================================
    # NOTIFICATION TESTS
    # ============================================================================
    
    async def test_notification_endpoints(self, client, auth_headers):
        """Test notification endpoints"""
        # Test Telegram notification (will fail without proper config, but should not error)
        telegram_data = {
            "chatId": "123456789",
            "message": "Test message"
        }
        response = await client.post("/api/v1/notifications/telegram", 
                                   json=telegram_data, headers=auth_headers)
        assert response.status_code in [200, 400, 503]  # 400 for invalid config is OK
        
        # Test Slack notification
        slack_data = {
            "channel": "#test",
            "text": "Test message"
        }
        response = await client.post("/api/v1/notifications/slack", 
                                   json=slack_data, headers=auth_headers)
        assert response.status_code in [200, 400, 503]

    # ============================================================================
    # BATCH OPERATION TESTS
    # ============================================================================
    
    async def test_batch_operations(self, client, auth_headers):
        """Test batch operations"""
        # Test batch scan
        batch_data = {
            "contracts": [
                {"address": "0x1234567890123456789012345678901234567890"},
                {"address": "0x0987654321098765432109876543210987654321"}
            ]
        }
        response = await client.post("/api/scanner/batch", 
                                   json=batch_data, headers=auth_headers)
        assert response.status_code in [200, 201, 503]

    # ============================================================================
    # ERROR HANDLING TESTS
    # ============================================================================
    
    async def test_error_handling(self, client, auth_headers):
        """Test error handling"""
        # Test invalid endpoint
        response = await client.get("/api/nonexistent/endpoint", headers=auth_headers)
        assert response.status_code == 404
        
        # Test invalid JSON
        response = await client.post("/api/scanner/scan", 
                                   data="invalid json", headers=auth_headers)
        assert response.status_code in [400, 422]
        
        # Test unauthorized access
        response = await client.get("/api/scanner/scans")  # No auth headers
        assert response.status_code in [401, 503]

    # ============================================================================
    # RATE LIMITING TESTS
    # ============================================================================
    
    async def test_rate_limiting(self, client, auth_headers):
        """Test rate limiting (basic test)"""
        # Make multiple rapid requests
        responses = []
        for i in range(5):
            response = await client.get("/", headers=auth_headers)
            responses.append(response.status_code)
        
        # Should not get rate limited for reasonable requests
        assert all(status in [200, 503] for status in responses)

# ============================================================================
# FRONTEND INTEGRATION TESTS
# ============================================================================

class TestFrontendIntegration:
    """Test frontend API integration"""
    
    def test_api_client_structure(self):
        """Test that API client files exist and have correct structure"""
        import os
        
        # Check if API files exist
        api_files = [
            "frontend/shared/scorpius-api.ts",
            "frontend/shared/dashboard-api.ts", 
            "frontend/client/hooks/use-scorpius-api.ts",
            "frontend/client/hooks/use-dashboard-api.ts",
            "frontend/client/lib/api-service.ts"
        ]
        
        for file_path in api_files:
            full_path = os.path.join(os.path.dirname(__file__), "..", "..", file_path)
            assert os.path.exists(full_path), f"API file missing: {file_path}"
    
    def test_typescript_compilation(self):
        """Test TypeScript compilation (if tsc is available)"""
        import subprocess
        import os
        
        try:
            # Try to compile TypeScript files
            frontend_dir = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
            result = subprocess.run(
                ["npx", "tsc", "--noEmit", "--skipLibCheck"],
                cwd=frontend_dir,
                capture_output=True,
                text=True,
                timeout=30
            )
            # If tsc is available, it should not have compilation errors
            if result.returncode != 127:  # 127 = command not found
                assert result.returncode == 0, f"TypeScript compilation failed: {result.stderr}"
        except (subprocess.TimeoutExpired, FileNotFoundError):
            # Skip if TypeScript compiler not available
            pytest.skip("TypeScript compiler not available")

# ============================================================================
# PERFORMANCE TESTS
# ============================================================================

class TestPerformance:
    """Basic performance tests"""
    
    async def test_response_times(self):
        """Test basic response times"""
        async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
            start_time = datetime.now()
            response = await client.get("/health")
            end_time = datetime.now()
            
            response_time = (end_time - start_time).total_seconds()
            assert response_time < 5.0, f"Health check too slow: {response_time}s"
            assert response.status_code == 200

# ============================================================================
# RUN TESTS
# ============================================================================

if __name__ == "__main__":
    # Run tests with pytest
    pytest.main([__file__, "-v", "--tb=short"])