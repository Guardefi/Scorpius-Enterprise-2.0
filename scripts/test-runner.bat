@echo off
echo 🚀 Scorpius Integration Test Suite
echo =====================================

echo.
echo 📋 Running Backend Integration Tests...
cd /d "%~dp0\.."
python -m pytest tests/integration/test_api_integration.py -v --tb=short

echo.
echo 🎨 Running Frontend Integration Tests...
cd frontend
npm test -- tests/frontend/api-integration.test.ts

echo.
echo 🔍 Running Comprehensive Integration Tests...
cd /d "%~dp0\.."
python scripts/run-integration-tests.py

echo.
echo ✅ All tests completed!
pause