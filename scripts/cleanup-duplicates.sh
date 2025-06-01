#!/bin/bash

# Repository cleanup script - consolidate files into workstation structure
# Keep agentic_rag.ipynb in root as requested

set -e

echo "🧹 Starting repository cleanup and consolidation..."

# Function to safely move files if they don't exist in destination
safe_move() {
    local src="$1"
    local dst="$2"
    
    if [[ -e "$src" ]]; then
        if [[ ! -e "$dst" ]]; then
            echo "📦 Moving $src -> $dst"
            mkdir -p "$(dirname "$dst")"
            mv "$src" "$dst"
        else
            echo "⚠️  $dst already exists, skipping $src"
            rm -rf "$src"
        fi
    fi
}

# Function to safely copy files if source is newer or destination doesn't exist
safe_copy() {
    local src="$1"
    local dst="$2"
    
    if [[ -e "$src" ]]; then
        if [[ ! -e "$dst" ]] || [[ "$src" -nt "$dst" ]]; then
            echo "📄 Copying $src -> $dst"
            mkdir -p "$(dirname "$dst")"
            cp -r "$src" "$dst"
        else
            echo "✅ $dst is up to date"
        fi
    fi
}

# Move scattered Python files to workstation backend
echo "🐍 Consolidating Python files..."
safe_move "python/" "workstation/backend/python/"
safe_move "fix_dependencies.py" "workstation/backend/scripts/fix_dependencies.py"
safe_move "fix_ipfs_dependency.py" "workstation/backend/scripts/fix_ipfs_dependency.py"
safe_move "sentence_transformers_fix.py" "workstation/backend/scripts/sentence_transformers_fix.py"

# Move data files to workstation
echo "📊 Moving data files..."
safe_move "data/" "workstation/data/"
safe_move "model/" "workstation/model/"
safe_move "chroma_db/" "workstation/backend/chroma_db/"

# Consolidate requirements files
echo "📋 Consolidating requirements..."
safe_move "requirements_compatible.txt" "workstation/backend/requirements_compatible.txt"
safe_move "requirements_macos.txt" "workstation/backend/requirements_macos.txt"
if [[ -e "requirements.txt" ]] && [[ ! -e "workstation/backend/requirements.txt" ]]; then
    safe_move "requirements.txt" "workstation/backend/requirements.txt"
fi

# Move documentation
echo "📚 Organizing documentation..."
safe_move "SETUP.md" "workstation/docs/SETUP.md"
safe_move "TOKENIZERS_FIX_SUMMARY.md" "workstation/docs/TOKENIZERS_FIX_SUMMARY.md"

# Move web assets
echo "🌐 Moving web assets..."
safe_move "assets/" "workstation/frontend/src/assets/"
safe_move "index.html" "workstation/frontend/public/index.html"
safe_move "startup.html" "workstation/frontend/public/startup.html"

# Move JavaScript utilities
echo "⚙️ Moving utilities..."
safe_move "utils/" "workstation/shared/utils/"
safe_move "packages/" "workstation/shared/packages/"

# Handle duplicate directories - merge orpheus-engine-workstation into workstation
if [[ -d "orpheus-engine-workstation" ]]; then
    echo "🔄 Merging orpheus-engine-workstation into workstation..."
    
    # Merge backend
    if [[ -d "orpheus-engine-workstation/backend" ]]; then
        echo "📦 Merging backend files..."
        rsync -av --ignore-existing "orpheus-engine-workstation/backend/" "workstation/backend/"
    fi
    
    # Merge frontend  
    if [[ -d "orpheus-engine-workstation/frontend" ]]; then
        echo "🎨 Merging frontend files..."
        rsync -av --ignore-existing "orpheus-engine-workstation/frontend/" "workstation/frontend/"
    fi
    
    # Merge shared
    if [[ -d "orpheus-engine-workstation/shared" ]]; then
        echo "🤝 Merging shared files..."
        rsync -av --ignore-existing "orpheus-engine-workstation/shared/" "workstation/shared/"
    fi
    
    # Remove the duplicate directory
    echo "🗑️  Removing orpheus-engine-workstation directory..."
    rm -rf "orpheus-engine-workstation/"
fi

# Clean up old/duplicate files in root
echo "🧹 Cleaning up root directory..."

# Remove backup files
rm -f package.json.backup* package.json.new package.json.merge-backup
rm -f README.md.new README.md.updated

# Remove temporary files
rm -f *.patch
rm -f find-absolute-imports.js update-imports.js
rm -f install-jest-types.sh setup-symlinks.js
rm -f tsconfig.json webpack.config.js

# Clean up temp directories
rm -rf temp_check/ backup_changes/

# Archive old source directories if they exist
if [[ -d "src" ]]; then
    echo "📦 Archiving old src directory..."
    mkdir -p archives/
    tar -czf "archives/old-src-$(date +%Y%m%d).tar.gz" src/
    rm -rf src/
fi

# Update package.json to reflect new structure
echo "📝 Updating package.json scripts..."
if [[ -f "package.json" ]]; then
    # Update script paths to point to workstation
    sed -i.bak 's|orpheus-engine-workstation/|workstation/|g' package.json
    rm -f package.json.bak
fi

echo "✅ Repository cleanup complete!"
echo ""
echo "📊 New structure:"
echo "📁 Root:"
echo "   - agentic_rag.ipynb (kept as requested)"
echo "   - package.json (main orchestrator)"
echo "   - README.md (main documentation)"
echo "   - scripts/ (build and setup scripts)"
echo "   - docs/ (project documentation)"
echo "   - electron/ (desktop app)"
echo "   - OEW-main/ (legacy desktop components)"
echo ""
echo "📁 workstation/:"
echo "   - frontend/ (React app)"
echo "   - backend/ (Python services)"
echo "   - shared/ (common utilities)"
echo "   - data/ (datasets and models)"
echo "   - docs/ (workstation-specific docs)"
echo ""
echo "🎉 Repository is now clean and organized!"
