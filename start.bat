@echo off
REM OSHO Transport Management System - Setup & Run Script

echo.
echo ========================================
echo OSHO Transport Management System Setup
echo ========================================
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo Dependencies installed successfully!
) else (
    echo Dependencies already installed.
)

echo.
echo ========================================
echo Starting Backend Server...
echo ========================================
echo.
echo Backend running on: http://localhost:5000
echo.

start cmd /k "cd %cd% && node server.js"

echo Waiting for backend to start...
timeout /t 2 /nobreak

echo.
echo ========================================
echo Starting Frontend Development Server...
echo ========================================
echo.
echo Frontend running on: http://localhost:5173
echo.

start cmd /k "cd %cd% && npm run dev"

echo.
echo ========================================
echo ✓ System Started Successfully!
echo ========================================
echo.
echo Login Credentials:
echo  Username: rishabh
echo  Password: Rishabh5689
echo.
echo Open your browser:
echo http://localhost:5173
echo.
pause
