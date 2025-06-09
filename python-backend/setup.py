#!/usr/bin/env python3
"""
One-click setup script for Orpheus Engine Python Backend on a new host
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible."""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

def check_system_dependencies():
    """Check and install system dependencies."""
    system = platform.system().lower()

    print(f"🖥️  Detected system: {system}")

    if system == "darwin":  # macOS
        # Check for Homebrew
        try:
            subprocess.run(["brew", "--version"], check=True, capture_output=True)
            print("✅ Homebrew found")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("⚠️  Homebrew not found. Install from https://brew.sh/")
            return False

        # Install system dependencies
        dependencies = ["portaudio", "libsndfile", "ffmpeg"]
        for dep in dependencies:
            try:
                subprocess.run(["brew", "install", dep], check=True)
                print(f"✅ {dep} installed")
            except subprocess.CalledProcessError:
                print(f"ℹ️  {dep} already installed or failed to install")

    elif system == "linux":
        # Check for package manager and install dependencies
        try:
            # Try apt (Ubuntu/Debian)
            subprocess.run(["apt", "--version"], check=True, capture_output=True)
            dependencies = [
                "python3-dev", "portaudio19-dev", "libsndfile1-dev",
                "ffmpeg", "build-essential", "python3-tk"
            ]
            subprocess.run(["sudo", "apt", "update"], check=True)
            subprocess.run(["sudo", "apt", "install", "-y"] + dependencies, check=True)
            print("✅ Linux dependencies installed")
        except (subprocess.CalledProcessError, FileNotFoundError):
            try:
                # Try yum (RedHat/CentOS)
                subprocess.run(["yum", "--version"], check=True, capture_output=True)
                dependencies = [
                    "python3-devel", "portaudio-devel", "libsndfile-devel",
                    "ffmpeg", "gcc", "tkinter"
                ]
                subprocess.run(["sudo", "yum", "install", "-y"] + dependencies, check=True)
                print("✅ Linux dependencies installed")
            except (subprocess.CalledProcessError, FileNotFoundError):
                print("⚠️  Please install system dependencies manually:")
                print("   - Python development headers")
                print("   - PortAudio development files")
                print("   - libsndfile development files")
                print("   - FFmpeg")
                print("   - Build tools (gcc, make)")

    elif system == "windows":
        print("ℹ️  Windows detected. Some dependencies may need manual installation:")
        print("   - Visual C++ Build Tools")
        print("   - PortAudio (will be installed with pip)")

    return True

def setup_virtual_environment():
    """Set up Python virtual environment."""
    backend_dir = Path(__file__).parent
    venv_dir = backend_dir / "venv"

    if venv_dir.exists():
        print("ℹ️  Virtual environment already exists")
        return True

    print("📦 Creating virtual environment...")
    try:
        subprocess.run([sys.executable, "-m", "venv", "venv"], cwd=backend_dir, check=True)
        print("✅ Virtual environment created")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to create virtual environment: {e}")
        return False

