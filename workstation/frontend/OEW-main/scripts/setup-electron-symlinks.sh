#!/bin/zsh

# Get the absolute path to the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Create symlinks for electron files
echo "Creating symlinks for electron files..."

# Create @orpheus/electron symlink structure
if [ ! -L "${PROJECT_ROOT}/src/electron" ]; then
    mkdir -p "${PROJECT_ROOT}/src/electron"
    ln -s "${PROJECT_ROOT}/electron/index.ts" "${PROJECT_ROOT}/src/electron/index.ts"
    echo "Created symlink: src/electron/index.ts -> electron/index.ts"
else
    echo "Symlink already exists: src/electron"
fi

# Make sure the electron build directory exists
mkdir -p "${PROJECT_ROOT}/build/electron"

# Create symlink for electron build output
if [ ! -L "${PROJECT_ROOT}/build/electron" ]; then
    ln -s "${PROJECT_ROOT}/electron" "${PROJECT_ROOT}/build/electron"
    echo "Created symlink: build/electron -> electron"
else
    echo "Symlink already exists: build/electron"
fi

# Ensure the symlink is included in TypeScript compilation
touch "${PROJECT_ROOT}/src/electron/.gitkeep"

echo "Electron symlinks setup complete!"
