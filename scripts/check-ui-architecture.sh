#!/bin/bash
# UI Architecture Safety Check
# This script verifies the OEW-main UI module integrity

echo "🔍 Checking UI Architecture Integrity..."
echo ""

# Check if OEW-main exists
if [ ! -d "workstation/frontend/OEW-main" ]; then
    echo "❌ CRITICAL: OEW-main UI module is missing!"
    echo "   This directory contains the primary DAW interface"
    echo "   Run: git submodule update --init --recursive"
    exit 1
fi

# Check if main UI components exist
ui_components=(
    "workstation/frontend/OEW-main/src/screens/workstation/components/Mixer.tsx"
    "workstation/frontend/OEW-main/src/screens/workstation/components/Timeline.tsx"
    "workstation/frontend/OEW-main/src/contexts/WorkstationContext.tsx"
    "workstation/frontend/OEW-main/src/services"
)

missing_components=()

for component in "${ui_components[@]}"; do
    if [ ! -e "$component" ]; then
        missing_components+=("$component")
    fi
done

if [ ${#missing_components[@]} -gt 0 ]; then
    echo "⚠️  WARNING: Some UI components are missing:"
    for component in "${missing_components[@]}"; do
        echo "   - $component"
    done
    echo ""
    echo "📖 See docs/UI_ARCHITECTURE_PRINCIPLES.md for guidance"
else
    echo "✅ UI Architecture: All critical components present"
fi

# Check package.json exists
if [ ! -f "workstation/frontend/OEW-main/package.json" ]; then
    echo "❌ Missing OEW-main package.json - UI module incomplete"
    exit 1
else
    echo "✅ UI Module: Package configuration present"
fi

# Check test infrastructure
if [ ! -d "workstation/frontend/OEW-main/src/test" ]; then
    echo "⚠️  WARNING: UI test infrastructure missing"
else
    echo "✅ UI Testing: Test infrastructure present"
fi

echo ""
echo "🏗️  UI Architecture Status: $([ ${#missing_components[@]} -eq 0 ] && echo "HEALTHY" || echo "NEEDS ATTENTION")"
echo ""
echo "📚 Resources:"
echo "   - UI Architecture Guide: docs/UI_ARCHITECTURE_PRINCIPLES.md"
echo "   - Test Infrastructure: workstation/frontend/OEW-main/src/test/"
echo "   - Main UI Components: workstation/frontend/OEW-main/src/screens/workstation/"
echo ""
