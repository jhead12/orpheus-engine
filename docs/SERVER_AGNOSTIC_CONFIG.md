# Server-Agnostic Configuration Implementation

This document outlines the implementation of a server-agnostic configuration system that allows the Orpheus Engine to work with different backend services regardless of their location or protocol.

## Overview

The server-agnostic configuration system provides:

1. Smart defaults with zero configuration required for local development
2. Support for custom hosts, ports, and protocols
3. Environment variable overrides via `.env` files
4. Centralized URL generation for consistent API access

## Implemented Features

### 1. Environment Configuration

- Created `environment.ts` in the frontend for React components
- Created `environment.ts` in the Electron main process
- Added dotenv support for loading environment variables

### 2. Environment Templates

- Added `.env` file with default settings
- Added `.env.example` as documentation for available options

### 3. URL Generation Functions

Created standardized URL generators for:
- API endpoints
- Audio processing services
- Vite development server
- Monitoring and health checks
- Python bridge

### 4. Server Environment Awareness

Updated all hard-coded URLs to use the environment configuration:
- Electron main process now uses the centralized configuration
- Python bridge service is environment-aware
- Added environment checks for features that can be toggled

## Benefits

1. **Flexibility**: The application can now connect to services on any host/port
2. **Consistency**: All URLs are generated using the same configuration
3. **Security**: Better control over which services are accessed
4. **Development**: Easier to work with different environments

## Usage Examples

### Accessing API Endpoints

```typescript
import environment from "../config/environment";

// Get URL for a specific API endpoint
const apiUrl = environment.urls.apiUrl('myEndpoint');
const response = await fetch(apiUrl);
```

### Loading Vite in Development

```typescript
import environment from "./environment";

// Get the Vite development server URL
const viteUrl = environment.urls.viteBaseUrl();
mainWindow.loadURL(viteUrl);
```

### Checking Environment Type

```typescript
import environment from "../config/environment";

if (environment.urls.isDevelopment()) {
  // Development-specific code
}
```