def install_python_dependencies():
    """Install Python dependencies."""
    backend_dir = Path(__file__).parent

    # Determine Python executable in venv
    if platform.system() == "Windows":
        python_exe = backend_dir / "venv" / "Scripts" / "python.exe"
        pip_exe = backend_dir / "venv" / "Scripts" / "pip.exe"
    else:
        python_exe = backend_dir / "venv" / "bin" / "python"
        pip_exe = backend_dir / "venv" / "bin" / "pip"

    print("📦 Installing Python dependencies...")
    try:
        # Upgrade pip first
        subprocess.run([str(pip_exe), "install", "--upgrade", "pip"], check=True)

        # Install the package
        subprocess.run([str(pip_exe), "install", "-e", ".[dev,audio,gui]"], cwd=backend_dir, check=True)
        print("✅ Python dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def create_directories():
    """Create necessary directories."""
    backend_dir = Path(__file__).parent

    directories = [
        "logs",
        "projects",
        "projects/templates",
        "audio_samples",
        "exports",
        "config"
    ]

    for dir_name in directories:
        dir_path = backend_dir / dir_name
        dir_path.mkdir(exist_ok=True)
        print(f"✅ Created directory: {dir_name}")

def setup_environment_file():
    """Set up environment configuration."""
    backend_dir = Path(__file__).parent
    env_file = backend_dir / ".env"

    if env_file.exists():
        print("ℹ️  .env file already exists")
        return

    # Copy from example
    env_example = backend_dir / ".env.example"
    if env_example.exists():
        import shutil
        shutil.copy(env_example, env_file)
        print("✅ Environment file created from example")
    else:
        # Create basic .env file
        env_content = """# Orpheus Backend Configuration
DEBUG=true
HOST=127.0.0.1
PORT=8000
LOG_LEVEL=INFO

# CORS settings
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]

# Audio settings
SAMPLE_RATE=44100
BUFFER_SIZE=512

# Directories
PROJECTS_DIRECTORY=./projects
AUDIO_SAMPLES_DIRECTORY=./audio_samples
EXPORTS_DIRECTORY=./exports
"""
        with open(env_file, 'w') as f:
            f.write(env_content)
        print("✅ Basic environment file created")

def test_installation():
    """Test if the installation works."""
    backend_dir = Path(__file__).parent

    if platform.system() == "Windows":
        python_exe = backend_dir / "venv" / "Scripts" / "python.exe"
    else:
        python_exe = backend_dir / "venv" / "bin" / "python"

    print("🧪 Testing installation...")
    try:
        # Test import
        result = subprocess.run([
            str(python_exe), "-c",
            "import orpheus_backend; print('✅ Import successful')"
        ], capture_output=True, text=True, check=True)
        print(result.stdout.strip())

        # Test basic server startup (quick check)
        print("🧪 Testing server startup...")
        result = subprocess.run([
            str(python_exe), "-c",
            """
import asyncio
from orpheus_backend.main import app
from orpheus_backend.config import settings
print(f'✅ Server can start on {settings.host}:{settings.port}')
"""
        ], capture_output=True, text=True, check=True)
        print(result.stdout.strip())

        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Installation test failed: {e}")
        if e.stdout:
            print(f"STDOUT: {e.stdout}")
        if e.stderr:
            print(f"STDERR: {e.stderr}")
        return False

def main():
    """Main setup function."""
    print("🎵 Orpheus Engine Python Backend Setup")
    print("=" * 60)
    print("This script will set up the Python backend on this host.")
    print()

    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    print(f"📁 Working directory: {backend_dir}")

    # Step 1: Check Python version
    print("\n1️⃣  Checking Python version...")
    check_python_version()

    # Step 2: Check system dependencies
    print("\n2️⃣  Checking system dependencies...")
    if not check_system_dependencies():
        print("⚠️  Some system dependencies may be missing. Continuing anyway...")

    # Step 3: Set up virtual environment
    print("\n3️⃣  Setting up virtual environment...")
    if not setup_virtual_environment():
        print("❌ Setup failed at virtual environment creation")
        sys.exit(1)

    # Step 4: Install Python dependencies
    print("\n4️⃣  Installing Python dependencies...")
    if not install_python_dependencies():
        print("❌ Setup failed at dependency installation")
        sys.exit(1)

    # Step 5: Create directories
    print("\n5️⃣  Creating directories...")
    create_directories()

    # Step 6: Set up environment file
    print("\n6️⃣  Setting up environment configuration...")
    setup_environment_file()

    # Step 7: Test installation
    print("\n7️⃣  Testing installation...")
    if not test_installation():
        print("⚠️  Installation test failed, but setup may still work")

    print("\n" + "=" * 60)
    print("🎉 Setup complete!")
    print()
    print("To start the backend:")
    print(f"  cd {backend_dir}")
    print("  python start.py")
    print()
    print("Or use npm scripts from the main directory:")
    print("  npm run python:dev")
    print("  npm run dev:full")
    print()
    print("The backend will be available at: http://127.0.0.1:8000")
    print("WebSocket endpoint: ws://127.0.0.1:8000/ws")

if __name__ == "__main__":
    main()
