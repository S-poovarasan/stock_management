@echo off
echo ================================
echo Stock Management System - Frontend (React)
echo ================================
echo.

cd /d "%~dp0frontend"

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting React dev server (Vite)...
echo Frontend will be available at: http://localhost:3000
echo Make sure the backend is running on http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
pause
