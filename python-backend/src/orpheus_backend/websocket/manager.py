"""
WebSocket manager for real-time communication between frontend and backend.
"""

import asyncio
import json
import logging
from typing import Dict, List, Set, Any, Optional
from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from ..models import TransportState, Track, Project, PerformanceMetrics

logger = logging.getLogger(__name__)


class WebSocketMessage(BaseModel):
    """WebSocket message structure."""
    type: str
    data: Any
    timestamp: datetime = datetime.now()
    id: Optional[str] = None


class ConnectionInfo(BaseModel):
    """Information about a WebSocket connection."""
    websocket: WebSocket
    client_id: str
    connected_at: datetime
    subscriptions: Set[str] = set()


class WebSocketManager:
    """Manages WebSocket connections and real-time communication."""

    def __init__(self):
        self.connections: Dict[str, ConnectionInfo] = {}
        self.room_connections: Dict[str, Set[str]] = {}  # Room -> Set of client_ids
        self.message_history: List[WebSocketMessage] = []
        self.max_history = 1000

    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        """Accept a new WebSocket connection."""
        try:
            await websocket.accept()

            connection_info = ConnectionInfo(
                websocket=websocket,
                client_id=client_id,
                connected_at=datetime.now(),
                subscriptions=set()
            )

            self.connections[client_id] = connection_info

            # Send welcome message
            await self.send_to_client(client_id, WebSocketMessage(
                type="connection_established",
                data={"client_id": client_id, "server_time": datetime.now().isoformat()}
            ))

            logger.info(f"WebSocket client {client_id} connected")

        except Exception as e:
            logger.error(f"Error connecting WebSocket client {client_id}: {e}")
            raise

    def disconnect(self, client_id: str) -> None:
        """Remove a WebSocket connection."""
        try:
            if client_id in self.connections:
                # Remove from all rooms
                for room_clients in self.room_connections.values():
                    room_clients.discard(client_id)

                del self.connections[client_id]
                logger.info(f"WebSocket client {client_id} disconnected")

        except Exception as e:
            logger.error(f"Error disconnecting WebSocket client {client_id}: {e}")

    async def send_to_client(self, client_id: str, message: WebSocketMessage) -> bool:
        """Send a message to a specific client."""
        try:
            if client_id not in self.connections:
                logger.warning(f"Attempted to send message to unknown client: {client_id}")
                return False

            connection = self.connections[client_id]
            message_data = {
                "type": message.type,
                "data": message.data,
                "timestamp": message.timestamp.isoformat(),
                "id": message.id
            }

            await connection.websocket.send_text(json.dumps(message_data, default=str))
            return True

        except WebSocketDisconnect:
            logger.info(f"Client {client_id} disconnected during send")
            self.disconnect(client_id)
            return False
        except Exception as e:
            logger.error(f"Error sending message to client {client_id}: {e}")
            return False

    async def broadcast(self, message: WebSocketMessage, exclude_clients: Optional[Set[str]] = None) -> int:
        """Broadcast a message to all connected clients."""
        if exclude_clients is None:
            exclude_clients = set()

        sent_count = 0
        disconnected_clients = []

        for client_id in self.connections:
            if client_id not in exclude_clients:
                success = await self.send_to_client(client_id, message)
                if success:
                    sent_count += 1
                else:
                    disconnected_clients.append(client_id)

        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)

        # Store message in history
        self._add_to_history(message)

        return sent_count

    async def broadcast_to_room(self, room: str, message: WebSocketMessage, exclude_clients: Optional[Set[str]] = None) -> int:
        """Broadcast a message to all clients in a specific room."""
        if room not in self.room_connections:
            return 0

        if exclude_clients is None:
            exclude_clients = set()

        sent_count = 0
        disconnected_clients = []

        for client_id in self.room_connections[room]:
            if client_id not in exclude_clients and client_id in self.connections:
                success = await self.send_to_client(client_id, message)
                if success:
                    sent_count += 1
                else:
                    disconnected_clients.append(client_id)

        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)

        return sent_count

    def join_room(self, client_id: str, room: str) -> bool:
        """Add a client to a room."""
        try:
            if client_id not in self.connections:
                return False

            if room not in self.room_connections:
                self.room_connections[room] = set()

            self.room_connections[room].add(client_id)
            self.connections[client_id].subscriptions.add(room)

            logger.debug(f"Client {client_id} joined room {room}")
            return True

        except Exception as e:
            logger.error(f"Error adding client {client_id} to room {room}: {e}")
            return False

    def leave_room(self, client_id: str, room: str) -> bool:
        """Remove a client from a room."""
        try:
            if room in self.room_connections:
                self.room_connections[room].discard(client_id)

                # Clean up empty rooms
                if not self.room_connections[room]:
                    del self.room_connections[room]

            if client_id in self.connections:
                self.connections[client_id].subscriptions.discard(room)

            logger.debug(f"Client {client_id} left room {room}")
            return True

        except Exception as e:
            logger.error(f"Error removing client {client_id} from room {room}: {e}")
            return False

    def _add_to_history(self, message: WebSocketMessage) -> None:
        """Add a message to the history buffer."""
        self.message_history.append(message)

        # Keep history size under limit
        if len(self.message_history) > self.max_history:
            self.message_history = self.message_history[-self.max_history:]

    def get_connection_count(self) -> int:
        """Get the number of active connections."""
        return len(self.connections)

    def get_room_count(self, room: str) -> int:
        """Get the number of clients in a room."""
        return len(self.room_connections.get(room, set()))

    async def handle_client_message(self, client_id: str, message_data: dict) -> None:
        """Handle incoming message from a client."""
        try:
            message_type = message_data.get("type")
            data = message_data.get("data", {})

            if message_type == "subscribe":
                # Subscribe to specific message types or rooms
                subscriptions = data.get("subscriptions", [])
                for subscription in subscriptions:
                    self.join_room(client_id, subscription)

                await self.send_to_client(client_id, WebSocketMessage(
                    type="subscribed",
                    data={"subscriptions": subscriptions}
                ))

            elif message_type == "unsubscribe":
                # Unsubscribe from specific message types or rooms
                subscriptions = data.get("subscriptions", [])
                for subscription in subscriptions:
                    self.leave_room(client_id, subscription)

                await self.send_to_client(client_id, WebSocketMessage(
                    type="unsubscribed",
                    data={"subscriptions": subscriptions}
                ))

            elif message_type == "ping":
                # Respond to ping with pong
                await self.send_to_client(client_id, WebSocketMessage(
                    type="pong",
                    data={"timestamp": datetime.now().isoformat()}
                ))

            elif message_type == "get_history":
                # Send recent message history
                recent_messages = self.message_history[-50:]  # Last 50 messages
                await self.send_to_client(client_id, WebSocketMessage(
                    type="history",
                    data={"messages": [msg.dict() for msg in recent_messages]}
                ))

            else:
                logger.warning(f"Unknown message type from client {client_id}: {message_type}")

        except Exception as e:
            logger.error(f"Error handling message from client {client_id}: {e}")

    # Specific broadcast methods for different event types

    async def broadcast_transport_update(self, transport_state: TransportState) -> int:
        """Broadcast transport state update."""
        message = WebSocketMessage(
            type="transport_update",
            data=transport_state.dict()
        )
        return await self.broadcast_to_room("transport", message)

    async def broadcast_track_update(self, action: str, track: Track) -> int:
        """Broadcast track update (created, updated, deleted)."""
        message = WebSocketMessage(
            type="track_update",
            data={"action": action, "track": track.dict() if hasattr(track, 'dict') else track}
        )
        return await self.broadcast_to_room("tracks", message)

    async def broadcast_project_update(self, action: str, project: Project) -> int:
        """Broadcast project update (created, updated, loaded, saved, deleted)."""
        message = WebSocketMessage(
            type="project_update",
            data={"action": action, "project": project.dict() if hasattr(project, 'dict') else project}
        )
        return await self.broadcast_to_room("projects", message)

    async def broadcast_audio_levels(self, levels: Dict[str, float]) -> int:
        """Broadcast audio level meters data."""
        message = WebSocketMessage(
            type="audio_levels",
            data=levels
        )
        return await self.broadcast_to_room("audio_levels", message)

    async def broadcast_performance_metrics(self, metrics: PerformanceMetrics) -> int:
        """Broadcast performance metrics."""
        message = WebSocketMessage(
            type="performance_metrics",
            data=metrics.dict()
        )
        return await self.broadcast_to_room("performance", message)

    async def broadcast_playhead_position(self, position: float) -> int:
        """Broadcast playhead position update."""
        message = WebSocketMessage(
            type="playhead_position",
            data={"position": position}
        )
        return await self.broadcast_to_room("playhead", message)

    async def broadcast_error(self, error_message: str, error_type: str = "general") -> int:
        """Broadcast error message."""
        message = WebSocketMessage(
            type="error",
            data={"message": error_message, "error_type": error_type}
        )
        return await self.broadcast(message)

    async def broadcast_notification(self, title: str, message: str, notification_type: str = "info") -> int:
        """Broadcast notification."""
        notification_message = WebSocketMessage(
            type="notification",
            data={"title": title, "message": message, "type": notification_type}
        )
        return await self.broadcast(notification_message)

    def get_statistics(self) -> Dict[str, Any]:
        """Get WebSocket manager statistics."""
        return {
            "total_connections": len(self.connections),
            "active_rooms": list(self.room_connections.keys()),
            "room_counts": {room: len(clients) for room, clients in self.room_connections.items()},
            "message_history_size": len(self.message_history),
            "uptime_seconds": (datetime.now() - min(
                [conn.connected_at for conn in self.connections.values()],
                default=datetime.now()
            )).total_seconds() if self.connections else 0
        }
