import graphene
from enum import Enum
from datetime import datetime
import os
import json

# Path to audio library index file
AUDIO_LIBRARY_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                "data", "audio_library_index.json")

# Audio format enum
class AudioFormat(graphene.Enum):
    MP3 = "mp3"
    WAV = "wav"
    M4A = "m4a"
    FLAC = "flac"
    OGG = "ogg"

# Transcription status enum
class TranscriptionStatus(graphene.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

# Type definitions
class TranscriptionSegment(graphene.ObjectType):
    start = graphene.Float()
    end = graphene.Float()
    text = graphene.String()
    confidence = graphene.Float()

class Transcription(graphene.ObjectType):
    id = graphene.ID()
    audio_file_id = graphene.ID()
    text = graphene.String()
    confidence = graphene.Float()
    segments = graphene.List(TranscriptionSegment)
    status = TranscriptionStatus()
    created_at = graphene.DateTime()

class AudioFile(graphene.ObjectType):
    id = graphene.ID()
    filename = graphene.String()
    type = AudioFormat()
    description = graphene.String()
    usage = graphene.String()
    path = graphene.String()
    size = graphene.Int()
    duration = graphene.Float()
    transcription = graphene.Field(Transcription)
    created_at = graphene.DateTime()
    updated_at = graphene.DateTime()

# Helper functions to load audio library data
def load_audio_library():
    try:
        with open(AUDIO_LIBRARY_PATH, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading audio library: {e}")
        return {"audio_library": {"files": []}}

def get_audio_files():
    library = load_audio_library()
    audio_files = []
    
    for i, file_data in enumerate(library.get("audio_library", {}).get("files", [])):
        # Generate some mock data for fields not in the JSON
        file_id = f"audio_{i+1}"
        size = 1024 * 1024 * (i+1)  # Mock file size in bytes
        duration = 30.0 * (i+1)  # Mock duration in seconds
        created_at = datetime.now()
        updated_at = datetime.now()
        
        # Set path based on location in library
        path = os.path.join(
            library.get("audio_library", {}).get("location", "./data/"),
            file_data.get("filename", "")
        )
        
        # Create AudioFile object
        audio_file = {
            "id": file_id,
            "filename": file_data.get("filename", ""),
            "type": file_data.get("type", "mp3"),
            "description": file_data.get("description", ""),
            "usage": file_data.get("usage", ""),
            "path": path,
            "size": size,
            "duration": duration,
            "transcription": None,  # No transcription data yet
            "created_at": created_at,
            "updated_at": updated_at
        }
        
        audio_files.append(audio_file)
    
    return audio_files

def get_audio_file_by_id(file_id):
    audio_files = get_audio_files()
    for audio_file in audio_files:
        if audio_file["id"] == file_id:
            return audio_file
    return None

def get_audio_file_by_filename(filename):
    audio_files = get_audio_files()
    for audio_file in audio_files:
        if audio_file["filename"] == filename:
            return audio_file
    return None
