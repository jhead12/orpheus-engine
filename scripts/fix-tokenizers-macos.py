#!/usr/bin/env python3
"""
Fix tokenizers installation issues on macOS by trying multiple approaches
and avoiding Rust compilation issues.
"""

import subprocess
import sys
import platform
import os

def run_command(cmd, description="", ignore_errors=False):
    """Run a shell command and return success status"""
    print(f"🔄 {description}")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - Success")
        if result.stdout.strip():
            print(result.stdout.strip())
        return True
    except subprocess.CalledProcessError as e:
        if ignore_errors:
            print(f"⚠️  {description} - Failed (continuing): {e}")
            return False
        else:
            print(f"❌ {description} - Failed: {e}")
            if e.stdout:
                print(f"STDOUT: {e.stdout}")
            if e.stderr:
                print(f"STDERR: {e.stderr}")
            return False

def check_rust_installation():
    """Check if Rust is properly installed"""
    try:
        result = subprocess.run(["rustc", "--version"], capture_output=True, text=True)
        print(f"✅ Rust installed: {result.stdout.strip()}")
        return True
    except FileNotFoundError:
        print("❌ Rust not found")
        return False

def setup_environment():
    """Set up environment variables for compilation"""
    env_vars = {
        'RUSTFLAGS': '-C target-feature=-crt-static',
        'CARGO_CFG_TARGET_FEATURE': '',
        'TOKENIZERS_PARALLELISM': 'false',
        'RUST_BACKTRACE': '1'
    }
    
    # Set architecture-specific flags
    if platform.machine() == 'arm64':
        env_vars['CARGO_CFG_TARGET_ARCH'] = 'aarch64'
        env_vars['ARCHFLAGS'] = '-arch arm64'
    else:
        env_vars['CARGO_CFG_TARGET_ARCH'] = 'x86_64'
        env_vars['ARCHFLAGS'] = '-arch x86_64'
    
    for key, value in env_vars.items():
        os.environ[key] = value
        print(f"🔧 Set {key}={value}")

def install_tokenizers():
    """Try multiple approaches to install tokenizers"""
    
    # List of approaches to try in order of preference
    approaches = [
        # Try specific working version with binary wheel
        {
            'name': 'Binary wheel installation (tokenizers 0.13.3)',
            'command': 'pip install --no-cache-dir --force-reinstall --prefer-binary --only-binary=tokenizers "tokenizers==0.13.3"'
        },
        # Try with different tokenizers version
        {
            'name': 'Binary wheel installation (tokenizers 0.14.1)',
            'command': 'pip install --no-cache-dir --force-reinstall --prefer-binary --only-binary=tokenizers "tokenizers==0.14.1"'
        },
        # Try latest with binary
        {
            'name': 'Latest binary wheel installation',
            'command': 'pip install --no-cache-dir --force-reinstall --prefer-binary --only-binary=tokenizers tokenizers'
        },
        # Try conda-forge if available
        {
            'name': 'Conda-forge installation',
            'command': 'conda install -c conda-forge tokenizers -y'
        },
        # Compile from source with specific flags (last resort)
        {
            'name': 'Source compilation (tokenizers 0.13.3)',
            'command': 'pip install --no-cache-dir --force-reinstall --no-binary tokenizers "tokenizers==0.13.3"'
        }
    ]
    
    for approach in approaches:
        print(f"\n🔄 Trying: {approach['name']}")
        if run_command(approach['command'], approach['name'], ignore_errors=True):
            # Verify the installation
            if run_command('python -c "import tokenizers; print(f\\"tokenizers {tokenizers.__version__} imported successfully\\")"', "Verify tokenizers import", ignore_errors=True):
                print(f"✅ Successfully installed tokenizers using: {approach['name']}")
                return True
        print(f"❌ Failed: {approach['name']}")
    
    return False

def install_dependent_packages():
    """Install transformers and sentence-transformers"""
    packages = [
        ('transformers', 'transformers==4.35.2'),
        ('sentence-transformers', 'sentence-transformers==2.2.2')
    ]
    
    for package_name, package_spec in packages:
        print(f"\n📦 Installing {package_name}...")
        if run_command(f'pip install --no-cache-dir {package_spec}', f"Install {package_name}"):
            import_name = package_name.replace("-", "_")
            verify_cmd = f'python -c "import {import_name}; print(f\'✅ {package_name} imported successfully\')"'
            run_command(verify_cmd, f"Verify {package_name}")
        else:
            print(f"❌ Failed to install {package_name}")
            return False
    
    return True

def main():
    print("🚀 Starting tokenizers and transformers installation fix for macOS")
    
    # Check if we're on macOS
    if platform.system() != 'Darwin':
        print("❌ This script is specifically for macOS")
        sys.exit(1)
    
    print(f"Python version: {sys.version}")
    print(f"Architecture: {platform.machine()}")
    print(f"Platform: {platform.system()}")
    
    # Check Rust installation
    if not check_rust_installation():
        print("Installing Rust...")
        if not run_command('curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y', "Install Rust"):
            print("❌ Failed to install Rust")
            sys.exit(1)
        
        # Source the cargo environment
        cargo_env = os.path.expanduser('~/.cargo/env')
        if os.path.exists(cargo_env):
            run_command(f'source {cargo_env}', "Source Rust environment")
    
    # Set up environment
    setup_environment()
    
    # Try to install tokenizers
    if not install_tokenizers():
        print("❌ All tokenizers installation methods failed")
        print("\nPossible solutions:")
        print("1. Update Xcode command line tools: xcode-select --install")
        print("2. Try using a different Python distribution (pyenv, conda, etc.)")
        print("3. Consider using transformers without tokenizers")
        sys.exit(1)
    
    # Install dependent packages
    if install_dependent_packages():
        print("🎉 All packages installed successfully!")
    else:
        print("⚠️  Some packages failed to install")
        sys.exit(1)

if __name__ == '__main__':
    main()
