#!/bin/bash

# Fix tokenizers Rust compilation issues on macOS
# This script addresses the specific "invalid reference casting" error

set -e

echo "🔧 Fixing tokenizers Rust compilation issues on macOS..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is specifically for macOS"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install/update Rust with specific version
echo "📦 Setting up Rust with compatible version..."
if ! command_exists rustc; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
else
    echo "Rust found, updating..."
    rustup update
fi

# Set specific Rust version that works with tokenizers
echo "🔄 Setting Rust to stable version..."
rustup default stable
rustup component add rust-src

# Set Rust compilation flags for macOS compatibility
export RUSTFLAGS="-C target-feature=-crt-static"
export CARGO_CFG_TARGET_FEATURE=""

# Set specific environment variables for tokenizers compilation
export TOKENIZERS_PARALLELISM=false
export RUST_BACKTRACE=1

# For Apple Silicon Macs, set specific target
if [[ $(uname -m) == "arm64" ]]; then
    export CARGO_CFG_TARGET_ARCH="aarch64"
    export ARCHFLAGS="-arch arm64"
else
    export CARGO_CFG_TARGET_ARCH="x86_64"
    export ARCHFLAGS="-arch x86_64"
fi

echo "🐍 Installing tokenizers with Rust compatibility fixes..."

# Try installing a specific working version of tokenizers first
pip install --no-cache-dir --force-reinstall "tokenizers==0.13.3" \
    --global-option="--no-user-cfg" \
    --install-option="--force" || {
    
    echo "⚠️  Standard installation failed, trying alternative approach..."
    
    # Alternative: try installing from wheel if available
    pip install --no-cache-dir --force-reinstall \
        --prefer-binary \
        --only-binary=tokenizers \
        "tokenizers==0.13.3" || {
        
        echo "⚠️  Wheel installation failed, trying source with specific flags..."
        
        # Last resort: compile from source with specific flags
        RUSTFLAGS="-C opt-level=2 -C target-feature=-crt-static" \
        pip install --no-cache-dir --force-reinstall \
            --no-binary tokenizers \
            "tokenizers==0.13.3"
    }
}

echo "✅ Tokenizers installation completed!"

# Now try to install transformers and sentence-transformers
echo "📦 Installing transformers and sentence-transformers..."

pip install --no-cache-dir transformers==4.35.2
pip install --no-cache-dir sentence-transformers==2.2.2

echo "🎉 All packages installed successfully!"

# Verify installation
echo "🔍 Verifying installations..."
python -c "import tokenizers; print(f'✅ tokenizers {tokenizers.__version__} imported successfully')"
python -c "import transformers; print(f'✅ transformers {transformers.__version__} imported successfully')"
python -c "import sentence_transformers; print(f'✅ sentence_transformers {sentence_transformers.__version__} imported successfully')"

echo "🎯 All dependency issues resolved!"
