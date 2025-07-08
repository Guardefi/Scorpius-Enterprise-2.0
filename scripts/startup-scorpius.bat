@echo off
REM =============================================================================
REM Scorpius Platform Startup Script (Windows Batch)
REM =============================================================================
REM Simple batch script to start Scorpius platform

echo.
echo  ____                      _             
echo / ___|  ___ ___  ^| __^| __ ^(_^)_   _ ___   
echo \___ \ / __/ _ \^| '__^| '_ \^| ^| ^| ^| / __^|  
echo  ___^) ^| ^(_^| ^(_^) ^| ^|  ^| ^|_^) ^| ^| ^|_^| \__ \  
echo ^|____/ \___\___/^|_^|  ^| .__/^|_^\__,_^|___/  
echo                      ^|_^|                  
echo   Enterprise Cybersecurity Platform
echo.
echo 🚀 Starting Scorpius Platform...
echo ==================================================

REM Check if PowerShell is available
where powershell >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Using PowerShell script for better functionality...
    powershell -ExecutionPolicy Bypass -File "startup-scorpius.ps1"
) else (
    echo PowerShell not found, using basic startup...
    echo.
    
    REM Basic startup without PowerShell
    echo [INFO] Installing Python dependencies...
    pip install flask flask-cors pyjwt requests redis psycopg2-binary
    
    echo [INFO] Setting up frontend...
    cd frontend
    npm install
    cd ..
    
    echo [INFO] Starting infrastructure...
    docker-compose -f docker/docker-compose.dev.yml --profile dev up -d
    
    echo [INFO] Waiting for services to start...
    timeout /t 10 /nobreak >nul
    
    echo [INFO] Starting API server...
    start /B python demo-api-server.py
    
    echo [INFO] Starting frontend...
    cd frontend
    start /B npm run dev
    cd ..
    
    echo.
    echo 🎉 Scorpius Platform Started!
    echo.
    echo 📱 Access Points:
    echo    • Frontend Dashboard: http://localhost:8080
    echo    • API Server: http://localhost:8000
    echo    • Database Admin: http://localhost:5050
    echo    • Redis Admin: http://localhost:8081
    echo.
    echo Press any key to exit...
    pause >nul
)
