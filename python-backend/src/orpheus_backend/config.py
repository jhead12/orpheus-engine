"""
Configuration management for Orpheus Backend
"""

import os
from pathlib import Path
from typing import List, Optional
from pydantic import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Server settings
    host: str = "127.0.0.1"
    port: int = 8000
    debug: bool = False

    # Audio settings
    audio_buffer_size: int = 512
    sample_rate: int = 44100
    channels: int = 2

    # Feature flags
    enable_midi: bool = True
    enable_gui_dialogs: bool = True
    enable_real_time_audio: bool = True

    # Logging
    log_level: str = "INFO"
    log_file: Optional[str] = None

    # Storage
    projects_dir: Path = Path("./projects")
    uploads_dir: Path = Path("./uploads")
    temp_dir: Path = Path("./temp")

    # Security
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
    ]
    max_upload_size: str = "100MB"

    # Performance
    max_workers: int = 4
    websocket_ping_interval: int = 30
    websocket_ping_timeout: int = 10

    class Config:
        env_file = ".env"
        env_prefix = "BACKEND_"
        case_sensitive = False


# Global settings instance
settings = Settings()

# Ensure directories exist
settings.projects_dir.mkdir(parents=True, exist_ok=True)
settings.uploads_dir.mkdir(parents=True, exist_ok=True)
settings.temp_dir.mkdir(parents=True, exist_ok=True)
