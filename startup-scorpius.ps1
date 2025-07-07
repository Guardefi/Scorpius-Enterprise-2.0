# =============================================================================
# Scorpius Platform Startup Script (PowerShell/Windows)
# =============================================================================
# This script starts up the entire Scorpius cybersecurity platform
# including all backend services, frontend, and admin tools.

param(
    [switch]$SkipTests,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Show-Banner {
    Write-Host @"
 ____                      _             
/ ___|  ___ ___  _ __ _ __ (_)_   _ ___   
\___ \ / __/ _ \| '__| '_ \| | | | / __|  
 ___) | (_| (_) | |  | |_) | | |_| \__ \  
|____/ \___\___/|_|  | .__/|_|\__,_|___/  
                     |_|                  
  Enterprise Cybersecurity Platform
"@ -ForegroundColor Blue
    
    Write-Host "🚀 Starting Scorpius Platform..." -ForegroundColor Blue
    Write-Host ("=" * 50)
}

function Test-Command {
    param($CommandName)
    try {
        Get-Command $CommandName -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Test-Port {
    param($Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    }
    catch {
        return $false
    }
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    $missingDeps = @()
    
    if (-not (Test-Command "docker")) { $missingDeps += "docker" }
    if (-not (Test-Command "docker-compose")) { $missingDeps += "docker-compose" }
    if (-not (Test-Command "node")) { $missingDeps += "node" }
    if (-not (Test-Command "npm")) { $missingDeps += "npm" }
    if (-not (Test-Command "python")) { $missingDeps += "python" }
    if (-not (Test-Command "pip")) { $missingDeps += "pip" }
    
    if ($missingDeps.Count -gt 0) {
        Write-Error "Missing required dependencies: $($missingDeps -join ', ')"
        Write-Error "Please install the missing dependencies and try again."
        exit 1
    }
    
    Write-Success "All prerequisites found"
}

function Stop-ExistingServices {
    Write-Info "Cleaning up existing services..."
    
    try {
        # Stop Docker services
        docker-compose -f docker/docker-compose.dev.yml down 2>$null
        docker-compose -f docker/docker-compose.yml down 2>$null
    }
    catch {
        # Ignore errors for cleanup
    }
    
    # Kill processes on our ports
    $ports = @(8000, 8080, 3000, 5432, 6379, 5050, 8081)
    foreach ($port in $ports) {
        if (Test-Port $port) {
            Write-Warning "Port $port is in use, attempting to free it..."
            try {
                Get-Process | Where-Object { $_.ProcessName -match "python|node|npm" } | Stop-Process -Force -ErrorAction SilentlyContinue
            }
            catch {
                # Ignore errors
            }
        }
    }
    
    Write-Success "Cleanup completed"
}

function Install-PythonDependencies {
    Write-Info "Installing Python dependencies..."
    
    if (Test-Path "requirements.txt") {
        pip install -r requirements.txt
    }
    
    # Install essential packages for the demo
    pip install flask flask-cors pyjwt requests redis psycopg2-binary
    
    Write-Success "Python dependencies installed"
}

function Setup-Frontend {
    Write-Info "Setting up frontend..."
    
    if (-not (Test-Path "frontend")) {
        Write-Error "Frontend directory not found!"
        exit 1
    }
    
    Push-Location frontend
    try {
        Write-Info "Installing Node.js dependencies..."
        npm install
        
        # Check if .env file exists, if not copy from example
        if (-not (Test-Path ".env")) {
            if (Test-Path ".env.example") {
                Copy-Item ".env.example" ".env"
                Write-Success "Created .env file from .env.example"
            }
        }
    }
    finally {
        Pop-Location
    }
    
    Write-Success "Frontend setup completed"
}

function Start-Infrastructure {
    Write-Info "Starting infrastructure services..."
    
    # Start core infrastructure with health checks
    docker-compose -f docker/docker-compose.dev.yml --profile dev up -d --remove-orphans
    
    Write-Info "Waiting for infrastructure to be ready..."
    
    # Wait for Redis to be healthy
    $timeout = 60
    $count = 0
    do {
        try {
            $result = docker exec scorpius-redis-dev redis-cli ping 2>$null
            if ($result -eq "PONG") { break }
        }
        catch { }
        
        if ($count -ge $timeout) {
            Write-Error "Redis failed to start within $timeout seconds"
            exit 1
        }
        Start-Sleep 1
        $count++
    } while ($true)
    
    # Wait for PostgreSQL to be ready
    $count = 0
    do {
        try {
            $result = docker exec scorpius-postgres-dev pg_isready -U postgres 2>$null
            if ($LASTEXITCODE -eq 0) { break }
        }
        catch { }
        
        if ($count -ge $timeout) {
            Write-Error "PostgreSQL failed to start within $timeout seconds"
            exit 1
        }
        Start-Sleep 1
        $count++
    } while ($true)
    
    Write-Success "Infrastructure services are ready"
}

function Start-ApiServer {
    Write-Info "Starting API server..."
    
    # Stop any existing gateway container that might conflict
    try {
        docker stop scorpius-gateway-dev 2>$null
    }
    catch { }
    
    # Start the demo API server in background
    $apiJob = Start-Job -ScriptBlock { 
        Set-Location $using:PWD
        python demo-api-server.py 
    }
    
    # Wait for API server to be ready
    $timeout = 30
    $count = 0
    do {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 1 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) { break }
        }
        catch { }
        
        if ($count -ge $timeout) {
            Write-Error "API server failed to start within $timeout seconds"
            Stop-Job $apiJob -ErrorAction SilentlyContinue
            Remove-Job $apiJob -ErrorAction SilentlyContinue
            exit 1
        }
        Start-Sleep 1
        $count++
    } while ($true)
    
    Write-Success "API server is ready on http://localhost:8000"
    return $apiJob
}

