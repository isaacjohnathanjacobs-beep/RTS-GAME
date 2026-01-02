@echo off
REM Simple script to run the RTS game with a local web server

echo =========================================
echo   RTS Game - Local Server Launcher
echo =========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting server with Python...
    echo Game will be available at: http://localhost:8000
    echo.
    echo Press Ctrl+C to stop the server
    echo.
    python -m http.server 8000
) else (
    echo Python not found. Trying Python3...
    python3 --version >nul 2>&1
    if %errorlevel% == 0 (
        echo Starting server with Python 3...
        echo Game will be available at: http://localhost:8000
        echo.
        echo Press Ctrl+C to stop the server
        echo.
        python3 -m http.server 8000
    ) else (
        echo Python not found. Please install Python or use another method.
        echo.
        echo Alternative methods:
        echo 1. Install Node.js and run: npx http-server -p 8000
        echo 2. Use VS Code Live Server extension
        echo 3. Install Python from https://www.python.org/
        pause
        exit /b 1
    )
)
