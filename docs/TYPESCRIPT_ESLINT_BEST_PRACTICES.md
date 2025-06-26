# TypeScript and ESLint Best Practices for Orpheus Engine

This document provides guidelines and best practices for TypeScript and ESLint usage in the Orpheus Engine codebase. Following these practices will help maintain code quality, prevent common bugs, and improve developer productivity.

## TypeScript Best Practices

### 1. Avoid Non-null Assertions (`!`)

Non-null assertions bypass TypeScript's type checking and can lead to runtime errors.

```typescript
// ❌ Bad
const element = document.getElementById('app')!;
element.innerHTML = 'Hello';

// ✅ Good
const element = document.getElementById('app');
if (element) {
  element.innerHTML = 'Hello';
}

// ✅ Also good (when you're certain)
const element = document.getElementById('app');
if (!element) throw new Error('Element not found');
element.innerHTML = 'Hello';
```

### 2. Use Explicit Types

Always define explicit types for functions, parameters, and return values.

```typescript
// ❌ Bad
function processTrack(track) {
  return { ...track, processed: true };
}

// ✅ Good
interface Track {
  id: string;
  name: string;
  volume: number;
}

function processTrack(track: Track): Track {
  return { ...track, processed: true };
}
```

### 3. Prefer Interfaces for Objects

Use interfaces for object types, especially for component props and state.

```typescript
// ✅ Good
interface TrackProps {
  id: string;
  name: string;
  volume: number;
  onVolumeChange?: (volume: number) => void;
}

const Track: React.FC<TrackProps> = ({ id, name, volume, onVolumeChange }) => {
  // ...
};
```

### 4. Use Union Types for Variants

When a value can be one of several types, use union types.

```typescript
// ✅ Good
type AudioSource = 
  | { type: 'file'; path: string }
  | { type: 'stream'; url: string }
  | { type: 'input'; deviceId: string };

function playAudio(source: AudioSource): void {
  switch (source.type) {
    case 'file':
      // TypeScript knows source.path exists here
      console.log(source.path);
      break;
    case 'stream':
      // TypeScript knows source.url exists here
      console.log(source.url);
      break;
    case 'input':
      // TypeScript knows source.deviceId exists here
      console.log(source.deviceId);
      break;
  }
}
```

### 5. Use Type Guards

Implement type guards to narrow types within conditional blocks.

```typescript
// ✅ Good
function isTrack(obj: any): obj is Track {
  return obj && 
    typeof obj.id === 'string' && 
    typeof obj.name === 'string' &&
    typeof obj.volume === 'number';
}

function processAudioElement(element: Track | AudioEffect): void {
  if (isTrack(element)) {
    // TypeScript knows element is a Track here
    console.log(element.volume);
  } else {
    // TypeScript knows element is an AudioEffect here
    console.log(element.type);
  }
}
```

### 6. Avoid `any`

The `any` type bypasses TypeScript's type checking. Use more specific types or `unknown` when necessary.

```typescript
// ❌ Bad
function parseAudioData(data: any) {
  return data.audio.channels;
}

// ✅ Good
interface AudioData {
  audio: {
    channels: number;
    sampleRate: number;
  };
}

function parseAudioData(data: AudioData) {
  return data.audio.channels;
}

// ✅ Also good (when you don't know the type)
function parseAudioData(data: unknown): number {
  if (typeof data === 'object' && data && 'audio' in data) {
    const audioData = data as { audio: { channels?: number } };
    if (typeof audioData.audio.channels === 'number') {
      return audioData.audio.channels;
    }
  }
  throw new Error('Invalid audio data');
}
```

### 7. Use Readonly for Immutable Data

Mark properties and arrays as `readonly` when they shouldn't be modified.

```typescript
// ✅ Good
interface Track {
  readonly id: string;
  name: string;
  volume: number;
  readonly effects: readonly AudioEffect[];
}
```

### 8. Use ESM Import Syntax

Use ESM import syntax instead of CommonJS `require()`.

```typescript
// ❌ Bad
const fs = require('fs');

// ✅ Good
import fs from 'fs';
import { useState, useEffect } from 'react';
```

