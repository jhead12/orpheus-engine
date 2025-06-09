"""
Data models for the Orpheus Backend
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field


class TrackType(str, Enum):
    """Track types supported by the DAW."""
    AUDIO = "audio"
    MIDI = "midi"
    INSTRUMENT = "instrument"
    BUS = "bus"
    RETURN = "return"


class TransportCommand(str, Enum):
    """Transport control commands."""
    PLAY = "play"
    PAUSE = "pause"
    STOP = "stop"
    RECORD = "record"


class AutomationMode(str, Enum):
    """Automation modes for tracks."""
    READ = "read"
    WRITE = "write"
    TOUCH = "touch"
    LATCH = "latch"


class TimelinePosition(BaseModel):
    """Position in the timeline."""
    bar: int = 0
    beat: int = 0
    tick: int = 0

    def to_samples(self, sample_rate: int, tempo: float, time_signature: tuple) -> int:
        """Convert to sample position."""
        beats_per_bar = time_signature[0]
        ticks_per_beat = 480  # Standard MIDI resolution

        total_ticks = (
            self.bar * beats_per_bar * ticks_per_beat +
            self.beat * ticks_per_beat +
            self.tick
        )

        # Convert to seconds then samples
        seconds_per_tick = 60.0 / (tempo * ticks_per_beat)
        return int(total_ticks * seconds_per_tick * sample_rate)


class AutomatableParameter(BaseModel):
    """A parameter that can be automated."""
    value: float
    is_automated: bool = False
    automation_data: Optional[List[Dict[str, Union[float, int]]]] = None


class AudioClip(BaseModel):
    """Audio clip model."""
    id: str
    name: str
    file_path: Optional[str] = None
    start: TimelinePosition
    end: TimelinePosition
    loop_start: Optional[TimelinePosition] = None
    loop_end: Optional[TimelinePosition] = None
    muted: bool = False
    gain: float = 1.0
    fade_in: float = 0.0
    fade_out: float = 0.0


class MidiClip(BaseModel):
    """MIDI clip model."""
    id: str
    name: str
    start: TimelinePosition
    end: TimelinePosition
    muted: bool = False
    notes: List[Dict[str, Any]] = []  # MIDI note events


class Effect(BaseModel):
    """Audio effect model."""
    id: str
    name: str
    plugin_id: str
    enabled: bool = True
    parameters: Dict[str, Any] = {}
    wet_dry: float = 1.0


class Track(BaseModel):
    """Track model."""
    id: str
    name: str
    type: TrackType
    color: str = "#888888"
    volume: AutomatableParameter = Field(default_factory=lambda: AutomatableParameter(value=1.0))
    pan: AutomatableParameter = Field(default_factory=lambda: AutomatableParameter(value=0.0))
    mute: bool = False
    solo: bool = False
    armed: bool = False
    clips: List[Union[AudioClip, MidiClip]] = []
    effects: List[Effect] = []
    automation_mode: AutomationMode = AutomationMode.READ


class Project(BaseModel):
    """Project model."""
    id: str
    name: str
    tempo: float = 120.0
    time_signature: tuple = (4, 4)
    sample_rate: int = 44100
    tracks: List[Track] = []
    created_at: datetime = Field(default_factory=datetime.now)
    modified_at: datetime = Field(default_factory=datetime.now)


class WebSocketMessage(BaseModel):
    """WebSocket message model."""
    type: str
    data: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.now)


class AudioAnalysisResult(BaseModel):
    """Audio file analysis result."""
    file_path: str
    duration: float
    sample_rate: int
    channels: int
    bit_depth: Optional[int] = None
    format: str
    size_bytes: int
    peaks: Optional[List[float]] = None
    rms: Optional[List[float]] = None
    spectral_centroid: Optional[List[float]] = None
    tempo: Optional[float] = None
    key: Optional[str] = None


class EngineStatus(BaseModel):
    """Engine status model."""
    is_playing: bool = False
    is_recording: bool = False
    playhead_position: TimelinePosition = Field(default_factory=TimelinePosition)
    cpu_usage: float = 0.0
    memory_usage: float = 0.0
    buffer_underruns: int = 0
    active_tracks: int = 0


class SystemInfo(BaseModel):
    """System information model."""
    platform: str
    platform_version: str
    architecture: str
    python_version: str
    cpu_count: int
    memory_total: int
    memory_available: int
    disk_usage: int
    hostname: str


class EffectInstance(BaseModel):
    """Audio effect instance model."""
    id: str
    type: str
    name: str
    enabled: bool = True
    parameters: Dict[str, Any] = {}
    wet_dry_mix: float = 1.0


class EffectChain(BaseModel):
    """Collection of effects in processing order."""
    id: str
    name: str
    effects: List[EffectInstance] = []
    enabled: bool = True


class PerformanceMetrics(BaseModel):
    """Audio engine performance metrics."""
    cpu_usage: float = 0.0
    memory_usage: float = 0.0
    audio_latency: float = 0.0
    buffer_underruns: int = 0
    active_tracks: int = 0


class TransportState(BaseModel):
    """Transport control state."""
    is_playing: bool = False
    is_recording: bool = False
    is_paused: bool = False
    playhead_position: float = 0.0
    tempo: float = 120.0
    time_signature: tuple = (4, 4)
    loop_enabled: bool = False
    loop_start: float = 0.0
    loop_end: float = 0.0
