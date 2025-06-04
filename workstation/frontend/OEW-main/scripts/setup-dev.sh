#!/bin/bash

# Script to set up the development environment

# Navigate to the project root directory
cd "$(dirname "$0")/.."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create required directories
echo "📁 Creating necessary directories..."
mkdir -p build/electron

# Create Python directory for audio analysis scripts
echo "🐍 Setting up Python environment for audio analysis..."
mkdir -p electron/python
cp electron/AudioAnalysis/analyze_audio.py electron/python/

# Setup permissions
echo "🔒 Setting file permissions..."
chmod +x scripts/*.sh

echo "✅ Development environment setup complete!"
echo "▶️ Run 'npm run dev' to start the development server"
