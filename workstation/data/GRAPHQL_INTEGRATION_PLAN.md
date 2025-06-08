# GraphQL Apollo Integration for Audio Library

## Overview
This document outlines how to integrate the Orpheus Engine Audio Library with GraphQL Apollo system.

## Current State
- No existing GraphQL/Apollo setup detected in the workspace
- Audio library is currently file-system based with JSON index
- Backend uses Flask Python services
- Frontend uses React

## Integration Options

### Option 1: Backend GraphQL Server (Recommended)
Add GraphQL endpoint to the existing Flask backend to serve audio library data.

### Option 2: Standalone GraphQL Service
Create a dedicated GraphQL service for audio management.

### Option 3: Frontend Apollo Client Integration
Add Apollo Client to the React frontend to consume GraphQL data.

## Implementation Steps

### 1. Backend GraphQL Setup (Flask + Graphene)
- Install graphene-python for Flask GraphQL integration
- Create GraphQL schema for audio library
- Add resolvers for audio file queries and mutations
- Integrate with existing audio transcription pipeline

### 2. Frontend Apollo Client Setup
- Install Apollo Client for React
- Configure Apollo Client with GraphQL endpoint
- Create React hooks for audio library operations
- Add real-time subscriptions for transcription status

### 3. Audio Library Schema Design
```graphql
type AudioFile {
  id: ID!
  filename: String!
  type: AudioFormat!
  description: String
  usage: String
  path: String!
  size: Int
  duration: Float
  transcription: Transcription
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Transcription {
  id: ID!
  audioFileId: ID!
  text: String!
  confidence: Float
  segments: [TranscriptionSegment!]!
  status: TranscriptionStatus!
  createdAt: DateTime!
}

enum AudioFormat {
  MP3
  WAV
  M4A
  FLAC
  OGG
}

enum TranscriptionStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

## Benefits of GraphQL Integration

1. **Type Safety**: Strong typing for audio operations
2. **Real-time Updates**: Subscriptions for transcription progress
3. **Efficient Queries**: Request only needed data
4. **Developer Experience**: GraphQL playground for testing
5. **Scalability**: Easy to extend with new audio features

## Files to Create/Modify

### Backend Files
- `workstation/backend/graphql/schema.py`
- `workstation/backend/graphql/resolvers.py`
- `workstation/backend/graphql/types.py`
- `workstation/backend/main.py` (add GraphQL endpoint)

### Frontend Files
- `workstation/frontend/OEW-main/src/apollo/client.ts`
- `workstation/frontend/OEW-main/src/hooks/useAudioLibrary.ts`
- `workstation/frontend/OEW-main/src/components/AudioLibrary/`

### Configuration Files
- Update `requirements.txt` with GraphQL dependencies
- Update frontend `package.json` with Apollo dependencies
