<#
.SYNOPSIS
Finds and terminates the process running on a specified TCP port.

.DESCRIPTION
This script is used to free up a network port by force-killing the process that is currently listening on it. It is designed to be used as part of the E2E test setup to prevent "port in use" errors.

.PARAMETER Port
The TCP port number to clear.

.EXAMPLE
PS C:\> .\kill-port.ps1 -Port 5173
This command will find the process listening on port 5173 and terminate it.

.NOTES
You may need to adjust your script execution policy to run this script.
To do so, run the following command in an elevated PowerShell session:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
#>
param (
    [Parameter(Mandatory=$true)]
    [int]$Port
)

try {
    Write-Host "Searching for process on port $Port..."
    $processInfo = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($processInfo) {
        $processId = $processInfo.OwningProcess
        Write-Host "Success: Found process with ID $processId on port $Port. Terminating..."
        Stop-Process -Id $processId -Force -ErrorAction Stop
        Write-Host "Success: Process $processId terminated successfully."
    } else {
        Write-Host "Success: Port $Port is already free. No action needed."
    }
}
catch {
    Write-Error "Error: Failed to terminate process on port $Port. Error: $($_.Exception.Message)"
    exit 1
}

Write-Host "Success: Port cleanup complete for port $Port." 