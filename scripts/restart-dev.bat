@echo off
REM scripts/restart-dev.bat
REM PerfectZenkai Development Server Restart Script (Windows Batch)

echo 🔄 Restarting PerfectZenkai Development Server...
echo =============================================

echo 🛑 Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js processes stopped
) else (
    echo ℹ️  No Node.js processes were running
)

echo ⏳ Waiting for processes to terminate...
timeout /t 2 /nobreak >nul

cd /d "%~dp0.."
echo 📁 Changed to project directory: %cd%

set PORT=5173
echo 🌐 Starting development server on port 5173...
echo 🚀 Launching PerfectZenkai...
echo =============================================

npm run dev 