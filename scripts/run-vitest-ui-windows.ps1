# PowerShell script to run Vitest UI with proper Windows port handling
Write-Host "Starting Vitest UI on Windows..." -ForegroundColor Green
Write-Host ""

# Function to check if port is available
function Test-Port {
    param([int]$Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    }
    catch {
        return $false
    }
}

# Find available port
$testPort = 3333
if (-not (Test-Port $testPort)) {
    Write-Host "Port $testPort is in use, trying port 3334..." -ForegroundColor Yellow
    $testPort = 3334
    if (-not (Test-Port $testPort)) {
        Write-Host "Port $testPort is also in use, trying port 3335..." -ForegroundColor Yellow
        $testPort = 3335
    }
}

Write-Host "Using port: $testPort" -ForegroundColor Green
Write-Host ""

# Set environment variables for the process
$env:VITEST_UI_PORT = $testPort

try {
    Write-Host "Starting Vitest UI on port $testPort..." -ForegroundColor Cyan
    Write-Host "UI will be available at: http://127.0.0.1:$testPort" -ForegroundColor Yellow
    Write-Host ""
    
    # Run vitest with explicit configuration
    & npx vitest --ui --port $testPort --host "127.0.0.1" --open false
}
catch {
    Write-Host "Error starting Vitest UI: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check if Windows Firewall is blocking the port" -ForegroundColor White
    Write-Host "2. Try running PowerShell as Administrator" -ForegroundColor White
    Write-Host "3. Check if any antivirus software is blocking Node.js" -ForegroundColor White
    Write-Host "4. Try a different port by editing vitest.config.ts" -ForegroundColor White
}
