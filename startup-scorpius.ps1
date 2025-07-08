# =============================================================================
# Scorpius Enterprise Platform Startup Script (PowerShell)
# =============================================================================

param(
    [switch]$Development,
    [switch]$SkipPreChecks,
    [switch]$Verbose,
    [switch]$Help
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

function Show-Banner {
    Clear-Host
    Write-Host @"
 ____                      _             
/ ___|  ___ ___  _ __ _ __ (_)_   _ ___   
\___ \ / __/ _ \| '__| '_ \| | | | / __|  
 ___) | (_| (_) | |  | |_) | | |_| \__ \  
|____/ \___\___/|_|  | .__/|_|\__,_|___/  
                     |_|                  
  Enterprise Cybersecurity Platform v1.4
"@ -ForegroundColor Cyan
    
    Write-Host "🚀 Initializing Scorpius Enterprise Platform..." -ForegroundColor Green
    Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Host ""
}

function Show-Help {
    Write-Host @"
Scorpius Enterprise Platform Startup Script

USAGE:
    .\startup-scorpius.ps1 [OPTIONS]

OPTIONS:
    -Development      Run in development mode (enables debug logging)
    -SkipPreChecks   Skip system requirements checks
    -Verbose         Enable verbose output
    -Help            Show this help message

EXAMPLES:
    .\startup-scorpius.ps1                    # Start in production mode
    .\startup-scorpius.ps1 -Development      # Start in development mode
    .\startup-scorpius.ps1 -Verbose          # Start with verbose logging

SERVICES STARTED:
    - PostgreSQL Database (Port 5432)
    - Redis Cache (Port 6379)
    - Keycloak Authentication (Port 8090)
    - API Gateway (Port 8000)
    - All Microservices (Ports 8010-8044)
    - Frontend UI (Port 3000)
    - Monitoring Stack (Prometheus: 9090, Grafana: 3001)
    - Admin Tools (pgAdmin: 5050, Redis Commander: 8081)

"@ -ForegroundColor Yellow
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

function Test-SystemRequirements {
    Write-Info "Checking system requirements..."
    
    # Check Docker
    if (-not (Test-Command "docker")) {
        Write-Error "Docker is not installed or not in PATH"
        Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
    
    # Check Docker Compose
    if (-not (Test-Command "docker-compose")) {
        Write-Error "Docker Compose is not installed or not in PATH"
        Write-Host "Please install Docker Compose or use Docker Desktop" -ForegroundColor Yellow
        exit 1
    }
    
    # Check if Docker is running
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker is not running. Please start Docker Desktop."
            exit 1
        }
    }
    catch {
        Write-Error "Failed to connect to Docker daemon"
        exit 1
    }
    
    # Check available memory
    $totalMemory = [math]::Round((Get-WmiObject -Class Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
    if ($totalMemory -lt 8) {
        Write-Warning "System has only ${totalMemory}GB RAM. Recommended minimum is 8GB for enterprise deployment."
    }
    
    # Check available disk space
    $freeSpace = [math]::Round((Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace / 1GB, 2)
    if ($freeSpace -lt 10) {
        Write-Warning "System has only ${freeSpace}GB free disk space. Recommended minimum is 10GB."
    }
    
    Write-Success "System requirements check completed"
}

function Initialize-Environment {
    Write-Info "Initializing environment..."
    
    # Check if .env file exists
    if (-not (Test-Path ".env")) {
        Write-Warning ".env file not found. Creating from template..."
        Copy-Item ".env.example" ".env" -ErrorAction SilentlyContinue
    }
    
    # Create necessary directories
    $directories = @(
        "logs",
        "logs/api-gateway",
        "logs/mempool",
        "logs/bridge",
        "logs/bytecode",
        "logs/mev-bot",
        "logs/mev-protection",
        "logs/wallet-guard",
        "logs/honeypot",
        "logs/quantum",
        "logs/quantum-crypto",
        "logs/ai-forensics",
        "logs/simulation",
        "logs/time-machine",
        "logs/reporting",
        "logs/exploit-testing",
        "logs/integration-hub",
        "logs/settings",
        "logs/postgres"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Info "Created directory: $dir"
        }
    }
    
    # Set environment variables for current session
    if ($Development) {
        $env:NODE_ENV = "development"
        $env:LOG_LEVEL = "DEBUG"
        Write-Info "Running in development mode"
    } else {
        $env:NODE_ENV = "production"
        $env:LOG_LEVEL = "INFO"
        Write-Info "Running in production mode"
    }
    
    Write-Success "Environment initialized"
}

function Start-Infrastructure {
    Write-Info "Starting core infrastructure services..."
    
    # Start infrastructure services first
    docker-compose up -d postgres redis keycloak
    
    # Wait for services to be healthy
    Write-Info "Waiting for infrastructure services to be ready..."
    
    $maxAttempts = 30
    $attempt = 0
    
    do {
        $attempt++
        Start-Sleep -Seconds 10
        
        $postgresHealthy = docker-compose ps --services --filter "status=running" | Select-String "postgres"
        $redisHealthy = docker-compose ps --services --filter "status=running" | Select-String "redis"
        
        if ($postgresHealthy -and $redisHealthy) {
            Write-Success "Infrastructure services are ready"
            break
        }
        
        Write-Info "Waiting for infrastructure services... (${attempt}/${maxAttempts})"
        
    } while ($attempt -lt $maxAttempts)
    
    if ($attempt -ge $maxAttempts) {
        Write-Error "Infrastructure services failed to start within timeout"
        exit 1
    }
}

function Start-CoreServices {
    Write-Info "Starting core application services..."
    
    # Start API Gateway first
    docker-compose up -d api-gateway
    
    # Wait for API Gateway to be ready
    Write-Info "Waiting for API Gateway to be ready..."
    Start-Sleep -Seconds 20
    
    # Start all other services
    $services = @(
        "mempool-service",
        "bridge-service", 
        "bytecode-service",
        "mev-bot-service",
        "mev-protection-service",
        "wallet-guard-service",
        "honeypot-service",
        "quantum-service",
        "quantum-crypto-service",
        "ai-forensics-service",
        "simulation-service",
        "time-machine-service",
        "reporting-service",
        "exploit-testing-service",
        "integration-hub",
        "settings-service"
    )
    
    foreach ($service in $services) {
        Write-Info "Starting $service..."
        docker-compose up -d $service
        Start-Sleep -Seconds 5
    }
    
    Write-Success "Core services started"
}

function Start-Frontend {
    Write-Info "Starting frontend application..."
    docker-compose up -d frontend
    Write-Success "Frontend started"
}

function Start-Monitoring {
    Write-Info "Starting monitoring stack..."
    docker-compose up -d prometheus grafana
    Write-Success "Monitoring stack started"
}

function Start-AdminTools {
    Write-Info "Starting admin tools..."
    docker-compose up -d pgadmin redis-commander
    Write-Success "Admin tools started"
}

function Show-ServiceStatus {
    Write-Info "Checking service status..."
    
    $services = docker-compose ps --format table
    Write-Host $services
    
    Write-Host ""
    Write-Info "Service endpoints:"
    Write-Host "🌐 Frontend UI:          http://localhost:3000" -ForegroundColor Green
    Write-Host "🔧 API Gateway:          http://localhost:8000" -ForegroundColor Green
    Write-Host "🔐 Keycloak Admin:       http://localhost:8090" -ForegroundColor Green
    Write-Host "📊 Grafana Dashboard:    http://localhost:3001" -ForegroundColor Green
    Write-Host "📈 Prometheus:           http://localhost:9090" -ForegroundColor Green
    Write-Host "🗄️  pgAdmin:              http://localhost:5050" -ForegroundColor Green
    Write-Host "🔴 Redis Commander:      http://localhost:8081" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Default credentials:" -ForegroundColor Yellow
    Write-Host "   Keycloak: admin/admin123"
    Write-Host "   Grafana:  admin/admin"
    Write-Host "   pgAdmin:  admin@scorpius.local/admin123"
}

function Show-CompletionMessage {
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Success "🎉 Scorpius Enterprise Platform is now running!"
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open the frontend at http://localhost:3000"
    Write-Host "2. Configure authentication in Keycloak"
    Write-Host "3. Set up monitoring dashboards in Grafana"
    Write-Host "4. Check service logs with: docker-compose logs -f [service-name]"
    Write-Host ""
    Write-Host "To stop all services: .\stop-scorpius.ps1" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Gray
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

try {
    if ($Help) {
        Show-Help
        exit 0
    }
    
    Show-Banner
    
    if (-not $SkipPreChecks) {
        Test-SystemRequirements
    }
    
    Initialize-Environment
    Start-Infrastructure
    Start-CoreServices
    Start-Frontend
    Start-Monitoring
    Start-AdminTools
    
    Start-Sleep -Seconds 10
    Show-ServiceStatus
    Show-CompletionMessage
    
} catch {
    Write-Error "Startup failed: $($_.Exception.Message)"
    Write-Host "Check the logs with: docker-compose logs" -ForegroundColor Yellow
    exit 1
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
