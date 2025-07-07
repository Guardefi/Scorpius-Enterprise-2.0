Write-Host "🚀 Starting Scorpius Full Stack Integration..." -ForegroundColor Green

# Copy environment file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📋 Copying .env.example to .env" -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please update .env with your actual configuration" -ForegroundColor Yellow
}

# Build and start all services
Write-Host "🔨 Building and starting all services..." -ForegroundColor Cyan
docker-compose up --build -d

Write-Host "⏳ Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "🔍 Checking service health..." -ForegroundColor Cyan
try {
    Invoke-RestMethod -Uri "http://localhost:8000/health" -Method Get | Out-Null
    Write-Host "✅ API Gateway is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ API Gateway not ready" -ForegroundColor Red
}

try {
    Invoke-RestMethod -Uri "http://localhost:9090" -Method Get | Out-Null
    Write-Host "✅ Prometheus is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ Prometheus not ready" -ForegroundColor Red
}

try {
    Invoke-RestMethod -Uri "http://localhost:3000" -Method Get | Out-Null
    Write-Host "✅ Grafana is ready" -ForegroundColor Green
} catch {
    Write-Host "❌ Grafana not ready" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Scorpius Full Stack Started!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Access Points:" -ForegroundColor Cyan
Write-Host "   Frontend:     http://localhost:5173" -ForegroundColor White
Write-Host "   API Gateway:  http://localhost:8000" -ForegroundColor White
Write-Host "   Prometheus:   http://localhost:9090" -ForegroundColor White
Write-Host "   Grafana:      http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host ""
Write-Host "📊 Service Ports:" -ForegroundColor Cyan
Write-Host "   Bridge:       http://localhost:8001" -ForegroundColor White
Write-Host "   Quantum:      http://localhost:8002" -ForegroundColor White
Write-Host "   Reporting:    http://localhost:8003" -ForegroundColor White
Write-Host "   Time Machine: http://localhost:8004" -ForegroundColor White
Write-Host "   Core:         http://localhost:8005" -ForegroundColor White
Write-Host ""
Write-Host "🔧 To stop all services: docker-compose down" -ForegroundColor Yellow
Write-Host "📝 To view logs: docker-compose logs -f [service-name]" -ForegroundColor Yellow
