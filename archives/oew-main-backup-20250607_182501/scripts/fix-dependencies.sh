#!/bin/bash
# Fix dependencies installation issues for OEW-main, specifically focusing on tokenizers

set -e  # Exit on error

echo "🚀 Starting dependencies fix for OEW-main"

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  This script is optimized for macOS but will try to work on other platforms"
fi

# Check Python version
PYTHON_VERSION=$(python --version 2>&1)
echo "🐍 Using $PYTHON_VERSION"

# Fix Rust environment if needed
if ! command -v rustc &> /dev/null; then
    echo "🦀 Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo "🦀 Updating Rust..."
    rustup update
fi

echo "🔧 Setting up environment for tokenizers compilation..."

# Set environment variables to fix compilation issues
export RUSTFLAGS="-C link-arg=-undefined -C link-arg=dynamic_lookup"
export TOKENIZERS_PARALLELISM=false

# Architecture-specific flags
if [[ $(uname -m) == "arm64" ]]; then
    export ARCHFLAGS="-arch arm64"
    echo "✅ Set architecture flags for Apple Silicon"
else
    export ARCHFLAGS="-arch x86_64"
    echo "✅ Set architecture flags for Intel Mac"
fi

# Clean any failed installations
echo "🧹 Cleaning previous installations..."
pip uninstall -y tokenizers transformers sentence-transformers

# Approach 1: Use a compatible version with build isolation disabled
echo "🔄 Installing tokenizers (Approach 1)..."
if pip install --no-build-isolation tokenizers==0.13.3; then
    echo "✅ Successfully installed tokenizers"
else
    # Approach 2: Try binary wheel
    echo "🔄 Installing tokenizers (Approach 2)..."
    if pip install --prefer-binary tokenizers==0.13.3; then
        echo "✅ Successfully installed tokenizers"
    else
        # Approach 3: Try older version
        echo "🔄 Installing tokenizers (Approach 3)..."
        pip install --no-build-isolation tokenizers==0.12.1
    fi
fi

# Verify tokenizers installation
if python -c "import tokenizers; print(f'Tokenizers version: {tokenizers.__version__}')"; then
    echo "✓ Tokenizers verification successful"
else
    echo "❌ Failed to import tokenizers"
    exit 1
fi

# Install transformers and sentence-transformers
echo "📦 Installing transformers..."
pip install transformers==4.30.2

echo "📦 Installing sentence-transformers..."
pip install sentence-transformers==2.2.2

echo "🎉 All dependencies installed successfully!"
echo "You can now use tokenizers, transformers and sentence-transformers in OEW-main"
