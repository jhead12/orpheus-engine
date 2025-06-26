# PowerShell script to run Vitest UI with proper Windows port handling
Write-Host "Starting Vitest UI on Windows..." -ForegroundColor Green
Write-Host ""

# Function to check if port is available
Write-Host ""

try {
    Write-Host "Starting Vitest UI..." -ForegroundColor Cyan
    Write-Host "UI will be available at the address displayed in the terminal output" -ForegroundColor Yellow
    Write-Host ""
    
    # Run vitest with explicit configuration
    & npx vitest --ui --host "127.0.0.1" --open false
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
