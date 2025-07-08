# Scorpius Docker Management Script for Windows
# Usage: .\scorpius.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "Scorpius Docker Management Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  up          - Start all services" -ForegroundColor Yellow
    Write-Host "  down        - Stop all services" -ForegroundColor Yellow
    Write-Host "  restart     - Restart all services" -ForegroundColor Yellow
    Write-Host "  build       - Build all images" -ForegroundColor Yellow
    Write-Host "  rebuild     - Rebuild all images from scratch" -ForegroundColor Yellow
    Write-Host "  logs        - Show logs for all services" -ForegroundColor Yellow
    Write-Host "  status      - Show status of all services" -ForegroundColor Yellow
    Write-Host "  clean       - Remove all containers, networks, and volumes" -ForegroundColor Yellow
    Write-Host "  health      - Show health status of services" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  db-shell    - Open PostgreSQL shell" -ForegroundColor Cyan
    Write-Host "  redis-shell - Open Redis CLI" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Magenta
    Write-Host "  .\scorpius.ps1 up" -ForegroundColor White
    Write-Host "  .\scorpius.ps1 logs" -ForegroundColor White
    Write-Host "  .\scorpius.ps1 status" -ForegroundColor White
}

function Start-Services {
    Write-Host "Starting all Scorpius services..." -ForegroundColor Green
    docker compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Services started successfully!" -ForegroundColor Green
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "API Gateway: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "PgAdmin: http://localhost:8083" -ForegroundColor Cyan
        Write-Host "Redis Commander: http://localhost:8084" -ForegroundColor Cyan
        Write-Host "Keycloak: http://localhost:8090" -ForegroundColor Cyan
    }
}

function Stop-Services {
    Write-Host "Stopping all Scorpius services..." -ForegroundColor Yellow
    docker compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Services stopped successfully!" -ForegroundColor Green
    }
}

function Restart-Services {
    Write-Host "Restarting all Scorpius services..." -ForegroundColor Yellow
    Stop-Services
    Start-Services
}

function Build-Images {
    Write-Host "Building all Docker images..." -ForegroundColor Blue
    docker compose build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Images built successfully!" -ForegroundColor Green
    }
}

function Rebuild-Images {
    Write-Host "Rebuilding all Docker images from scratch..." -ForegroundColor Blue
    docker compose build --no-cache --pull
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Images rebuilt successfully!" -ForegroundColor Green
    }
}

function Show-Logs {
    Write-Host "Showing logs for all services (Ctrl+C to exit)..." -ForegroundColor Blue
    docker compose logs -f
}

function Show-Status {
    Write-Host "Service Status:" -ForegroundColor Green
    docker compose ps
}

function Clean-Environment {
    Write-Host "Cleaning up Docker environment..." -ForegroundColor Red
    $confirm = Read-Host "This will remove all containers, networks, and volumes. Continue? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        docker compose down -v --remove-orphans
        docker system prune -f
        Write-Host "Environment cleaned successfully!" -ForegroundColor Green
    } else {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
    }
}

function Show-Health {
    Write-Host "Health Status:" -ForegroundColor Green
    docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
}

function Open-DbShell {
    Write-Host "Opening PostgreSQL shell..." -ForegroundColor Cyan
    docker compose exec db psql -U postgres -d scorpius
}

function Open-RedisShell {
    Write-Host "Opening Redis CLI..." -ForegroundColor Cyan
    docker compose exec redis redis-cli
}

# Main command handling
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "up" { Start-Services }
    "down" { Stop-Services }
    "restart" { Restart-Services }
    "build" { Build-Images }
    "rebuild" { Rebuild-Images }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "clean" { Clean-Environment }
    "health" { Show-Health }
    "db-shell" { Open-DbShell }
    "redis-shell" { Open-RedisShell }
    default {
        Write-Host "Unknown command: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
        exit 1
    }
}
