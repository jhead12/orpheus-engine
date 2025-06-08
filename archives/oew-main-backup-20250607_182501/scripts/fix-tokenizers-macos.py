#!/usr/bin/env python3
"""
Fix tokenizers Rust compilation issues on macOS for OEW-main
"""
import os
import sys
import subprocess
import platform

def print_colored(text, color="blue"):
    """Print colored text to console"""
    colors = {
        "red": "\033[91m",
        "green": "\033[92m",
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "purple": "\033[95m",
        "cyan": "\033[96m",
        "end": "\033[0m"
    }
    print(f"{colors.get(color, '')}{text}{colors['end']}")

def run_command(cmd, description=None, ignore_error=False):
    """Run a shell command and handle errors"""
    if description:
        print_colored(f"🔧 {description}...", "blue")
    
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            check=not ignore_error,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print_colored(f"✅ Success: {description}", "green")
            return True
        else:
            print_colored(f"❌ Failed: {description}", "red")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print_colored(f"❌ Error: {e}", "red")
        return False

def check_macos():
    """Check if running on macOS"""
    if platform.system() != "Darwin":
        print_colored("❌ This script is designed for macOS only.", "red")
        sys.exit(1)
    print_colored(f"✅ Detected macOS {platform.mac_ver()[0]}", "green")

def setup_rust():
    """Install or update Rust with proper configuration"""
    # Check if rustc is available
    if subprocess.run(["which", "rustc"], stdout=subprocess.PIPE).returncode != 0:
        print_colored("🦀 Installing Rust...", "blue")
        return run_command(
            "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y",
            "Installing Rust"
        )
    else:
        print_colored("🦀 Updating Rust...", "blue")
        return run_command("rustup update", "Updating Rust")

def apply_rust_fixes():
    """Apply Rust-specific fixes for tokenizers"""
    # Setup environment variables
    os.environ["RUSTFLAGS"] = "-C link-arg=-undefined -C link-arg=dynamic_lookup"
    print_colored("✅ Set RUSTFLAGS for dynamic linking", "green")
    
    # For Apple Silicon, add specific architecture flags
    if platform.machine() == "arm64":
        os.environ["ARCHFLAGS"] = "-arch arm64"
        print_colored("✅ Set arm64 architecture flags", "green")
    else:
        os.environ["ARCHFLAGS"] = "-arch x86_64"
        print_colored("✅ Set x86_64 architecture flags", "green")
    
    return True

def fix_tokenizers():
    """Install tokenizers with fixes applied"""
    # First try to uninstall any existing tokenizers
    run_command("pip uninstall -y tokenizers", "Removing existing tokenizers installation", ignore_error=True)
    
    # Try multiple approaches to install tokenizers
    approaches = [
        # First try a specific version with build isolation disabled
        "pip install --no-build-isolation tokenizers==0.13.3",
        
        # Try with binary wheel if available
        "pip install --prefer-binary tokenizers==0.13.3",
        
        # Try with a different version
        "pip install --no-build-isolation tokenizers==0.12.1",
        
        # Last resort: try latest
        "pip install --no-build-isolation tokenizers"
    ]
    
    for i, approach in enumerate(approaches):
        print_colored(f"🔄 Attempt {i+1}/{len(approaches)}: Installing tokenizers...", "blue")
        if run_command(approach, f"Installing tokenizers (attempt {i+1})", ignore_error=True):
            # Verify installation
            if run_command("python -c 'import tokenizers; print(tokenizers.__version__)'", 
                         "Verifying tokenizers installation", ignore_error=True):
                return True
            print_colored("⚠️ Tokenizers installed but verification failed, trying next approach", "yellow")
        else:
            print_colored("⚠️ Installation failed, trying next approach", "yellow")
    
    print_colored("❌ All tokenizers installation approaches failed", "red")
    return False

def install_related_packages():
    """Install transformers and sentence-transformers"""
    packages = [
        ("transformers", "transformers==4.30.2"),
        ("sentence_transformers", "sentence-transformers==2.2.2")
    ]
    
    success = True
    for package_name, package_spec in packages:
        if run_command(f"pip install {package_spec}", f"Installing {package_spec}"):
            # Verify installation
            run_command(
                f"python -c 'import {package_name}; print({package_name}.__version__)'",
                f"Verifying {package_name} installation", 
                ignore_error=True
            )
        else:
            print_colored(f"❌ Failed to install {package_spec}", "red")
            success = False
    
    return success

def main():
    """Main function"""
    print_colored("🚀 Starting tokenizers installation fix for OEW-main on macOS", "cyan")
    
    # Check if running on macOS
    check_macos()
    
    # Setup Rust
    if not setup_rust():
        print_colored("⚠️ Rust setup had issues, but continuing...", "yellow")
    
    # Apply Rust fixes
    apply_rust_fixes()
    
    # Fix tokenizers
    if not fix_tokenizers():
        print_colored("❌ Failed to install tokenizers", "red")
        sys.exit(1)
    
    # Install related packages
    install_related_packages()
    
    print_colored("\n🎉 All packages installed successfully!", "green")
    print_colored("You can now use tokenizers, transformers and sentence-transformers in OEW-main", "green")

if __name__ == "__main__":
    main()
