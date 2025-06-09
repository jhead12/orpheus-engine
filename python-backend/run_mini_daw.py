#!/usr/bin/env python3
"""
Mini DAW Launcher
Quick launcher for the Mini DAW v1.0 backend
"""

import asyncio
import sys
import logging
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

try:
    import uvicorn
    from src.orpheus_backend.daw_generator.mini_daw_app import create_app
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("💡 Make sure you've installed the Python backend dependencies:")
    print("   cd python-backend")
    print("   pip install -e .")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def main():
    """Launch Mini DAW backend server"""
    print("🎵 Starting Mini DAW v1.0 Backend Server...")
    print("=" * 50)
    print("🎯 Mini DAW Features:")
    print("   • 4 audio tracks")
    print("   • Transport controls (play/pause/stop/record)")
    print("   • Real-time WebSocket sync")
    print("   • REST API endpoints")
    print("   • Basic track mixing")
    print("=" * 50)
    print("📍 Server will be available at:")
    print("   • Main UI: http://localhost:8000")
    print("   • API Docs: http://localhost:8000/docs")
    print("   • WebSocket: ws://localhost:8000/ws/audio")
    print("=" * 50)
    print("🛑 Press Ctrl+C to stop the server")
    print()

    try:
        # Create Mini DAW application
        app = create_app()

        # Run the server
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True
        )

    except KeyboardInterrupt:
        print("\n🔌 Mini DAW server stopped by user")

    except Exception as e:
        print(f"\n❌ Error starting Mini DAW server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
