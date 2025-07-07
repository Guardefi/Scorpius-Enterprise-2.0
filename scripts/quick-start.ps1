Write-Host "⚡ Quick Start - Scorpius Development Mode" -ForegroundColor Green

# Start just the essential services for development
Write-Host "🔨 Starting essential services..." -ForegroundColor Cyan
docker-compose up -d postgres redis prometheus grafana

Write-Host "⏳ Waiting for databases..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🚀 Starting API Gateway..." -ForegroundColor Cyan
docker-compose up -d api-gateway

Write-Host "📱 Starting Frontend..." -ForegroundColor Cyan
Set-Location frontend
npm run dev &
Set-Location ..

Write-Host ""
Write-Host "✅ Development environment ready!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   API:      http://localhost:8000" -ForegroundColor White
