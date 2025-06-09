"""
Main FastAPI application for Orpheus Backend
"""

import asyncio
import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import settings
from .audio.engine import AudioEngine
from .api import audio, projects, system
from .websocket.manager import WebSocketManager
from .websocket import endpoints as websocket_endpoints
from .native.system_integration import SystemIntegration


# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(settings.log_file) if settings.log_file else logging.NullHandler(),
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    logger.info("🎵 Starting Orpheus Engine Python Backend...")

    # Initialize components
    audio_engine = AudioEngine()
    websocket_manager = WebSocketManager()
    system_integration = SystemIntegration()

    # Store in app state
    app.state.audio_engine = audio_engine
    app.state.websocket_manager = websocket_manager
    app.state.system_integration = system_integration

    # Start audio engine
    await audio_engine.initialize()

    # Start system integration (if enabled)
    if settings.enable_gui_dialogs:
        system_integration.start()

    logger.info("✅ Backend initialized successfully")

    yield

    # Cleanup
    logger.info("🛑 Shutting down backend...")
    await audio_engine.shutdown()
    system_integration.stop()
    logger.info("✅ Backend shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="Orpheus Engine Backend",
    description="High-performance Python backend for Orpheus Engine DAW",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(audio.router)
app.include_router(projects.router)
app.include_router(system.router)

# Include WebSocket routes
app.include_router(websocket_endpoints.router)

# Serve static files (React build) if they exist
static_dir = Path("../dist/browser")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

    @app.get("/")
    async def serve_app():
        """Serve the React app."""
        return {"message": "Orpheus Engine Backend", "frontend": "available at /static"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "audio_engine": "initialized" if hasattr(app.state, "audio_engine") else "not_initialized"
    }


def main():
    """Main entry point for the backend."""
    logger.info(f"🚀 Starting Orpheus Backend on {settings.host}:{settings.port}")

    uvicorn.run(
        "orpheus_backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
        ws_ping_interval=settings.websocket_ping_interval,
        ws_ping_timeout=settings.websocket_ping_timeout,
    )


if __name__ == "__main__":
    main()
