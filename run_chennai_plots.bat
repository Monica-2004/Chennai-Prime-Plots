@echo off
title Chennai Prime Plots - Interactive Map & Selling Portal
echo =========================================================================
echo   Starting Chennai Prime Plots - Interactive Map & Selling Portal
echo =========================================================================
echo.
echo Launching http://localhost:8080/chennai-plots.html in your browser...
echo.

start "" "http://localhost:8080/chennai-plots.html"

netstat -ano | findstr :8080 | findstr LISTENING >nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Server is already running on port 8080.
    echo Website is live at: http://localhost:8080/chennai-plots.html
    echo.
    pause
    exit /b
)

echo [INFO] Starting local server via Python...
python serve.py
if %ERRORLEVEL% NEQ 0 (
    echo Python not found on PATH. Opening HTML directly...
    start "" "chennai-plots.html"
)
pause
