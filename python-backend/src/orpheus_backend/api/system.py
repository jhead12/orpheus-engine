"""
System integration API endpoints for file dialogs, native menus, and OS-level operations.
"""

import logging
import platform
import psutil
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse

from ..models import SystemInfo

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/system", tags=["system"])


def get_system_integration(request: Request):
    """Dependency to get system integration from app state."""
    return request.app.state.system_integration


def get_audio_engine(request: Request):
    """Dependency to get audio engine from app state."""
    return request.app.state.audio_engine


@router.get("/info", response_model=SystemInfo)
async def get_system_info():
    """Get system information including OS, hardware, and audio capabilities."""
    try:
        # Get system information
        system_info = SystemInfo(
            platform=platform.system(),
            platform_version=platform.version(),
            architecture=platform.machine(),
            python_version=platform.python_version(),
            cpu_count=psutil.cpu_count(),
            memory_total=psutil.virtual_memory().total,
            memory_available=psutil.virtual_memory().available,
            disk_usage=psutil.disk_usage('/').free if platform.system() != 'Windows' else psutil.disk_usage('C:').free,
            hostname=platform.node()
        )

        return system_info
    except Exception as e:
        logger.error(f"Error getting system info: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance")
async def get_system_performance():
    """Get current system performance metrics."""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/' if platform.system() != 'Windows' else 'C:')

        performance = {
            "cpu_usage_percent": cpu_percent,
            "memory_usage_percent": memory.percent,
            "memory_used_gb": memory.used / (1024**3),
            "memory_total_gb": memory.total / (1024**3),
            "disk_usage_percent": (disk.total - disk.free) / disk.total * 100,
            "disk_free_gb": disk.free / (1024**3),
            "disk_total_gb": disk.total / (1024**3),
            "load_average": psutil.getloadavg() if hasattr(psutil, 'getloadavg') else None
        }

        return performance
    except Exception as e:
        logger.error(f"Error getting system performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/file-dialog/open")
async def open_file_dialog(
    title: str = "Open File",
    file_types: Optional[List[Dict[str, str]]] = None,
    multiple: bool = False,
    system_integration=Depends(get_system_integration)
):
    """Show native file open dialog."""
    try:
        # Default file types for audio files
        if not file_types:
            file_types = [
                {"name": "Audio Files", "extensions": ["*.wav", "*.mp3", "*.flac", "*.aiff", "*.m4a"]},
                {"name": "WAV Files", "extensions": ["*.wav"]},
                {"name": "MP3 Files", "extensions": ["*.mp3"]},
                {"name": "FLAC Files", "extensions": ["*.flac"]},
                {"name": "All Files", "extensions": ["*.*"]}
            ]

        file_paths = await system_integration.show_open_file_dialog(
            title=title,
            file_types=file_types,
            multiple=multiple
        )

        return {
            "status": "success",
            "file_paths": file_paths,
            "multiple": multiple
        }
    except Exception as e:
        logger.error(f"Error showing open file dialog: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/file-dialog/save")
async def save_file_dialog(
    title: str = "Save File",
    default_name: str = "untitled",
    file_types: Optional[List[Dict[str, str]]] = None,
    system_integration=Depends(get_system_integration)
):
    """Show native file save dialog."""
    try:
        # Default file types for audio exports
        if not file_types:
            file_types = [
                {"name": "WAV Files", "extensions": ["*.wav"]},
                {"name": "MP3 Files", "extensions": ["*.mp3"]},
                {"name": "FLAC Files", "extensions": ["*.flac"]},
                {"name": "Orpheus Project", "extensions": ["*.oew"]},
                {"name": "All Files", "extensions": ["*.*"]}
            ]

        file_path = await system_integration.show_save_file_dialog(
            title=title,
            default_name=default_name,
            file_types=file_types
        )

        return {
            "status": "success",
            "file_path": file_path
        }
    except Exception as e:
        logger.error(f"Error showing save file dialog: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/folder-dialog")
async def folder_dialog(
    title: str = "Select Folder",
    system_integration=Depends(get_system_integration)
):
    """Show native folder selection dialog."""
    try:
        folder_path = await system_integration.show_folder_dialog(title=title)

        return {
            "status": "success",
            "folder_path": folder_path
        }
    except Exception as e:
        logger.error(f"Error showing folder dialog: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audio-devices")
async def get_audio_devices(audio_engine=Depends(get_audio_engine)):
    """Get available audio input and output devices."""
    try:
        devices = await audio_engine.get_audio_devices()

        return {
            "status": "success",
            "devices": devices
        }
    except Exception as e:
        logger.error(f"Error getting audio devices: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/audio-devices/set-input")
