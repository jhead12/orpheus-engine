"""
Orpheus Engine Python Backend

A high-performance audio processing backend for the Orpheus Engine DAW.
Provides real-time audio processing, WebSocket communication, and native
system integration.
"""

__version__ = "1.0.0"
__author__ = "Creative Organization DAO, JEH Ventures LLC"
__email__ = "creatives@creativeplatform.xyz"

from .main import app, main

__all__ = ["app", "main"]
