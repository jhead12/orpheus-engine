"""
Mini DAW FastAPI Application
Integrates existing AudioEngine, WebSocket, and API components
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, List

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

# Import existing components
from ..audio.engine import AudioEngine
from ..websocket.manager import WebSocketManager
from ..api.audio import router as audio_router
from ..websocket.endpoints import router as websocket_router
from ..models import TransportState, Track

# Import our Mini DAW
from .mini_daw import MiniDAW, create_mini_daw

logger = logging.getLogger(__name__)


# Application lifespan - manages startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown"""
    # Startup
    logger.info("🚀 Starting Mini DAW v1.0...")

    try:
        # Create Mini DAW instance
        mini_daw = await create_mini_daw()

        # Store in app state for dependency injection
        app.state.mini_daw = mini_daw
        app.state.audio_engine = mini_daw.audio_engine
        app.state.websocket_manager = mini_daw.websocket_manager

        logger.info("✅ Mini DAW initialized successfully!")

        yield  # Application runs here

    except Exception as e:
        logger.error(f"❌ Failed to start Mini DAW: {e}")
        raise

    finally:
        # Shutdown
        logger.info("🔌 Shutting down Mini DAW...")
        if hasattr(app.state, 'mini_daw'):
            await app.state.mini_daw.shutdown()
        logger.info("✅ Mini DAW shutdown complete")


# Create FastAPI application
def create_mini_daw_app() -> FastAPI:
    """Create Mini DAW FastAPI application"""

    app = FastAPI(
        title="Mini DAW v1.0",
        description="4-Channel Digital Audio Workstation using Orpheus Engine",
        version="1.0.0",
        lifespan=lifespan
    )

    # CORS middleware for web browser access
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure as needed
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include existing API routes
    app.include_router(audio_router, prefix="/api")
    app.include_router(websocket_router, prefix="/ws")

    # Mini DAW specific routes
    @app.get("/")
    async def root():
        """Mini DAW root endpoint"""
        return HTMLResponse("""
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mini DAW v1.0</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .container { max-width: 800px; margin: 0 auto; }
                .status-card { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .transport-controls { display: flex; gap: 10px; margin: 20px 0; }
                button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; }
                .play { background: #4CAF50; color: white; }
                .pause { background: #FF9800; color: white; }
                .stop { background: #f44336; color: white; }
                .record { background: #E91E63; color: white; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎵 Mini DAW v1.0</h1>
                <p>4-Channel Digital Audio Workstation powered by Orpheus Engine</p>

                <div class="status-card">
                    <h3>📊 Status</h3>
                    <p>Mini DAW is running and ready for audio production!</p>
                    <ul>
                        <li>✓ 4 audio tracks available</li>
                        <li>✓ Transport controls active</li>
                        <li>✓ WebSocket real-time sync enabled</li>
                        <li>✓ REST API endpoints available</li>
                    </ul>
                </div>

                <div class="transport-controls">
                    <h3>🎮 Transport Controls</h3>
                    <button class="play" onclick="transportControl('play')">▶️ Play</button>
                    <button class="pause" onclick="transportControl('pause')">⏸️ Pause</button>
                    <button class="stop" onclick="transportControl('stop')">⏹️ Stop</button>
                    <button class="record" onclick="transportControl('record')">🔴 Record</button>
                </div>

                <div class="status-card">
                    <h3>🔗 API Endpoints</h3>
                    <ul>
                        <li><code>GET /api/mini-daw/status</code> - Get DAW status</li>
                        <li><code>GET /api/audio/transport/state</code> - Get transport state</li>
                        <li><code>POST /api/audio/transport/play</code> - Start playback</li>
                        <li><code>POST /api/audio/transport/pause</code> - Pause playback</li>
                        <li><code>POST /api/audio/transport/stop</code> - Stop playback</li>
                        <li><code>POST /api/audio/transport/record</code> - Start recording</li>
                        <li><code>GET /api/audio/tracks</code> - Get all tracks</li>
                        <li><code>WS /ws/audio</code> - WebSocket for real-time updates</li>
                    </ul>
                </div>

                <div class="status-card">
                    <h3>📚 Next Steps</h3>
                    <ol>
                        <li>Connect your frontend application to the API endpoints</li>
                        <li>Use WebSocket connection for real-time transport updates</li>
                        <li>Load audio files and create clips on tracks</li>
                        <li>Build your custom UI components</li>
                    </ol>
                </div>
            </div>

            <script>
                async function transportControl(action) {
                    try {
                        const response = await fetch(`/api/audio/transport/${action}`, {
                            method: 'POST'
                        });
                        const result = await response.json();
                        console.log(`${action}:`, result);
                        alert(`${action}: ${result.message || result.status}`);
                    } catch (error) {
                        console.error('Error:', error);
                        alert(`Error with ${action}: ${error.message}`);
                    }
                }
            </script>
        </body>
        </html>
        """)

    @app.get("/api/mini-daw/status")
    async def get_mini_daw_status(mini_daw: MiniDAW = Depends(get_mini_daw)):
        """Get Mini DAW status"""
        return mini_daw.get_status()

    @app.get("/api/mini-daw/tracks", response_model=List[Track])
    async def get_mini_daw_tracks(mini_daw: MiniDAW = Depends(get_mini_daw)):
        """Get Mini DAW tracks"""
        return mini_daw.get_tracks()

    @app.put("/api/mini-daw/tracks/{track_id}")
    async def update_mini_daw_track(
        track_id: str,
        track_data: Dict,
        mini_daw: MiniDAW = Depends(get_mini_daw)
    ):
        """Update Mini DAW track"""
        success = await mini_daw.update_track(track_id, **track_data)
        if not success:
            raise HTTPException(status_code=404, detail="Track not found")
        return {"status": "success", "track_id": track_id}

    return app


# Dependency injection
def get_mini_daw(request: Request) -> MiniDAW:
    """Dependency to get Mini DAW from app state"""
    return request.app.state.mini_daw


# Factory function
def create_app() -> FastAPI:
    """Create and configure the Mini DAW application"""
    return create_mini_daw_app()


if __name__ == "__main__":
    import uvicorn

    # Create application
    app = create_app()

    # Run development server
    print("🚀 Starting Mini DAW v1.0 development server...")
    print("📍 Access at: http://localhost:8000")
    print("🔌 WebSocket at: ws://localhost:8000/ws/audio")
    print("📖 API docs at: http://localhost:8000/docs")

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
