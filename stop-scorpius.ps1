# =============================================================================
# Scorpius Enterprise Platform Stop Script (PowerShell)
# =============================================================================

param(
    [switch]$RemoveVolumes,
    [switch]$RemoveImages,
    [switch]$Verbose,
    [switch]$Help
)

# Set error action preference
$ErrorActionPreference = "Continue"

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
  Enterprise Cybersecurity Platform v1.4
"@ -ForegroundColor Red
    
    Write-Host "🛑 Stopping Scorpius Enterprise Platform..." -ForegroundColor Red
    Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Host ""
}

function Show-Help {
    Write-Host @"
Scorpius Enterprise Platform Stop Script

USAGE:
    .\stop-scorpius.ps1 [OPTIONS]

OPTIONS:
    -RemoveVolumes    Remove all data volumes (WARNING: This will delete all data!)
    -RemoveImages     Remove all Docker images
    -Verbose          Enable verbose output
    -Help             Show this help message

EXAMPLES:
    .\stop-scorpius.ps1                    # Stop services only
    .\stop-scorpius.ps1 -RemoveVolumes     # Stop and remove all data
    .\stop-scorpius.ps1 -RemoveImages      # Stop and remove images

"@ -ForegroundColor Yellow
}

function Stop-Services {
    Write-Info "Stopping all Scorpius services..."
    
    try {
        # Stop all services
        docker-compose down
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "All services stopped successfully"
        } else {
            Write-Warning "Some services may not have stopped cleanly"
        }
    }
    catch {
        Write-Error "Error stopping services: $($_.Exception.Message)"
    }
}

function Remove-Volumes {
    if ($RemoveVolumes) {
        Write-Warning "Removing all data volumes..."
        Write-Warning "This will permanently delete all database data, logs, and configurations!"
        
        $confirmation = Read-Host "Are you sure you want to continue? Type 'YES' to confirm"
        
        if ($confirmation -eq "YES") {
            try {
                docker-compose down -v
                
                # Remove named volumes
                $volumes = @(
                    "scorpius-postgres-data",
                    "scorpius-redis-data",
                    "scorpius-keycloak-data",
                    "scorpius-prometheus-data",
                    "scorpius-grafana-data",
                    "scorpius-pgadmin-data",
                    "scorpius-time-machine-data",
                    "scorpius-reporting-data"
                )
                
                foreach ($volume in $volumes) {
                    docker volume rm $volume -f 2>$null
                }
                
                Write-Success "All volumes removed"
            }
            catch {
                Write-Error "Error removing volumes: $($_.Exception.Message)"
            }
        } else {
            Write-Info "Volume removal cancelled"
        }
    }
}

function Remove-Images {
    if ($RemoveImages) {
        Write-Info "Removing Docker images..."
        
        try {
            # Remove images built by docker-compose
            docker-compose down --rmi all
            
            # Clean up any dangling images
            docker image prune -f
            
            Write-Success "Docker images removed"
        }
        catch {
            Write-Error "Error removing images: $($_.Exception.Message)"
        }
    }
}

function Cleanup-System {
    Write-Info "Performing system cleanup..."
    
    try {
        # Remove unused networks
        docker network prune -f
        
        # Remove unused containers
        docker container prune -f
        
        Write-Success "System cleanup completed"
    }
    catch {
        Write-Error "Error during cleanup: $($_.Exception.Message)"
    }
}

function Show-Status {
    Write-Info "Final status check..."
    
    $runningContainers = docker ps --filter "name=scorpius" --format "table {{.Names}}\t{{.Status}}"
    
    if ($runningContainers) {
        Write-Warning "Some containers are still running:"
        Write-Host $runningContainers
    } else {
        Write-Success "All Scorpius containers have been stopped"
    }
    
    Write-Host ""
    Write-Info "System resources:"
    $dockerStats = docker system df
    Write-Host $dockerStats
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
    
    Stop-Services
    Remove-Volumes
    Remove-Images
    Cleanup-System
    Show-Status
    
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Success "🎉 Scorpius Enterprise Platform stopped successfully!"
    Write-Host ""
    Write-Host "To restart the platform: .\startup-scorpius.ps1" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Gray
    
} catch {
    Write-Error "Stop operation failed: $($_.Exception.Message)"
    exit 1
}
    # Ignore errors
}

Write-Host "✅ Scorpius Platform stopped" -ForegroundColor Green
Write-Host "All services have been terminated."
