@echo off
echo ================================
echo Stock Management System - Backend
echo ================================
echo.

cd /d "%~dp0backend"

:: Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven from https://maven.apache.org/
    pause
    exit /b 1
)

:: Check if Java is installed
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

echo Building the backend...
call mvn clean install -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Starting Spring Boot API server...
echo API will be available at: http://localhost:8080/api
echo Default credentials: admin / admin123
echo.
echo Press Ctrl+C to stop the server
echo.

call mvn spring-boot:run
pause
