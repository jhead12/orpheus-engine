#!/bin/bash

# Find the correct frontend path with vite.config.ts
VITE_CONFIG_PATH=$(find /workspaces/orpheus-engine -name "vite.config.ts" -type f | head -n 1)

if [ -z "$VITE_CONFIG_PATH" ]; then
  echo "Error: Could not find vite.config.ts in the project."
  exit 1
fi

FRONTEND_DIR=$(dirname "$VITE_CONFIG_PATH")
ELECTRON_SCRIPT="/workspaces/orpheus-engine/scripts/start-electron.sh"

echo "Found Vite config at: $FRONTEND_DIR"

# Check if the electron script exists
if [ ! -f "$ELECTRON_SCRIPT" ]; then
  echo "Error: Could not find start-electron.sh script."
  exit 1
fi

# Create a backup of the original script
cp "$ELECTRON_SCRIPT" "${ELECTRON_SCRIPT}.bak"
echo "Created backup at ${ELECTRON_SCRIPT}.bak"

# Get relative path from /workspaces/orpheus-engine to the frontend directory
RELATIVE_PATH=$(realpath --relative-to="/workspaces/orpheus-engine" "$FRONTEND_DIR")

# Update the path in the script
sed -i "s|cd workstation/frontend|cd $RELATIVE_PATH|g" "$ELECTRON_SCRIPT"

echo "Updated start-electron.sh to use the correct frontend path: $RELATIVE_PATH"
