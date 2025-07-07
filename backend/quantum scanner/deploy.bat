@echo off
REM Deployment script for Quantum Scanner + Scorpius Integration (Windows)

echo 🚀 Starting Quantum Scanner + Scorpius Integration Deployment...

REM Create required directories
echo 📁 Creating required directories...
if not exist "logs" mkdir logs
if not exist "models" mkdir models
if not exist "data" mkdir data
if not exist "nginx\ssl" mkdir nginx\ssl
if not exist "monitoring\grafana\provisioning" mkdir monitoring\grafana\provisioning

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose not found. Please install Docker Compose.
    exit /b 1
)

REM Pull latest images
echo 📦 Pulling latest Docker images...
docker-compose pull

REM Build services
echo 🔨 Building services...
docker-compose build --no-cache

REM Start services
echo 🎯 Starting services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Health checks
echo 🏥 Performing health checks...

REM Check Quantum Scanner
curl -f http://localhost/quantum/health >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Quantum Scanner is healthy
) else (
    echo ❌ Quantum Scanner health check failed
)

REM Check Redis
docker-compose exec -T redis redis-cli ping | findstr PONG >nul
if %errorlevel% == 0 (
    echo ✅ Redis is healthy
) else (
    echo ❌ Redis health check failed
)

REM Show service status
echo 📊 Service Status:
docker-compose ps

echo.
echo 🎉 Deployment completed!
echo.
echo Available endpoints:
echo   • Quantum Scanner API: http://localhost/quantum/
echo   • Scorpius Orchestrator: http://localhost/scorpius/
echo   • AI Threat Predictor: http://localhost/quantum/ai-threat-predictor/
echo   • Prometheus Metrics: http://localhost:9090
echo   • Grafana Dashboard: http://localhost:3000 (admin/admin123)
echo.
echo To view logs: docker-compose logs -f [service-name]
echo To stop services: docker-compose down

pause
