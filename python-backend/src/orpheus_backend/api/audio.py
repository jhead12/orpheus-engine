"""
Audio API endpoints for transport controls, audio processing, and effects.
"""

import asyncio
import logging
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse

from ..models import (
    AudioClip,
    EffectChain,
    EffectInstance,
    PerformanceMetrics,
    Track,
    TransportState,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/audio", tags=["audio"])


def get_audio_engine(request: Request):
    """Dependency to get audio engine from app state."""
    return request.app.state.audio_engine


def get_websocket_manager(request: Request):
    """Dependency to get WebSocket manager from app state."""
    return request.app.state.websocket_manager


@router.get("/transport/state", response_model=TransportState)
async def get_transport_state(audio_engine=Depends(get_audio_engine)):
    """Get current transport state."""
    try:
        state = audio_engine.get_transport_state()
        return state
    except Exception as e:
        logger.error(f"Error getting transport state: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transport/play")
async def play(
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Start audio playback."""
    try:
        await audio_engine.play()

        # Broadcast transport state change
        state = audio_engine.get_transport_state()
        await websocket_manager.broadcast_transport_update(state)

        return {"status": "playing", "message": "Playback started"}
    except Exception as e:
        logger.error(f"Error starting playback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transport/pause")
async def pause(
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Pause audio playback."""
    try:
        await audio_engine.pause()

        # Broadcast transport state change
        state = audio_engine.get_transport_state()
        await websocket_manager.broadcast_transport_update(state)

        return {"status": "paused", "message": "Playback paused"}
    except Exception as e:
        logger.error(f"Error pausing playback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transport/stop")
async def stop(
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Stop audio playback and reset position."""
    try:
        await audio_engine.stop()

        # Broadcast transport state change
        state = audio_engine.get_transport_state()
        await websocket_manager.broadcast_transport_update(state)

        return {"status": "stopped", "message": "Playback stopped"}
    except Exception as e:
        logger.error(f"Error stopping playback: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transport/record")
async def record(
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Start audio recording."""
    try:
        await audio_engine.record()

        # Broadcast transport state change
        state = audio_engine.get_transport_state()
        await websocket_manager.broadcast_transport_update(state)

        return {"status": "recording", "message": "Recording started"}
    except Exception as e:
        logger.error(f"Error starting recording: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/transport/seek")
async def seek(
    position: float,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Seek to a specific position in seconds."""
    try:
        await audio_engine.seek(position)

        # Broadcast transport state change
        state = audio_engine.get_transport_state()
        await websocket_manager.broadcast_transport_update(state)

        return {"status": "success", "position": position, "message": f"Seeked to {position}s"}
    except Exception as e:
        logger.error(f"Error seeking to position {position}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/audio/load")
async def load_audio_file(
    file: UploadFile = File(...),
    audio_engine=Depends(get_audio_engine)
):
    """Load an audio file for processing."""
    try:
        # Validate file type
        if not file.filename.lower().endswith(('.wav', '.mp3', '.flac', '.aiff', '.m4a')):
            raise HTTPException(
                status_code=400,
                detail="Unsupported file format. Supported: WAV, MP3, FLAC, AIFF, M4A"
            )

        # Read file content
        content = await file.read()

        # Load into audio engine
        clip_data = await audio_engine.load_audio_file(content, file.filename)

        return {
            "status": "success",
            "message": f"Audio file '{file.filename}' loaded successfully",
            "clip": clip_data
        }
    except Exception as e:
        logger.error(f"Error loading audio file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/audio/analyze/{file_id}")
async def analyze_audio(
    file_id: str,
    audio_engine=Depends(get_audio_engine)
):
    """Analyze an audio file and return waveform, spectrum, and metadata."""
    try:
        analysis = await audio_engine.analyze_audio(file_id)

        if not analysis:
            raise HTTPException(status_code=404, detail="Audio file not found")

        return {
            "status": "success",
            "file_id": file_id,
            "analysis": analysis
        }
    except Exception as e:
        logger.error(f"Error analyzing audio file {file_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tracks", response_model=List[Track])
async def get_tracks(audio_engine=Depends(get_audio_engine)):
    """Get all tracks in the current project."""
    try:
        tracks = await audio_engine.get_tracks()
        return tracks
    except Exception as e:
        logger.error(f"Error getting tracks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tracks", response_model=Track)
async def create_track(
    track: Track,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Create a new track."""
    try:
        created_track = await audio_engine.create_track(track)

        # Broadcast track creation
        await websocket_manager.broadcast_track_update("created", created_track)

        return created_track
    except Exception as e:
        logger.error(f"Error creating track: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/tracks/{track_id}", response_model=Track)
async def update_track(
    track_id: str,
    track_update: Track,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Update an existing track."""
    try:
        updated_track = await audio_engine.update_track(track_id, track_update)

        if not updated_track:
            raise HTTPException(status_code=404, detail="Track not found")

        # Broadcast track update
        await websocket_manager.broadcast_track_update("updated", updated_track)

        return updated_track
    except Exception as e:
        logger.error(f"Error updating track {track_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/tracks/{track_id}")
async def delete_track(
    track_id: str,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Delete a track."""
    try:
        success = await audio_engine.delete_track(track_id)

        if not success:
            raise HTTPException(status_code=404, detail="Track not found")

        # Broadcast track deletion
        await websocket_manager.broadcast_track_update("deleted", {"id": track_id})

        return {"status": "success", "message": f"Track {track_id} deleted"}
    except Exception as e:
        logger.error(f"Error deleting track {track_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tracks/{track_id}/effects")
async def add_effect(
    track_id: str,
    effect: EffectInstance,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Add an effect to a track."""
    try:
        updated_track = await audio_engine.add_effect_to_track(track_id, effect)

        if not updated_track:
            raise HTTPException(status_code=404, detail="Track not found")

        # Broadcast track update
        await websocket_manager.broadcast_track_update("updated", updated_track)

        return {
            "status": "success",
            "message": f"Effect {effect.type} added to track {track_id}",
            "track": updated_track
        }
    except Exception as e:
        logger.error(f"Error adding effect to track {track_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/tracks/{track_id}/effects/{effect_id}")
async def remove_effect(
    track_id: str,
    effect_id: str,
    audio_engine=Depends(get_audio_engine),
    websocket_manager=Depends(get_websocket_manager)
):
    """Remove an effect from a track."""
    try:
        updated_track = await audio_engine.remove_effect_from_track(track_id, effect_id)

        if not updated_track:
            raise HTTPException(status_code=404, detail="Track or effect not found")

        # Broadcast track update
        await websocket_manager.broadcast_track_update("updated", updated_track)

        return {
            "status": "success",
            "message": f"Effect {effect_id} removed from track {track_id}",
            "track": updated_track
        }
    except Exception as e:
        logger.error(f"Error removing effect {effect_id} from track {track_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance", response_model=PerformanceMetrics)
async def get_performance_metrics(audio_engine=Depends(get_audio_engine)):
    """Get current audio engine performance metrics."""
    try:
        metrics = audio_engine.get_performance_metrics()
        return metrics
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/effects/process")
async def process_audio_with_effects(
    audio_data: Dict,
    effects: List[EffectInstance],
    audio_engine=Depends(get_audio_engine)
):
    """Process audio data with specified effects chain."""
    try:
        processed_audio = await audio_engine.process_with_effects(audio_data, effects)

        return {
            "status": "success",
            "message": "Audio processed with effects",
            "processed_audio": processed_audio
        }
    except Exception as e:
        logger.error(f"Error processing audio with effects: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/supported-formats")
async def get_supported_formats():
    """Get list of supported audio file formats."""
    return {
        "input_formats": [".wav", ".mp3", ".flac", ".aiff", ".m4a"],
        "output_formats": [".wav", ".mp3", ".flac"],
        "sample_rates": [22050, 44100, 48000, 88200, 96000],
        "bit_depths": [16, 24, 32]
    }
