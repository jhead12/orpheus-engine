@echo off
REM UI Architecture Safety Check for Windows
REM This script verifies the OEW-main UI module integrity

echo 🔍 Checking UI Architecture Integrity...
echo.

REM Check if OEW-main exists
if not exist "workstation\frontend\OEW-main" (
    echo ❌ CRITICAL: OEW-main UI module is missing!
    echo    This directory contains the primary DAW interface
    echo    Run: git submodule update --init --recursive
    exit /b 1
)

REM Check if main UI components exist
set "components_missing=0"

if not exist "workstation\frontend\OEW-main\src\screens\workstation\components\Mixer.tsx" (
    echo ⚠️  WARNING: Mixer.tsx component missing
    set "components_missing=1"
)

if not exist "workstation\frontend\OEW-main\src\contexts\WorkstationContext.tsx" (
    if not exist "workstation\frontend\src\contexts\WorkstationContext.tsx" (
        echo ⚠️  WARNING: WorkstationContext.tsx missing from expected locations
        set "components_missing=1"
    ) else (
        echo ✅ WorkstationContext.tsx found in main frontend directory
    )
) else (
    echo ✅ WorkstationContext.tsx found in OEW-main
)

if not exist "workstation\frontend\OEW-main\src\services" (
    echo ⚠️  WARNING: UI services directory missing
    set "components_missing=1"
)

if %components_missing%==0 (
    echo ✅ UI Architecture: All critical components present
) else (
    echo.
    echo 📖 See docs\UI_ARCHITECTURE_PRINCIPLES.md for guidance
)

REM Check package.json exists
if not exist "workstation\frontend\OEW-main\package.json" (
    echo ❌ Missing OEW-main package.json - UI module incomplete
    exit /b 1
) else (
    echo ✅ UI Module: Package configuration present
)

REM Check test infrastructure
if not exist "workstation\frontend\OEW-main\src\test" (
    echo ⚠️  WARNING: UI test infrastructure missing
) else (
    echo ✅ UI Testing: Test infrastructure present
)

echo.
if %components_missing%==0 (
    echo 🏗️  UI Architecture Status: HEALTHY
) else (
    echo 🏗️  UI Architecture Status: NEEDS ATTENTION
)

echo.
echo 📚 Resources:
echo    - UI Architecture Guide: docs\UI_ARCHITECTURE_PRINCIPLES.md
echo    - Test Infrastructure: workstation\frontend\OEW-main\src\test\
echo    - Main UI Components: workstation\frontend\OEW-main\src\screens\workstation\
echo.
