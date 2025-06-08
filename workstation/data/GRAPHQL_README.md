# GraphQL Apollo Integration for Orpheus Engine Audio Library

## Overview
This integration connects the audio library to a GraphQL API using Apollo, allowing for structured querying of audio files and their metadata.

## Backend Components

### GraphQL Schema
Located at `workstation/backend/graphql/schema.py`, the schema defines:
- Audio file types and metadata
- Query resolvers for retrieving audio library information
- Mutations for managing audio files

### GraphQL Views
Located at `workstation/backend/graphql/views.py`, this file creates a Flask blueprint that provides the GraphQL endpoint at `/api/graphql`.

## Frontend Components

### Apollo Client Setup
- `workstation/frontend/src/apollo/client.ts`: Apollo Client configuration
- `workstation/frontend/src/apollo/ApolloWrapper.tsx`: Apollo Provider component for React

### React Integration
- `workstation/frontend/src/hooks/useAudioLibrary.ts`: Custom hooks for audio library data
- `workstation/frontend/src/components/AudioLibrary/AudioLibrary.tsx`: React component for displaying audio files

## Testing
To test the GraphQL API:
1. Start the backend server:
   ```
   npm run start:audio-backend
   ```
2. Run the test script:
   ```
   python workstation/backend/test_graphql.py
   ```
3. Visit the GraphQL playground in your browser:
   http://localhost:7008/api/graphql

## API Endpoints
- **Main GraphQL endpoint**: `http://localhost:7008/api/graphql`

## Example Queries

### Get Audio Library
```graphql
query {
  audioLibrary {
    description
    location
    files {
      id
      filename
      type
      description
      usage
      path
    }
    supported_formats
    logs_directory
    updated
  }
}
```

### Get Audio Files
```graphql
query {
  audioFiles {
    id
    filename
    type
    description
    usage
    path
  }
}
```
