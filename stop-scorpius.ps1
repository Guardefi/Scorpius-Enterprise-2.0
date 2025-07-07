# =============================================================================
# Scorpius Platform Stop Script (PowerShell)
# =============================================================================

Write-Host "🛑 Stopping Scorpius Platform..." -ForegroundColor Yellow

# Stop Docker services
Write-Host "Stopping Docker services..." -ForegroundColor Blue
try {
    docker-compose -f docker/docker-compose.dev.yml down 2>$null
    docker-compose -f docker/docker-compose.yml down 2>$null
}
catch {
    # Ignore errors
}

# Kill API server and frontend processes
Write-Host "Stopping API server and frontend..." -ForegroundColor Blue
try {
    # Stop processes by name and command line
    Get-Process | Where-Object { 
        ($_.ProcessName -eq "python" -and $_.CommandLine -match "demo-api-server") -or
        ($_.ProcessName -eq "node" -and $_.CommandLine -match "vite") -or
        ($_.ProcessName -eq "npm" -and $_.CommandLine -match "run dev")
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Also stop any background jobs that might be running
    Get-Job | Where-Object { $_.Name -match "api|frontend" } | Stop-Job -PassThru | Remove-Job
}
catch {
    # Ignore errors
}

Write-Host "✅ Scorpius Platform stopped" -ForegroundColor Green
Write-Host "All services have been terminated."
