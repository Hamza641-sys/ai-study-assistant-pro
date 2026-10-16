@echo off
echo ========================================
echo    AI Study Assistant Pro - Starting...
echo ========================================
echo.

echo Starting Backend Server (Port 5000)...
start "AI Study - Backend" cmd /k "cd /d "%~dp0server" && node server.js"

timeout /t 3 /nobreak > nul

echo Starting Frontend Client (Port 5173)...
start "AI Study - Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

timeout /t 4 /nobreak > nul

echo.
echo ========================================
echo  Both servers started!
echo  Open browser: http://localhost:5173
echo ========================================
echo.

start "" "http://localhost:5173"

pause
