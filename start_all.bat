@echo off
REM start_all.bat - start both backend and frontend in separate terminal windows
REM Usage: double-click this file or run from PowerShell/CMD: .\start_all.bat

cd /d "%~dp0"

echo Starting Flask backend in a new window...
start "Flask Backend" cmd /k "%~dp0start_backend.bat"

REM small delay to give the backend window time to initialize
timeout /t 2 >nul

echo Starting React frontend in a new window...
start "React Frontend" cmd /k "%~dp0start_frontend.bat"

echo All start commands issued. Two new windows should be open (backend, frontend).
echo This controller window will wait here; press any key to close it.
pause >nul
