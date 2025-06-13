# scripts/restart-dev.ps1
# PerfectZenkai Development Server Restart Script

Write-Host "Restarting PerfectZenkai Development Server..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Kill all Node.js processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "Node.js processes stopped" -ForegroundColor Green
} catch {
    Write-Host "No Node.js processes were running" -ForegroundColor Gray
}

# Kill any processes using common development ports
$ports = @(5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180, 5181, 5182, 5183, 5184, 5185, 5186, 5187, 5188, 5189, 5190)

Write-Host "Checking for processes on development ports..." -ForegroundColor Yellow
foreach ($port in $ports) {
    try {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        if ($process) {
            Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
            Write-Host "Freed port $port" -ForegroundColor Green
        }
    } catch {
        # Port not in use, continue
    }
}

# Wait a moment for processes to fully terminate
Write-Host "Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Navigate to project directory if not already there
$projectPath = Split-Path $PSScriptRoot -Parent
if ((Get-Location).Path -ne $projectPath) {
    Set-Location $projectPath
    Write-Host "Changed to project directory: $projectPath" -ForegroundColor Blue
}

# Set consistent port via environment variable
$env:PORT = "5173"
Write-Host "Starting development server on port 5173..." -ForegroundColor Cyan

# Start the development server
Write-Host "Launching PerfectZenkai..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

try {
    npm run dev
} catch {
    Write-Host "Failed to start development server" -ForegroundColor Red
    Write-Host "Please ensure you are in the project directory and dependencies are installed." -ForegroundColor Yellow
    exit 1
}