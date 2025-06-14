# scripts/preview-stable.ps1
# Stable Preview Server Script - Always runs on same IP:Port

Write-Host "Preparing Stable Preview Server..." -ForegroundColor Yellow
Write-Host "Target: http://10.0.0.9:4173/" -ForegroundColor Cyan

# Kill any existing processes on port 4173
Write-Host "Stopping any existing servers on port 4173..." -ForegroundColor Yellow
$processes = netstat -ano | Select-String ":4173" | Select-String "LISTENING"
if ($processes) {
    $processes | ForEach-Object {
        $line = $_.Line
        $processId = ($line -split "\s+")[-1]
        Write-Host "   Killing process $processId" -ForegroundColor Red
        taskkill /PID $processId /F 2>$null
    }
} else {
    Write-Host "   No existing processes found" -ForegroundColor Green
}

# Wait a moment for ports to free up
Start-Sleep -Seconds 2

# Build the project
Write-Host "Building production version..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    
    # Start preview server
    Write-Host "Starting preview server..." -ForegroundColor Yellow
    Write-Host "Install PWA from: http://10.0.0.9:4173/" -ForegroundColor Green
    Write-Host "   (This URL will always be the same)" -ForegroundColor Gray
    
    npm run preview
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
} 