"""
Environment-agnostic GraphQL schema for Audio Library

This module provides GraphQL functionality that adapts to different environments
and dependency versions.
"""

import os
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional, List

# Add current directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

class AudioLibraryService:
    """Service class for audio library operations"""
    
    def __init__(self):
        self.audio_library_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            'data', 
            'audio_library_index.json'
        )
    
    def load_audio_library(self) -> Dict[str, Any]:
        """Load audio library data from JSON file"""
        try:
            with open(self.audio_library_path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error loading audio library: {e}")
            return {"audio_library": {"files": []}}
    
    def get_audio_files(self) -> List[Dict[str, Any]]:
        """Get all audio files with proper ID assignment"""
        library = self.load_audio_library()
        audio_files = []
        
        for i, file_data in enumerate(library.get("audio_library", {}).get("files", [])):
            file_id = str(i)
            size = 1024 * 1024 * (i + 1)  # Mock file size
            duration = 30.0 * (i + 1)  # Mock duration
            created_at = datetime.now().isoformat()
            updated_at = library.get("audio_library", {}).get("updated", created_at)
            
            path = os.path.join(
                library.get("audio_library", {}).get("location", "./data/"),
                file_data.get("filename", "")
            )
            
            audio_file = {
                "id": file_id,
                "filename": file_data.get("filename", ""),
                "type": file_data.get("type", "mp3").upper(),
                "description": file_data.get("description", ""),
                "usage": file_data.get("usage", ""),
                "path": path,
                "size": size,
                "duration": duration,
                "created_at": created_at,
                "updated_at": updated_at
            }
            
            audio_files.append(audio_file)
        
        return audio_files
    
    def get_audio_library_info(self) -> Dict[str, Any]:
        """Get audio library metadata"""
        library = self.load_audio_library()
        library_data = library.get("audio_library", {})
        
        # Add processed files with IDs
        library_data["files"] = self.get_audio_files()
        
        return library_data

# Initialize the service
audio_service = AudioLibraryService()

# Try to set up GraphQL with available backend
try:
    import graphene
    from graphql import execute
    
    # GraphQL Types using Graphene
    class AudioFormat(graphene.Enum):
        MP3 = "MP3"
        WAV = "WAV"
        M4A = "M4A"
        FLAC = "FLAC"
        OGG = "OGG"
    
    class AudioFile(graphene.ObjectType):
        id = graphene.ID(required=True)
        filename = graphene.String(required=True)
        type = graphene.Field(AudioFormat, required=True)
        description = graphene.String()
        usage = graphene.String()
        path = graphene.String(required=True)
        size = graphene.Int()
        duration = graphene.Float()
        created_at = graphene.String(required=True)
        updated_at = graphene.String(required=True)
    
    class AudioLibrary(graphene.ObjectType):
        description = graphene.String()
        location = graphene.String()
        files = graphene.List(AudioFile)
        supported_formats = graphene.List(graphene.String)
        logs_directory = graphene.String()
        updated = graphene.String()
    
    class Query(graphene.ObjectType):
        audio_library = graphene.Field(AudioLibrary)
        audio_files = graphene.List(AudioFile)
        audio_file = graphene.Field(AudioFile, id=graphene.String(required=True))
        
        def resolve_audio_library(self, info):
            data = audio_service.get_audio_library_info()
            return AudioLibrary(**data)
        
        def resolve_audio_files(self, info):
            files = audio_service.get_audio_files()
            return [AudioFile(**file_data) for file_data in files]
        
        def resolve_audio_file(self, info, id):
            files = audio_service.get_audio_files()
            for file_data in files:
                if file_data["id"] == id:
                    return AudioFile(**file_data)
            return None
    
    # Create the schema
    schema = graphene.Schema(query=Query)
    GRAPHQL_BACKEND = 'graphene'
    
except ImportError as e:
    print(f"Graphene not available: {e}")
    
    # Fallback: Simple dictionary-based schema
    class SimpleGraphQLHandler:
        def __init__(self):
            self.service = audio_service
        
        def execute(self, query: str, variables: Dict = None) -> Dict[str, Any]:
            """Simple query executor for basic GraphQL queries (graphene-style interface)"""
            return self.execute_query(query, variables)
        
        def execute_query(self, query: str, variables: Dict = None) -> Dict[str, Any]:
            """Simple query executor for basic GraphQL queries"""
            if 'audioLibrary' in query:
                data = self.service.get_audio_library_info()
                return {
                    'data': {
                        'audioLibrary': data
                    }
                }
            elif 'audioFiles' in query:
                files = self.service.get_audio_files()
                return {
                    'data': {
                        'audioFiles': files
                    }
                }
            else:
                return {
                    'errors': ['Unsupported query']
                }
    
    schema = SimpleGraphQLHandler()
    GRAPHQL_BACKEND = 'fallback'

def get_flexible_schema():
    """Get the appropriate schema based on environment"""
    return schema

print(f"GraphQL backend initialized: {GRAPHQL_BACKEND}")
