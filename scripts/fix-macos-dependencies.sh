#!/bin/bash

echo "🔧 Fixing Python dependencies for macOS..."

# Function to check command existence
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Create a new virtual environment
echo "🔨 Creating virtual environment..."
python -m venv .venv
source .venv/bin/activate

# Setup Rust environment
echo "🦀 Setting up Rust environment..."
if ! command_exists rustc; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Update Rust
echo "Updating Rust..."
rustup update

# Configure Rust for Python extension building
echo "Configuring Rust for Python extensions..."
rustup target add aarch64-apple-darwin x86_64-apple-darwin

# Clean any previous failed installations
echo "🧹 Cleaning previous installations..."
pip uninstall -y tokenizers sentence-transformers transformers

# Install dependencies in correct order
echo "📦 Installing tokenizers..."
RUSTFLAGS="-C link-arg=-undefined -C link-arg=dynamic_lookup" pip install --no-build-isolation tokenizers==0.13.3

echo "📦 Installing transformers..."
pip install transformers==4.31.0

echo "📦 Installing sentence-transformers..."
pip install sentence-transformers==2.2.2
pip uninstall -y tokenizers sentence-transformers transformers
rm -rf ~/Library/Caches/pip

# Install core dependencies first
echo "📚 Installing core dependencies..."
pip install --upgrade setuptools wheel

# Install PyTorch dependencies first
echo "🔥 Installing PyTorch..."
pip install --prefer-binary torch==2.1.0 torchvision==0.16.0 torchaudio==2.1.0

# Install tokenizers with specific configuration
echo "🔧 Installing tokenizers..."
RUSTFLAGS="-C link-arg=-undefined -C link-arg=dynamic_lookup" pip install --no-cache-dir --no-build-isolation tokenizers==0.13.3

# Install transformers and sentence-transformers
echo "🤖 Installing transformers and sentence-transformers..."
pip install --prefer-binary transformers==4.33.2
pip install --prefer-binary sentence-transformers==2.2.2

# Install additional dependencies
echo "📦 Installing additional dependencies..."
pip install --prefer-binary numpy scipy scikit-learn

echo "✅ Dependencies installation complete"
