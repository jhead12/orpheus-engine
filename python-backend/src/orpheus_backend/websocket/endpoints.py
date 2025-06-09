"""
WebSocket endpoints for real-time communication.
"""

import json
import logging
import uuid
from typing import Dict, Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Request

from .manager import WebSocketManager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["websocket"])


def get_websocket_manager(request: Request) -> WebSocketManager:
    """Dependency to get WebSocket manager from app state."""
    return request.app.state.websocket_manager


@router.websocket("/")
async def websocket_endpoint(
    websocket: WebSocket,
    client_id: str = None
):
    """Main WebSocket endpoint for real-time communication."""

    # Generate client ID if not provided
    if not client_id:
        client_id = str(uuid.uuid4())

    # Get WebSocket manager from app state
    websocket_manager: WebSocketManager = websocket.app.state.websocket_manager

    try:
        # Connect the client
        await websocket_manager.connect(websocket, client_id)

        # Send initial connection info
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "data": {"client_id": client_id},
            "timestamp": None
        }))

        # Listen for messages
        while True:
            try:
                data = await websocket.receive_text()
                message_data = json.loads(data)

                # Handle the message
                await websocket_manager.handle_client_message(client_id, message_data)

            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON from client {client_id}: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "data": {"message": "Invalid JSON format"},
                    "timestamp": None
                }))
            except Exception as e:
                logger.error(f"Error processing message from client {client_id}: {e}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "data": {"message": "Error processing message"},
                    "timestamp": None
                }))

    except WebSocketDisconnect:
        logger.info(f"WebSocket client {client_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
    finally:
        # Clean up the connection
        websocket_manager.disconnect(client_id)


@router.websocket("/audio")
async def audio_websocket_endpoint(
    websocket: WebSocket,
    client_id: str = None
):
    """WebSocket endpoint specifically for audio-related real-time updates."""

    if not client_id:
        client_id = str(uuid.uuid4())

    websocket_manager: WebSocketManager = websocket.app.state.websocket_manager

    try:
        await websocket_manager.connect(websocket, client_id)

        # Auto-subscribe to audio-related channels
        websocket_manager.join_room(client_id, "transport")
        websocket_manager.join_room(client_id, "audio_levels")
        websocket_manager.join_room(client_id, "playhead")
        websocket_manager.join_room(client_id, "performance")

        # Send subscription confirmation
        await websocket.send_text(json.dumps({
            "type": "audio_subscribed",
            "data": {
                "client_id": client_id,
                "subscriptions": ["transport", "audio_levels", "playhead", "performance"]
            },
            "timestamp": None
        }))

        # Listen for messages
        while True:
            try:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                await websocket_manager.handle_client_message(client_id, message_data)

            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON from audio client {client_id}: {e}")
            except Exception as e:
                logger.error(f"Error processing audio message from client {client_id}: {e}")

    except WebSocketDisconnect:
        logger.info(f"Audio WebSocket client {client_id} disconnected")
    except Exception as e:
        logger.error(f"Audio WebSocket error for client {client_id}: {e}")
    finally:
        websocket_manager.disconnect(client_id)


@router.websocket("/projects")
async def projects_websocket_endpoint(
    websocket: WebSocket,
    client_id: str = None
):
    """WebSocket endpoint specifically for project-related real-time updates."""

    if not client_id:
        client_id = str(uuid.uuid4())

    websocket_manager: WebSocketManager = websocket.app.state.websocket_manager

    try:
        await websocket_manager.connect(websocket, client_id)

        # Auto-subscribe to project-related channels
        websocket_manager.join_room(client_id, "projects")
        websocket_manager.join_room(client_id, "tracks")

        # Send subscription confirmation
        await websocket.send_text(json.dumps({
            "type": "projects_subscribed",
            "data": {
                "client_id": client_id,
                "subscriptions": ["projects", "tracks"]
            },
            "timestamp": None
        }))

        # Listen for messages
        while True:
            try:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                await websocket_manager.handle_client_message(client_id, message_data)

            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON from projects client {client_id}: {e}")
            except Exception as e:
                logger.error(f"Error processing projects message from client {client_id}: {e}")

    except WebSocketDisconnect:
        logger.info(f"Projects WebSocket client {client_id} disconnected")
    except Exception as e:
        logger.error(f"Projects WebSocket error for client {client_id}: {e}")
    finally:
        websocket_manager.disconnect(client_id)
