# GraphQL Audio Library Integration

This document describes the GraphQL integration for the Orpheus Engine Audio Library.

## Overview

The audio library in Orpheus Engine is now accessible via a GraphQL API. This allows the frontend and other services to query audio files and their metadata in a structured manner.

## Backend Implementation

The backend GraphQL API is implemented using:
- **Flask** - The web framework
- **Graphene** - Python GraphQL framework
- **Flask-GraphQL** - Flask integration for GraphQL

### GraphQL Schema

The GraphQL schema defines the following types:

- **AudioFile** - Represents an audio file in the library
- **AudioFormat** - Enum of supported audio formats (MP3, WAV, etc.)
- **Transcription** - Represents transcription data for an audio file
- **TranscriptionSegment** - Represents a segment of a transcription

### Queries

The API supports the following queries:

- **audioLibrary** - Get the entire audio library
- **audioFiles** - Get all audio files
- **audioFile** - Get a single audio file by ID

### Mutations

The API supports the following mutations:

- **addAudioFile** - Add a new audio file to the library

## Frontend Implementation

The frontend integration is implemented using:
- **Apollo Client** - React integration for GraphQL
- **React Hooks** - Custom hooks for audio library operations

### React Components

- **AudioLibrary** - Component to display the audio library
- **ApolloWrapper** - Provider component for Apollo Client

## Usage Examples

### Backend GraphQL Query

```python
# Query all audio files
query = """
query {
    audioFiles {
        id
        filename
        type
    }
}
"""
```

### Frontend GraphQL Query

```typescript
// Use the useAudioLibrary hook to get audio files
const { loading, error, files } = useAudioLibrary();
```

## Testing

Run the test_graphql.py script to verify that the GraphQL API is working:

```bash
cd workstation/backend
python test_graphql.py
```

## Future Improvements

1. Add authentication for GraphQL API access
2. Implement real-time subscriptions for transcription updates
3. Add pagination for large audio file collections
4. Improve error handling and validation
