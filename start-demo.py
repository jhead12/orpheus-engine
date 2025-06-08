#!/usr/bin/env python3
"""
Orpheus Engine Demo Launcher
Starts the Jupyter notebook demo for HP AI Studio judges to evaluate the DAW
"""

import subprocess
import sys
import os
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = ['jupyter', 'numpy', 'matplotlib', 'requests']
    missing = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"❌ Missing required packages: {', '.join(missing)}")
        print("Installing missing packages...")
        subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing)
        print("✅ Dependencies installed successfully")
    else:
        print("✅ All dependencies are available")

def start_demo():
    """Start the Orpheus Engine demo in Jupyter"""
    print("🎛️ Starting Orpheus Engine DAW Demo for HP AI Studio Judges")
    print("=" * 60)
    
    # Get the project root directory
    project_root = Path(__file__).parent
    demo_notebook = project_root / "demo" / "OrpheusWebDemo.ipynb"
    
    if not demo_notebook.exists():
        print(f"❌ Demo notebook not found at {demo_notebook}")
        return False
    
    print(f"📁 Project Root: {project_root}")
    print(f"📓 Demo Notebook: {demo_notebook}")
    
    # Check dependencies
    check_dependencies()
    
    # Set environment variables
    os.environ['ORPHEUS_DEMO_MODE'] = 'true'
    os.environ['ORPHEUS_PROJECT_ROOT'] = str(project_root)
    
    print("\n🚀 Launching Jupyter Lab with Orpheus Engine Demo...")
    print("📖 The demo notebook will open automatically")
    print("🎯 This demo showcases the DAW capabilities for HP AI Studio evaluation")
    print("\n" + "=" * 60)
    
    try:
        # Start Jupyter Lab with the demo notebook
        cmd = [
            sys.executable, '-m', 'jupyter', 'lab', 
            str(demo_notebook),
            '--allow-root',
            '--no-browser' if os.environ.get('NO_BROWSER') else '',
        ]
        cmd = [arg for arg in cmd if arg]  # Remove empty strings
        
        subprocess.run(cmd, cwd=project_root)
        
    except KeyboardInterrupt:
        print("\n🛑 Demo stopped by user")
    except FileNotFoundError:
        print("❌ Jupyter Lab not found. Please install with: pip install jupyterlab")
        return False
    except Exception as e:
        print(f"❌ Error starting demo: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("🎵 Orpheus Engine - HP AI Studio Competition Demo")
    print("Digital Audio Workstation (DAW) Evaluation Interface")
    print()
    
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("Usage:")
        print("  python start-demo.py          # Start the demo with browser")
        print("  NO_BROWSER=1 python start-demo.py  # Start without opening browser")
        print()
        print("The demo will start a Jupyter Lab server with the OrpheusWebDemo.ipynb notebook.")
        print("This notebook demonstrates the DAW capabilities for HP AI Studio judges.")
        sys.exit(0)
    
    success = start_demo()
    if not success:
        sys.exit(1)
