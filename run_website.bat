@echo off
echo ========================================================
echo   Starting LLB Real Estate Website & n8n Hub...
echo ========================================================
echo.
python serve.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Python was not found on PATH. Opening index.html directly in your default browser...
    start index.html
)
pause