## React Hook Best Practices

### 1. Specify All Dependencies in React Hooks

Always include all variables used inside hooks in the dependency array.

```typescript
// ❌ Bad
useEffect(() => {
  fetchTrackData(trackId);
}, []); // Missing trackId and fetchTrackData dependencies

// ✅ Good
useEffect(() => {
  fetchTrackData(trackId);
}, [trackId, fetchTrackData]);
```

### 2. Memoize Functions and Objects

Use `useCallback` and `useMemo` to prevent unnecessary re-renders.

```typescript
// ✅ Good
const handleVolumeChange = useCallback((value: number) => {
  setVolume(value);
  audioContext.setVolume(value);
}, [audioContext]);

const trackOptions = useMemo(() => {
  return tracks.map(track => ({
    id: track.id,
    name: track.name
  }));
}, [tracks]);
```

### 3. Create Custom Hooks for Reusable Logic

Extract complex logic into custom hooks for reusability.

```typescript
// ✅ Good
function useAudioProcessor(trackId: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessedAudio | null>(null);

  useEffect(() => {
    if (!trackId) return;
    
    setIsProcessing(true);
    processAudio(trackId)
      .then(processed => {
        setResult(processed);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [trackId]);

  return { isProcessing, result };
}

// Usage
function TrackProcessor({ trackId }: { trackId: string }) {
  const { isProcessing, result } = useAudioProcessor(trackId);
  
  // ...
}
```

## ESLint Best Practices

### 1. Don't Disable ESLint Rules Without Good Reason

```typescript
// ❌ Bad
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const element = document.getElementById('app')!;

// ✅ Good
const element = document.getElementById('app');
if (!element) throw new Error('Element not found');
```

### 2. Remove Unused Variables and Imports

```typescript
// ❌ Bad
import { Button, TextField, Checkbox } from '@mui/material';
// Only Button is used in the component

// ✅ Good
import { Button } from '@mui/material';
```

### 3. Consolidate Duplicate Imports

```typescript
// ❌ Bad
import { useState } from 'react';
import { useEffect } from 'react';

// ✅ Good
import { useState, useEffect } from 'react';
```

### 4. Use Proper Logging Instead of Console Statements

```typescript
// ❌ Bad
console.log('Track loaded');

// ✅ Good
import logger from '../utils/logger';
logger.info('Track loaded');
```

### 5. Organize Imports Consistently

```typescript
// ✅ Good
// External dependencies
import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';

// Internal modules
import { AudioProcessor } from '../audio';
import { useTrackStore } from '../stores';

// Types
import type { Track, AudioEffect } from '../types';

// Assets and styles
import './Track.css';
```

## Performance Considerations

### 1. Avoid Unnecessary Re-renders

Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders.

```typescript
// ✅ Good
const TrackItem = React.memo(({ track, onSelect }: TrackItemProps) => {
  return (
    <div onClick={() => onSelect(track.id)}>
      {track.name}
    </div>
  );
});
```

### 2. Use Web Workers for Intensive Processing

Offload CPU-intensive audio processing to Web Workers.

```typescript
// ✅ Good
const audioWorker = new Worker(new URL('../workers/audio-processor.ts', import.meta.url));

audioWorker.onmessage = (event) => {
  const { processedData } = event.data;
  setProcessedAudio(processedData);
};

audioWorker.postMessage({ 
  action: 'process',
  trackData: rawAudioData
});
```

### 3. Optimize Audio Rendering

Use efficient algorithms and memoization for audio visualization components.

```typescript
// ✅ Good
const waveformData = useMemo(() => {
  return generateWaveform(audioBuffer, canvasWidth);
}, [audioBuffer, canvasWidth]);
```

## Automated Tools and CI/CD Integration

- **ESLint**: Run on pre-commit and in CI/CD pipeline
- **TypeScript Compiler**: Use `--strict` mode
- **Prettier**: Enforce consistent code formatting
- **Husky**: Set up pre-commit hooks for linting and type checking

By following these best practices, we can maintain high code quality, prevent common bugs, and improve the developer experience across the Orpheus Engine codebase.
