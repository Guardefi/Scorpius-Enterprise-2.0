# =============================================================================
# Scorpius Platform Verification Script
# =============================================================================

Write-Host @"
 ____                      _             
/ ___|  ___ ___  _ __ _ __ (_)_   _ ___   
\___ \ / __/ _ \| '__| '_ \| | | | / __|  
 ___) | (_| (_) | |  | |_) | | |_| \__ \  
|____/ \___\___/|_|  | .__/|_|\__,_|___/  
                     |_|                  
  Platform Verification Script
"@ -ForegroundColor Green

Write-Host "🔍 Verifying Scorpius Platform Configuration..." -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

$errors = @()
$warnings = @()

# Check required files
Write-Host "`n📄 Checking required files..." -ForegroundColor Blue

$requiredFiles = @(
    "docker-compose.yml",
    ".env",
    "startup-scorpius.ps1",
    "stop-scorpius.ps1"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file - MISSING" -ForegroundColor Red
        $errors += "Missing required file: $file"
    }
}

# Check for outdated files
Write-Host "`n🗑️  Checking for outdated files..." -ForegroundColor Blue

$outdatedFiles = @(
    "docker-compose-working.yml",
    "docker-compose-simple.yml", 
    "docker-compose-fixed.yml",
    "docker-compose.override.yml"
)

foreach ($file in $outdatedFiles) {
    if (Test-Path $file) {
        Write-Host "  ⚠️  $file - Should be removed" -ForegroundColor Yellow
        $warnings += "Outdated file found: $file"
    } else {
        Write-Host "  ✅ $file - Correctly removed" -ForegroundColor Green
    }
}

# Check Docker Compose syntax
Write-Host "`n🐳 Checking Docker Compose configuration..." -ForegroundColor Blue

try {
    $configCheck = docker-compose config 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ docker-compose.yml syntax is valid" -ForegroundColor Green
    } else {
        Write-Host "  ❌ docker-compose.yml has syntax errors" -ForegroundColor Red
        $errors += "Docker Compose syntax error: $configCheck"
    }
} catch {
    Write-Host "  ❌ Could not validate Docker Compose" -ForegroundColor Red
    $errors += "Cannot validate Docker Compose - is Docker installed?"
}

# Check environment file
Write-Host "`n⚙️  Checking environment configuration..." -ForegroundColor Blue

if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    $requiredEnvVars = @(
        "POSTGRES_DB",
        "POSTGRES_USER", 
        "POSTGRES_PASSWORD",
        "REDIS_PASSWORD",
        "KEYCLOAK_ADMIN",
        "JWT_SECRET"
    )
    
    foreach ($envVar in $requiredEnvVars) {
        if ($envContent -match "$envVar=") {
            Write-Host "  ✅ $envVar" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $envVar - Missing" -ForegroundColor Red
            $errors += "Missing environment variable: $envVar"
        }
    }
    
    # Check for default passwords
    if ($envContent -match "POSTGRES_PASSWORD=scorpius_secure_2024") {
        Write-Host "  ⚠️  Using default PostgreSQL password" -ForegroundColor Yellow
        $warnings += "Consider changing default PostgreSQL password"
    }
    
    if ($envContent -match "KEYCLOAK_ADMIN_PASSWORD=admin123") {
        Write-Host "  ⚠️  Using default Keycloak password" -ForegroundColor Yellow
        $warnings += "Consider changing default Keycloak password"
    }
} else {
    Write-Host "  ❌ .env file missing" -ForegroundColor Red
    $errors += "Environment file (.env) is missing"
}

# Check directory structure
Write-Host "`n📁 Checking directory structure..." -ForegroundColor Blue

$requiredDirs = @(
    "backend",
    "frontend",
    "config",
    "monitoring"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "  ✅ $dir/" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $dir/ - Missing (may be optional)" -ForegroundColor Yellow
        $warnings += "Directory not found: $dir"
    }
}

# Check logs directory
if (-not (Test-Path "logs")) {
    Write-Host "  ℹ️  logs/ - Will be created on startup" -ForegroundColor Cyan
} else {
    Write-Host "  ✅ logs/" -ForegroundColor Green
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
Write-Host "📊 VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Gray

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "`n🎉 All checks passed! Platform is ready to launch." -ForegroundColor Green
    Write-Host "`nNext step: Run .\startup-scorpius.ps1" -ForegroundColor Cyan
} elseif ($errors.Count -eq 0) {
    Write-Host "`n✅ No critical errors found." -ForegroundColor Green
    Write-Host "⚠️  $($warnings.Count) warning(s) found:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "   • $warning" -ForegroundColor Yellow
    }
    Write-Host "`nPlatform should work, but consider addressing warnings." -ForegroundColor Cyan
} else {
    Write-Host "`n❌ $($errors.Count) error(s) found:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host "   • $err" -ForegroundColor Red
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠️  $($warnings.Count) warning(s) found:" -ForegroundColor Yellow
        foreach ($warn in $warnings) {
            Write-Host "   • $warn" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n❌ Please fix errors before launching the platform." -ForegroundColor Red
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Gray
