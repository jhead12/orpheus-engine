#!/bin/bash
set -e

echo "🔧 Setting up Python environment for Orpheus Engine backend..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Ensure pip is up to date
echo "🔄 Upgrading pip..."
pip install --upgrade pip setuptools wheel

# Install requirements
echo "📚 Installing dependencies..."
pip install -r requirements.txt

echo "✅ Setup complete! Virtual environment is ready."
echo "🚀 To activate the environment run: source venv/bin/activate"
