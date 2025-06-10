#!/usr/bin/env python3
"""
Dependency installer for Orpheus Engine Demo
This script installs all required dependencies in the correct order
to avoid common installation issues.
"""

import subprocess
import sys
import os
import time
from pathlib import Path

def print_step(step, message):
    """Print a nicely formatted step message"""
    print(f"\n{'='*80}")
    print(f"STEP {step}: {message}")
    print(f"{'='*80}")

def run_pip_install(packages, timeout=300, description=""):
    """Run pip install with error handling"""
    if description:
        print(f"📦 {description}...")
    
    if isinstance(packages, str):
        cmd = [sys.executable, '-m', 'pip', 'install'] + packages.split()
    elif isinstance(packages, list):
        cmd = [sys.executable, '-m', 'pip', 'install'] + packages
    else:
        raise ValueError("Packages must be a string or list")
    
    start_time = time.time()
    try:
        process = subprocess.run(
            cmd,
            check=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        duration = time.time() - start_time
        print(f"✅ Installation successful! ({duration:.1f}s)")
        return True
    except subprocess.TimeoutExpired:
        print(f"⚠️ Installation timed out after {timeout} seconds")
        return False
    except subprocess.CalledProcessError as e:
        print(f"❌ Installation failed with error code {e.returncode}")
        print("Error output:")
        print(e.stderr)
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def main():
    """Main installation function"""
    demo_dir = Path(__file__).parent
    repo_root = demo_dir.parent
    
    print_step(1, "Installing build dependencies")
    run_pip_install("pip --upgrade", description="Upgrading pip")
    run_pip_install("setuptools wheel --upgrade", description="Installing build tools")
    run_pip_install("Cython>=0.29.0", description="Installing Cython")
    
    print_step(2, "Installing core scientific packages")
    run_pip_install("numpy>=1.24.0 scipy>=1.10.0", 
                   description="Installing NumPy and SciPy")
    run_pip_install("pandas>=2.0.0", description="Installing pandas")
    
    print_step(3, "Installing audio processing dependencies")
    run_pip_install("llvmlite>=0.39.0", description="Installing llvmlite")
    run_pip_install("numba>=0.56.4", description="Installing numba")
    run_pip_install("pooch>=1.6.0", description="Installing pooch")
    run_pip_install("audioread>=3.0.0 soundfile>=0.12.0", 
                   description="Installing audio file libraries")
    run_pip_install("librosa>=0.10.0", description="Installing librosa")
    
    print_step(4, "Installing MLflow and visualization libraries")
    run_pip_install("matplotlib>=3.7.0 seaborn>=0.12.0", 
                   description="Installing visualization libraries")
    run_pip_install("mlflow==2.15.0", description="Installing MLflow (HP AI Studio compatible version)")
    
    print_step(5, "Installing remaining dependencies from requirements.txt")
    req_file = repo_root / "requirements.txt"
    run_pip_install(["-r", str(req_file)], 
                   description=f"Installing from {req_file}", timeout=600)
    
    print("\n✨ Installation complete! ✨")
    print("\nYou should now be able to run the Orpheus demo notebooks successfully.")
    print("To start, open and run the Orpheus_MLflow_Demo.ipynb notebook.")

if __name__ == "__main__":
    main()
