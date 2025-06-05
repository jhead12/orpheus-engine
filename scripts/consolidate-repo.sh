#!/bin/bash

# Clean up and consolidate repository structure
# This script moves scattered files into the workstation folder

set -e

echo "🧹 Starting repository cleanup and consolidation..."

# Create backup of current state
echo "📦 Creating backup before cleanup..."
tar -czf "cleanup-backup-$(date +%Y%m%d-%H%M%S).tar.gz" \
    orpheus-engine-workstation/ OEW-main/ python/ model/ temp_check/ utils/ src/ packages/ 2>/dev/null || true

# Create necessary directories in workstation if they don't exist
mkdir -p workstation/scripts
mkdir -p workstation/docs
mkdir -p workstation/assets
mkdir -p workstation/electron
mkdir -p workstation/python
mkdir -p workstation/utils
mkdir -p workstation/packages
mkdir -p workstation/archives

echo "📂 Moving files to workstation structure..."

# Move electron-related files
if [ -d "electron/" ]; then
    echo "Moving electron/ to workstation/electron/"
    cp -r electron/* workstation/electron/ 2>/dev/null || true
fi

# Move OEW-main to workstation/electron/legacy
if [ -d "OEW-main/" ]; then
    echo "Moving OEW-main/ to workstation/electron/legacy/"
    mkdir -p workstation/electron/legacy
    cp -r OEW-main/* workstation/electron/legacy/ 2>/dev/null || true
fi

# Move python scripts
if [ -d "python/" ]; then
    echo "Moving python/ to workstation/python/"
    cp -r python/* workstation/python/ 2>/dev/null || true
fi

# Move utilities
if [ -d "utils/" ]; then
    echo "Moving utils/ to workstation/utils/"
    cp -r utils/* workstation/utils/ 2>/dev/null || true
fi

# Move packages
if [ -d "packages/" ]; then
    echo "Moving packages/ to workstation/packages/"
    cp -r packages/* workstation/packages/ 2>/dev/null || true
fi

# Move model files to workstation/backend/models
if [ -d "model/" ]; then
    echo "Moving model/ to workstation/backend/models/"
    mkdir -p workstation/backend/models
    cp -r model/* workstation/backend/models/ 2>/dev/null || true
fi

# Move assets
if [ -d "assets/" ]; then
    echo "Moving assets/ to workstation/assets/"
    cp -r assets/* workstation/assets/ 2>/dev/null || true
fi

# Move archives
if [ -d "archives/" ]; then
    echo "Moving archives/ to workstation/archives/"
    cp -r archives/* workstation/archives/ 2>/dev/null || true
fi

# Move data and chroma_db if they're in root
if [ -d "data/" ] && [ ! -d "workstation/data" ]; then
    echo "Moving data/ to workstation/data/"
    cp -r data workstation/ 2>/dev/null || true
fi

if [ -d "chroma_db/" ] && [ ! -d "workstation/chroma_db" ]; then
    echo "Moving chroma_db/ to workstation/chroma_db/"
    cp -r chroma_db workstation/ 2>/dev/null || true
fi

# Move documentation files that should be in workstation
echo "📄 Moving documentation files..."
if [ -f "MACOS_DEPENDENCIES_FIX.md" ]; then
    mv "MACOS_DEPENDENCIES_FIX.md" workstation/docs/ 2>/dev/null || true
fi

# Copy any additional requirements files to workstation/backend
echo "📋 Consolidating requirements files..."
for req_file in requirements*.txt; do
    if [ -f "$req_file" ] && [[ "$req_file" != "workstation/"* ]]; then
        echo "Copying $req_file to workstation/backend/"
        cp "$req_file" workstation/backend/ 2>/dev/null || true
    fi
done

echo "✨ Verifying workstation structure..."
echo "Current workstation contents:"
ls -la workstation/

echo "🗑️  Ready to remove duplicate directories..."
echo "The following directories can be safely removed after verification:"
echo "- orpheus-engine-workstation/ (duplicate of workstation/)"
echo "- electron/ (moved to workstation/electron/)"
echo "- OEW-main/ (moved to workstation/electron/legacy/)"
echo "- python/ (moved to workstation/python/)"
echo "- utils/ (moved to workstation/utils/)"
echo "- packages/ (moved to workstation/packages/)"
echo "- model/ (moved to workstation/backend/models/)"
echo "- assets/ (moved to workstation/assets/)"
echo "- temp_check/ (temporary directory)"

echo ""
echo "📋 Files that will remain in root:"
echo "- agentic_rag.ipynb (as requested)"
echo "- package.json (main project config)"
echo "- README.md (main documentation)"
echo "- CHANGELOG.md"
echo "- SETUP.md"
echo "- .git/ .github/ .gitignore .npmrc .vscode/"
echo "- scripts/ (deployment and setup scripts)"
echo "- docs/ (project-level documentation)"

echo ""
echo "✅ Consolidation preparation complete!"
echo "Run the cleanup with: bash scripts/cleanup-duplicates.sh"