async def set_audio_input_device(
    device_id: str,
    audio_engine=Depends(get_audio_engine)
):
    """Set the audio input device."""
    try:
        success = await audio_engine.set_input_device(device_id)

        if not success:
            raise HTTPException(status_code=400, detail="Failed to set input device")

        return {
            "status": "success",
            "message": f"Audio input device set to {device_id}"
        }
    except Exception as e:
        logger.error(f"Error setting audio input device: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/audio-devices/set-output")
async def set_audio_output_device(
    device_id: str,
    audio_engine=Depends(get_audio_engine)
):
    """Set the audio output device."""
    try:
        success = await audio_engine.set_output_device(device_id)

        if not success:
            raise HTTPException(status_code=400, detail="Failed to set output device")

        return {
            "status": "success",
            "message": f"Audio output device set to {device_id}"
        }
    except Exception as e:
        logger.error(f"Error setting audio output device: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preferences")
async def get_preferences(system_integration=Depends(get_system_integration)):
    """Get application preferences."""
    try:
        preferences = await system_integration.get_preferences()
        return preferences
    except Exception as e:
        logger.error(f"Error getting preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/preferences")
async def set_preferences(
    preferences: Dict,
    system_integration=Depends(get_system_integration)
):
    """Set application preferences."""
    try:
        await system_integration.set_preferences(preferences)

        return {
            "status": "success",
            "message": "Preferences updated",
            "preferences": preferences
        }
    except Exception as e:
        logger.error(f"Error setting preferences: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/notifications/show")
async def show_notification(
    title: str,
    message: str,
    type: str = "info",
    system_integration=Depends(get_system_integration)
):
    """Show a system notification."""
    try:
        await system_integration.show_notification(title, message, type)

        return {
            "status": "success",
            "message": "Notification shown"
        }
    except Exception as e:
        logger.error(f"Error showing notification: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/file-associations")
async def get_file_associations():
    """Get file associations for the application."""
    try:
        associations = {
            ".oew": "Orpheus Engine Project",
            ".wav": "Wave Audio File",
            ".mp3": "MP3 Audio File",
            ".flac": "FLAC Audio File",
            ".aiff": "AIFF Audio File",
            ".m4a": "M4A Audio File"
        }

        return {
            "status": "success",
            "associations": associations
        }
    except Exception as e:
        logger.error(f"Error getting file associations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/shell/open-folder")
async def open_folder_in_shell(
    path: str,
    system_integration=Depends(get_system_integration)
):
    """Open a folder in the system file manager."""
    try:
        folder_path = Path(path)
        if not folder_path.exists():
            raise HTTPException(status_code=404, detail="Folder not found")

        await system_integration.open_folder_in_shell(str(folder_path))

        return {
            "status": "success",
            "message": f"Opened folder: {path}"
        }
    except Exception as e:
        logger.error(f"Error opening folder in shell: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/shell/open-file")
async def open_file_in_shell(
    path: str,
    system_integration=Depends(get_system_integration)
):
    """Open a file with the system default application."""
    try:
        file_path = Path(path)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")

        await system_integration.open_file_in_shell(str(file_path))

        return {
            "status": "success",
            "message": f"Opened file: {path}"
        }
    except Exception as e:
        logger.error(f"Error opening file in shell: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/clipboard")
async def get_clipboard_content(system_integration=Depends(get_system_integration)):
    """Get clipboard content."""
    try:
        content = await system_integration.get_clipboard_content()

        return {
            "status": "success",
            "content": content,
            "type": "text" if isinstance(content, str) else "binary"
        }
    except Exception as e:
        logger.error(f"Error getting clipboard content: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clipboard")
async def set_clipboard_content(
    content: str,
    system_integration=Depends(get_system_integration)
):
    """Set clipboard content."""
    try:
        await system_integration.set_clipboard_content(content)

        return {
            "status": "success",
            "message": "Clipboard content set"
        }
    except Exception as e:
        logger.error(f"Error setting clipboard content: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent-files")
async def get_recent_files(system_integration=Depends(get_system_integration)):
    """Get recently opened files."""
    try:
        recent_files = await system_integration.get_recent_files()

        return {
            "status": "success",
            "recent_files": recent_files
        }
    except Exception as e:
        logger.error(f"Error getting recent files: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recent-files/add")
async def add_recent_file(
    file_path: str,
    system_integration=Depends(get_system_integration)
):
    """Add a file to recent files list."""
    try:
        await system_integration.add_recent_file(file_path)

        return {
            "status": "success",
            "message": f"Added {file_path} to recent files"
        }
    except Exception as e:
        logger.error(f"Error adding recent file: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/recent-files")
async def clear_recent_files(system_integration=Depends(get_system_integration)):
    """Clear recent files list."""
    try:
        await system_integration.clear_recent_files()

        return {
            "status": "success",
            "message": "Recent files cleared"
        }
    except Exception as e:
        logger.error(f"Error clearing recent files: {e}")
        raise HTTPException(status_code=500, detail=str(e))
