#!/bin/bash

echo "Fixing 'vite not found' error..."

# Find all package.json files in the project
echo "Searching for package.json files..."
PACKAGE_FILES=$(find /workspaces/orpheus-engine -name "package.json" -not -path "*/node_modules/*")

# Check if vite is installed in any of the package.json files
VITE_INSTALLED=false
for package in $PACKAGE_FILES; do
  if grep -q '"vite"' "$package"; then
    VITE_INSTALLED=true
    PACKAGE_DIR=$(dirname "$package")
    echo "Found vite in $package"
    
    # Install dependencies for this package
    echo "Installing dependencies in $PACKAGE_DIR..."
    cd "$PACKAGE_DIR" && npm install
    
    # Check if vite binary exists after install
    if [ -f "$PACKAGE_DIR/node_modules/.bin/vite" ]; then
      echo "Vite installed successfully in $PACKAGE_DIR"
      
      # Create a symlink to ensure vite is available system-wide
      if [ ! -L "/usr/local/bin/vite" ]; then
        echo "Creating symlink to vite in /usr/local/bin..."
        sudo ln -sf "$PACKAGE_DIR/node_modules/.bin/vite" /usr/local/bin/vite
      fi
    fi
  fi
done

if [ "$VITE_INSTALLED" = false ]; then
  echo "Vite not found in any package.json files. Installing in root directory..."
  cd /workspaces/orpheus-engine && npm install --save-dev vite
  
  if [ -f "/workspaces/orpheus-engine/node_modules/.bin/vite" ]; then
    echo "Vite installed successfully in root directory"
    
    # Create a symlink to ensure vite is available system-wide
    if [ ! -L "/usr/local/bin/vite" ]; then
      echo "Creating symlink to vite in /usr/local/bin..."
      sudo ln -sf "/workspaces/orpheus-engine/node_modules/.bin/vite" /usr/local/bin/vite
    fi
  else
    echo "Failed to install vite. Please check npm error messages."
    exit 1
  fi
fi

echo "Vite installation and path setup complete."
echo "You should now be able to run the headless DAW without 'vite not found' errors."