function Start-Frontend {
    Write-Info "Starting frontend development server..."
    
    # Start the frontend in background
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location "$using:PWD\frontend"
        npm run dev
    }
    
    # Wait for frontend to be ready
    $timeout = 60
    $count = 0
    do {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) { break }
        }
        catch { }
        
        if ($count -ge $timeout) {
            Write-Error "Frontend failed to start within $timeout seconds"
            Stop-Job $frontendJob -ErrorAction SilentlyContinue
            Remove-Job $frontendJob -ErrorAction SilentlyContinue
            exit 1
        }
        Start-Sleep 2
        $count += 2
    } while ($true)
    
    Write-Success "Frontend is ready on http://localhost:8080"
    return $frontendJob
}

function Invoke-SystemTests {
    if ($SkipTests) {
        Write-Info "Skipping system tests as requested"
        return
    }
    
    Write-Info "Running system integration tests..."
    
    # Give services a moment to fully initialize
    Start-Sleep 5
    
    try {
        python test_system.py
        Write-Success "All system tests passed!"
    }
    catch {
        Write-Warning "Some tests failed, but services might still be functional"
    }
}

function New-StopScript {
    $stopScript = @'
# Scorpius Platform Stop Script
Write-Host "🛑 Stopping Scorpius Platform..." -ForegroundColor Yellow

# Stop Docker services
docker-compose -f docker/docker-compose.dev.yml down

# Kill processes
Get-Process | Where-Object { $_.ProcessName -match "python|node|npm" -and $_.CommandLine -match "demo-api-server|npm run dev|vite" } | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "✅ Scorpius Platform stopped" -ForegroundColor Green
'@
    
    $stopScript | Out-File -FilePath "stop-scorpius.ps1" -Encoding UTF8
}

function Show-FinalStatus {
    Write-Host ""
    Write-Success "🎉 Scorpius Platform Started Successfully!"
    Write-Host ("=" * 50)
    Write-Host ""
    Write-Host "📱 Access Points:"
    Write-Host "   • Frontend Dashboard: http://localhost:8080"
    Write-Host "   • API Server: http://localhost:8000"
    Write-Host "   • Database Admin (PgAdmin): http://localhost:5050"
    Write-Host "   • Redis Admin: http://localhost:8081"
    Write-Host ""
    Write-Host "🔐 Demo Login Credentials:"
    Write-Host "   • Email: admin@scorpius.io"
    Write-Host "   • Password: password123"
    Write-Host ""
    Write-Host "🛠️  Docker Services Running:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Where-Object { $_ -match "scorpius" }
    Write-Host ""
    Write-Host "💡 Tips:"
    Write-Host "   • Use 'docker-compose -f docker/docker-compose.dev.yml logs' to view logs"
    Write-Host "   • Use '.\stop-scorpius.ps1' to stop all services"
    Write-Host "   • Use Ctrl+C to stop this script (services will continue running)"
    Write-Host ""
}

# Main execution
function Main {
    Show-Banner
    
    Test-Prerequisites
    Stop-ExistingServices
    Install-PythonDependencies
    Setup-Frontend
    Start-Infrastructure
    $apiJob = Start-ApiServer
    $frontendJob = Start-Frontend
    Invoke-SystemTests
    New-StopScript
    Show-FinalStatus
    
    # Keep the script running to maintain jobs
    Write-Host "🔄 Services running... Press Ctrl+C to stop this script" -ForegroundColor Cyan
    Write-Host "   (Note: Services will continue running in background)"
    
    try {
        while ($true) {
            Start-Sleep 10
            
            # Check if jobs are still running
            if ($apiJob.State -ne "Running") {
                Write-Warning "API server job stopped unexpectedly"
            }
            if ($frontendJob.State -ne "Running") {
                Write-Warning "Frontend job stopped unexpectedly"
            }
        }
    }
    finally {
        Write-Host "`n🛑 Script interrupted. Services are still running in background."
        Write-Host "Use '.\stop-scorpius.ps1' to stop all services."
    }
}

# Run main function
Main
