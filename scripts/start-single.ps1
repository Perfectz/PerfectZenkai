# start-single.ps1
# Ensures only one instance of the development server runs at a time

param(
    [string]$Port = "5173"
)

Write-Host "Starting PerfectZenkai development server..." -ForegroundColor Green
Write-Host "Checking for existing processes..." -ForegroundColor Yellow

# Function to kill processes on specific ports
function Stop-ProcessOnPort {
    param([string]$PortNumber)
    
    try {
        $connections = netstat -ano | Select-String ":$PortNumber "
        
        if ($connections) {
            Write-Host "Found processes using port $PortNumber" -ForegroundColor Yellow
            
            foreach ($connection in $connections) {
                $parts = $connection.ToString().Split(' ', [StringSplitOptions]::RemoveEmptyEntries)
                $pid = $parts[-1]
                
                if ($pid -match '^\d+$') {
                    try {
                        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                        if ($process) {
                            Write-Host "Stopping process: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
                            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                            Start-Sleep -Milliseconds 500
                        }
                    }
                    catch {
                        Write-Host "Could not stop process $pid" -ForegroundColor Yellow
                    }
                }
            }
        }
    }
    catch {
        Write-Host "Error checking port $PortNumber" -ForegroundColor Yellow
    }
}

# Function to kill Node.js processes running Vite
function Stop-ViteProcesses {
    try {
        $viteProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -like "*vite*" -or 
            $_.CommandLine -like "*dev*" -or
            $_.MainWindowTitle -like "*Vite*"
        }
        
        if ($viteProcesses) {
            Write-Host "Found Vite processes running" -ForegroundColor Yellow
            foreach ($process in $viteProcesses) {
                Write-Host "Stopping Vite process: $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Red
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 1
        }
    }
    catch {
        Write-Host "Error checking Vite processes" -ForegroundColor Yellow
    }
}

# Check and stop processes on common development ports
$portsToCheck = @("5173", "5174", "5175", "5176", "5177", "5178", "5179", "5180")

foreach ($portToCheck in $portsToCheck) {
    Stop-ProcessOnPort -PortNumber $portToCheck
}

# Stop any existing Vite processes
Stop-ViteProcesses

Write-Host "Cleanup complete" -ForegroundColor Green
Write-Host "Starting development server..." -ForegroundColor Green

# Ensure we're in the correct directory
$projectPath = "C:\AppProjects\PerfectZenkai"
if ((Get-Location).Path -ne $projectPath) {
    Write-Host "Changing to project directory: $projectPath" -ForegroundColor Yellow
    Set-Location $projectPath
}

# Start the development server
try {
    Write-Host "Running: npm run dev" -ForegroundColor Cyan
    npm run dev
}
catch {
    Write-Host "Failed to start development server: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 