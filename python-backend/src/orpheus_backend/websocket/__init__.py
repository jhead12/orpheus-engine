"""
WebSocket module for real-time communication.
"""

from .manager import WebSocketManager, WebSocketMessage, ConnectionInfo
from .endpoints import router

__all__ = ["WebSocketManager", "WebSocketMessage", "ConnectionInfo", "router"]
