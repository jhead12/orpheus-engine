@echo off
echo Starting Vitest UI on Windows...
echo.
echo Checking for available ports...
netstat -ano | findstr :3333 > nul
if %errorlevel% == 0 (
    echo Port 3333 is in use, trying port 3334...
    set TEST_PORT=3334
) else (
    echo Port 3333 is available
    set TEST_PORT=3333
)

echo.
echo Starting Vitest UI on port %TEST_PORT%...
npx vitest --ui --port %TEST_PORT% --host 127.0.0.1

echo.
echo If you see permission errors, try:
echo 1. Running as Administrator
echo 2. Checking Windows Firewall settings
echo 3. Using a different port
echo.
echo The UI should be available at: http://127.0.0.1:%TEST_PORT%
pause
