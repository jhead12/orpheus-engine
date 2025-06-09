#!/usr/bin/env python3
"""
Startup script for Orpheus Engine Python Backend
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    """Main startup function."""
    print("🎵 Orpheus Engine Python Backend Startup")
    print("=" * 50)

    # Change to the python-backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)

    # Check if virtual environment exists
    venv_dir = backend_dir / "venv"
    if not venv_dir.exists():
        print("📦 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"], check=True)
        print("✅ Virtual environment created")

    # Determine the correct Python executable
    if sys.platform == "win32":
        python_exe = venv_dir / "Scripts" / "python.exe"
        pip_exe = venv_dir / "Scripts" / "pip.exe"
    else:
        python_exe = venv_dir / "bin" / "python"
        pip_exe = venv_dir / "bin" / "pip"

    # Install dependencies
    print("📦 Installing dependencies...")
    subprocess.run([str(pip_exe), "install", "-e", "."], check=True)
    print("✅ Dependencies installed")

    # Create necessary directories
    dirs_to_create = ["logs", "projects", "audio_samples", "exports", "projects/templates"]
    for dir_name in dirs_to_create:
        Path(dir_name).mkdir(exist_ok=True)
    print("✅ Directories created")

    # Start the server
    print("🚀 Starting Orpheus Backend...")
    cmd = [
        str(python_exe), "-m", "uvicorn",
        "src.orpheus_backend.main:app",
        "--reload",
        "--host", "127.0.0.1",
        "--port", "8000"
    ]

    try:
        subprocess.run(cmd, check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
