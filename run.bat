@echo off
echo ================================
echo Stock Management System
echo ================================
echo.
echo Starting Backend and Frontend...
echo.

:: Start backend in a new window
start "Backend - Stock Management" cmd /c "%~dp0run-backend.bat"

:: Wait a moment for backend to begin starting
timeout /t 5 /nobreak >nul

:: Start frontend in a new window
start "Frontend - Stock Management" cmd /c "%~dp0run-frontend.bat"

echo.
echo Both servers are starting in separate windows.
echo   Backend API:  http://localhost:8080/api
echo   Frontend UI:  http://localhost:3000
echo.
pause
