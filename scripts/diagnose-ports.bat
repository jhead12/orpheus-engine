@echo off
echo 🔍 Windows Port Diagnostic Report
echo ================================
echo.

echo 📊 Current Port Usage:
echo ----------------------
netstat -ano | findstr :3333
if %errorlevel% neq 0 (
    echo ✅ Port 3333 is available
) else (
    echo ⚠️  Port 3333 is in use
)

netstat -ano | findstr :8080  
if %errorlevel% neq 0 (
    echo ✅ Port 8080 is available
) else (
    echo ⚠️  Port 8080 is in use
)

echo.
echo 🔒 Windows Firewall Status:
echo ----------------------------
netsh advfirewall show allprofiles state

echo.
echo 🚫 Reserved Port Ranges:
echo ------------------------
echo The following ports are reserved by Windows:
netsh int ipv4 show excludedportrange protocol=tcp | findstr "51"

echo.
echo 💡 Recommendations:
echo -------------------
echo 1. Port 51204 (original error) is in reserved range 51214-51313
echo 2. Use port 3333, 8080, or 9000 instead
echo 3. If still failing, run: .\scripts\fix-windows-ports.ps1 as Administrator
echo.

pause
