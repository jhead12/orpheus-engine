import graphene
from datetime import datetime
import os
import json
from graphene import ObjectType, String, ID, Float, Int, List, Enum, Field, Boolean

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

# Transcription segment for audio
class TranscriptionSegment(ObjectType):
    id = ID(required=True)
    start = Float(required=True)
    end = Float(required=True)
    text = String(required=True)
    confidence = Float()

# Transcription model
class Transcription(ObjectType):
    id = ID(required=True)
    audio_file_id = ID(required=True)
    text = String(required=True)
    confidence = Float()
    segments = List(TranscriptionSegment, required=True)
    status = Field(TranscriptionStatus, required=True)
    created_at = String(required=True)

# Audio file model
class AudioFile(ObjectType):
    id = ID(required=True)
    filename = String(required=True)
    type = Field(AudioFormat, required=True)
    description = String()
    usage = String()
    path = String(required=True)
    size = Int()
    duration = Float()
    transcription = Field(Transcription)
    created_at = String(required=True)
    updated_at = String(required=True)

# Input for audio file creation
class AudioFileInput(graphene.InputObjectType):
    filename = String(required=True)
    type = String(required=True)
    description = String()
    usage = String()

# Audio Library
class AudioLibrary(ObjectType):
    description = String()
    location = String()
    files = List(AudioFile)
    supported_formats = List(String)
    logs_directory = String()
    updated = String()

# Query root
class Query(ObjectType):
    audio_library = Field(AudioLibrary)
    audio_file = Field(AudioFile, id=ID(required=True))
    audio_files = List(AudioFile)
    
    def resolve_audio_library(root, info):
        # Load audio library from JSON file
        lib_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'audio_library_index.json')
        try:
            with open(lib_path, 'r') as f:
                data = json.load(f)
                audio_library = data.get('audio_library', {})
                
                # Process the files to add required fields
                files = audio_library.get('files', [])
                location = audio_library.get('location', './data/')
                updated = audio_library.get('updated', datetime.now().isoformat())
                
                # Add the ID field for each file since it's not stored in the JSON
                for idx, file in enumerate(files):
                    file['id'] = str(idx)
                    file['path'] = os.path.join(location, file['filename'])
                    file['created_at'] = datetime.now().isoformat()
                    file['updated_at'] = updated
                
                # Return the modified audio library data
                audio_library['files'] = files
                return audio_library
        except Exception as e:
            print(f"Error loading audio library: {e}")
            return None
    
    def resolve_audio_file(root, info, id):
        lib_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'audio_library_index.json')
        try:
            with open(lib_path, 'r') as f:
                data = json.load(f)
                for idx, file in enumerate(data.get('audio_library', {}).get('files', [])):
                    if str(idx) == id:
                        # Add the ID field since it's not stored in the JSON
                        file['id'] = id
                        file['path'] = os.path.join(data.get('audio_library', {}).get('location', './data/'), file['filename'])
                        file['created_at'] = datetime.now().isoformat()
                        file['updated_at'] = data.get('audio_library', {}).get('updated', datetime.now().isoformat())
                        return file
                return None
        except Exception as e:
            print(f"Error loading audio file with ID {id}: {e}")
            return None
    
    def resolve_audio_files(root, info):
        lib_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'audio_library_index.json')
        try:
            with open(lib_path, 'r') as f:
                data = json.load(f)
                files = data.get('audio_library', {}).get('files', [])
                location = data.get('audio_library', {}).get('location', './data/')
                updated = data.get('audio_library', {}).get('updated', datetime.now().isoformat())
                
                # Add the ID field for each file since it's not stored in the JSON
                for idx, file in enumerate(files):
                    file['id'] = str(idx)
                    file['path'] = os.path.join(location, file['filename'])
                    file['created_at'] = datetime.now().isoformat()  # We don't have actual creation dates
                    file['updated_at'] = updated
                
                return files
        except Exception as e:
            print(f"Error loading audio files: {e}")
            return []

# Mutations for modifying audio library
class AddAudioFile(graphene.Mutation):
    class Arguments:
        input = AudioFileInput(required=True)
    
    audio_file = Field(lambda: AudioFile)
    
    def mutate(root, info, input):
        lib_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'audio_library_index.json')
        try:
            with open(lib_path, 'r') as f:
                data = json.load(f)
            
            # Add new audio file
            new_file = {
                'filename': input.filename,
                'type': input.type,
                'description': input.description or "",
                'usage': input.usage or ""
            }
            
            data['audio_library']['files'].append(new_file)
            data['audio_library']['updated'] = datetime.now().isoformat()
            
            # Save back to JSON
            with open(lib_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            # Return the newly created file with generated ID
            new_id = str(len(data['audio_library']['files']) - 1)
            new_file['id'] = new_id
            new_file['path'] = os.path.join(data['audio_library']['location'], new_file['filename'])
            new_file['created_at'] = datetime.now().isoformat()
            new_file['updated_at'] = data['audio_library']['updated']
            
            return AddAudioFile(audio_file=new_file)
        except Exception as e:
            print(f"Error adding audio file: {e}")
            return None

class Mutation(ObjectType):
    add_audio_file = AddAudioFile.Field()

# Import plugin system
try:
    from .plugins import PluginQuery, PluginMutation
    
    # Extend Query and Mutation with plugin functionality
    class ExtendedQuery(Query, PluginQuery):
        pass
    
    class ExtendedMutation(Mutation, PluginMutation):
        pass
    
    # Create the schema with plugin support
    schema = graphene.Schema(query=ExtendedQuery, mutation=ExtendedMutation)
    print("✓ GraphQL schema created with plugin support")
    
except ImportError as e:
    print(f"⚠ Warning: Plugin system not available: {e}")
    # Fallback to basic schema without plugins
    schema = graphene.Schema(query=Query, mutation=Mutation)
    print("✓ GraphQL schema created without plugin support")
