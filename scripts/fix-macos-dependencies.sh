#!/bin/bash

echo "🔧 Fixing Python dependencies for macOS..."

# Upgrade pip
pip install --upgrade pip

# Install Rust (required for tokenizers)
which rustc > /dev/null
if [ $? -ne 0 ]; then
    echo "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# Install tokenizers with specific version known to work on macOS
pip install --no-build-isolation tokenizers==0.15.0

# Install sentence-transformers and its dependencies
pip install --no-deps sentence-transformers==2.2.2
pip install torch torchvision torchaudio
pip install transformers==4.35.2
pip install numpy scipy scikit-learn

echo "✅ Dependencies installation complete"
