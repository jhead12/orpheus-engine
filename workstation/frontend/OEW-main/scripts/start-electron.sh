#!/bin/bash

# Script to launch the Electron app with proper development settings

# Navigate to the project root directory
cd "$(dirname "$0")/.."

# Build TypeScript files for Electron
echo "🔨 Building Electron files..."
npm run build:electron

# Set environment variables
export ELECTRON_DISABLE_SECURITY_WARNINGS=true

# Start the app
echo "🚀 Starting Electron..."
electron .
