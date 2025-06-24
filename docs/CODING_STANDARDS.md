# Orpheus Engine - Coding Standards & Best Practices

## Overview

This document outlines the coding standards, best practices, and conventions used in the Orpheus Engine project. Following these standards ensures code consistency, maintainability, and quality across the entire codebase.

## Table of Contents

1. [TypeScript Standards](#typescript-standards)
2. [React Best Practices](#react-best-practices)
3. [Code Organization](#code-organization)
4. [Testing Standards](#testing-standards)
5. [Performance Guidelines](#performance-guidelines)
6. [Security Practices](#security-practices)
7. [Documentation Standards](#documentation-standards)
8. [Git Workflow](#git-workflow)

## TypeScript Standards

### Configuration

Our TypeScript configuration enforces strict type checking:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

### Type Definitions

#### 1. Interface Naming
- Use PascalCase for interfaces
- Prefix with descriptive context

```typescript
// ✅ Good
interface AudioTrackProperties {
  id: string;
  name: string;
  duration: number;
}

// ❌ Avoid
interface track {
  id: string;
}
```

#### 2. Type Safety
- Always prefer explicit types over `any`
- Use union types for known possibilities
- Leverage generic types for reusability

```typescript
// ✅ Good
type AudioFormat = 'wav' | 'mp3' | 'ogg' | 'flac';

interface ExportOptions<T = AudioFormat> {
  format: T;
  quality: 'low' | 'medium' | 'high' | 'lossless';
}

// ❌ Avoid
interface ExportOptions {
  format: any;
  quality: string;
}
```

#### 3. Utility Types
- Use built-in utility types when appropriate
- Create custom utility types for complex patterns

```typescript
// ✅ Good
type PartialTrack = Partial<Track>;
type TrackId = Pick<Track, 'id'>;

// Custom utility types
type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
```

## React Best Practices

### Component Structure

#### 1. Functional Components
- Always use functional components with hooks
- Use TypeScript interfaces for props

```typescript
// ✅ Good
interface TrackComponentProps {
  track: Track;
  onSelect?: (track: Track) => void;
  className?: string;
}

const TrackComponent: React.FC<TrackComponentProps> = ({ 
  track, 
  onSelect, 
  className = '' 
}) => {
  // Component implementation
};

export default TrackComponent;
```

#### 2. Hook Usage
- Extract complex logic into custom hooks
- Use dependency arrays correctly
- Follow hook naming conventions

```typescript
// ✅ Good - Custom hook
function useAudioPlayer(audioUrl: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    // Audio logic
  }, [audioUrl]);
  
  return { isPlaying, duration, play, pause };
}

// ✅ Good - Component using custom hook
const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const { isPlaying, duration, play, pause } = useAudioPlayer(audioUrl);
  
  return (
    // JSX
  );
};
```

#### 3. Event Handlers
- Use specific event types
- Prefer callback props over inline handlers for complex logic

```typescript
// ✅ Good
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

// ✅ Good - Callback pattern
const handleTrackSelect = useCallback((track: Track) => {
  onTrackSelect?.(track);
}, [onTrackSelect]);
```

### State Management

#### 1. Local State
- Use `useState` for simple component state
- Use `useReducer` for complex state logic

```typescript
// ✅ Good - Simple state
const [isLoading, setIsLoading] = useState(false);

// ✅ Good - Complex state with reducer
interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

type PlaybackAction = 
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_VOLUME'; payload: number };

const playbackReducer = (state: PlaybackState, action: PlaybackAction): PlaybackState => {
  switch (action.type) {
    case 'PLAY':
      return { ...state, isPlaying: true };
    // ... other cases
    default:
      return state;
  }
};
```

#### 2. Context Usage
- Create typed contexts
- Provide proper default values
- Use context providers strategically

```typescript
// ✅ Good - Typed context
interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Code Organization

### File Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI elements
│   ├── widgets/         # Complex composite components
│   └── __tests__/       # Component tests
├── screens/             # Page-level components
│   └── workstation/     # Workstation-specific screens
├── contexts/            # React contexts
├── services/            # Business logic and API calls
│   ├── api/            # API service layer
│   ├── utils/          # Utility functions
│   └── types/          # Type definitions
├── test/               # Test utilities and setup
└── constants/          # Application constants
```

### Import Organization

#### 1. Import Order
1. External libraries
2. Internal modules (using path aliases)
3. Relative imports

```typescript
// ✅ Good import order
import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';

import { useAuth } from '@orpheus/contexts';
import { AudioService } from '@orpheus/services';
import { Track } from '@orpheus/types';

import './TrackComponent.css';
```

#### 2. Path Aliases
Use configured path aliases for cleaner imports:

```typescript
// ✅ Good - Using aliases
import { TrackComponent } from '@orpheus/components';
import { useWorkstation } from '@orpheus/contexts';
import { AudioUtils } from '@orpheus/utils';

// ❌ Avoid - Relative paths
import { TrackComponent } from '../../components/TrackComponent';
import { useWorkstation } from '../../../contexts/WorkstationContext';
```

### Naming Conventions

#### 1. Files and Directories
- Use PascalCase for React components
- Use camelCase for utilities and services
- Use kebab-case for CSS files

```
✅ Good:
TrackComponent.tsx
audioService.ts
track-component.css

❌ Avoid:
trackComponent.tsx
AudioService.ts
TrackComponent.css
```

#### 2. Variables and Functions
- Use camelCase for variables and functions
- Use descriptive names
- Avoid abbreviations

```typescript
// ✅ Good
const audioPlaybackManager = new AudioPlaybackManager();
const handleTrackSelection = (track: Track) => { };

// ❌ Avoid
const apm = new AudioPlaybackManager();
const handleTS = (t: Track) => { };
```

## Testing Standards

### Test Organization

#### 1. Test File Structure
- Co-locate tests with components
- Use descriptive test names
- Group related tests with `describe` blocks

```typescript
// ✅ Good test structure
describe('TrackComponent', () => {
  describe('when rendering', () => {
    it('should display track name', () => {
      // Test implementation
    });
    
    it('should show duration in correct format', () => {
      // Test implementation
    });
  });
  
  describe('when interacting', () => {
    it('should call onSelect when clicked', () => {
      // Test implementation
    });
  });
});
```

#### 2. Test Types
- **Unit Tests**: Test individual components/functions
- **Integration Tests**: Test component interactions
- **Visual Tests**: Test UI appearance and layout

```typescript
// Unit test example
import { render, screen } from '@testing-library/react';
import { TrackComponent } from './TrackComponent';

describe('TrackComponent Unit Tests', () => {
  it('renders track information correctly', () => {
    const mockTrack = { id: '1', name: 'Test Track', duration: 180 };
    render(<TrackComponent track={mockTrack} />);
    
    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
  });
});
```

#### 3. Mock Strategies
- Mock external dependencies
- Use type-safe mocks
- Provide realistic test data

```typescript
// ✅ Good mocking
const mockAudioService = {
  loadTrack: vi.fn().mockResolvedValue(mockTrack),
  playTrack: vi.fn(),
  pauseTrack: vi.fn(),
} as const;

vi.mock('@orpheus/services', () => ({
  AudioService: mockAudioService,
}));
```

## Performance Guidelines

### React Performance

#### 1. Memoization
- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers

```typescript
// ✅ Good - Memoized component
const TrackList = React.memo<TrackListProps>(({ tracks, onTrackSelect }) => {
  const sortedTracks = useMemo(() => 
    tracks.sort((a, b) => a.name.localeCompare(b.name)), 
    [tracks]
  );
  
  const handleTrackSelect = useCallback((track: Track) => {
    onTrackSelect(track);
  }, [onTrackSelect]);
  
  return (
    // Component JSX
  );
});
```

#### 2. Bundle Optimization
- Use dynamic imports for code splitting
- Lazy load non-critical components

```typescript
// ✅ Good - Lazy loading
const AudioAnalyzer = lazy(() => import('./AudioAnalyzer'));

const WorkstationScreen: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AudioAnalyzer />
    </Suspense>
  );
};
```

### Memory Management

#### 1. Cleanup
- Clean up event listeners
- Cancel ongoing requests
- Clear timeouts and intervals

```typescript
// ✅ Good - Proper cleanup
useEffect(() => {
  const handleResize = () => {
    // Handle resize
  };
  
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

## Security Practices

### Input Validation

#### 1. Type Safety
- Validate all external data
- Use TypeScript for compile-time safety
- Implement runtime validation for API responses

```typescript
// ✅ Good - Input validation
interface CreateTrackRequest {
  name: string;
  audioFile: File;
}

const validateTrackRequest = (data: unknown): data is CreateTrackRequest => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'audioFile' in data &&
    typeof (data as any).name === 'string' &&
    (data as any).audioFile instanceof File
  );
};
```

#### 2. Sanitization
- Sanitize user inputs
- Escape HTML content
- Validate file uploads

```typescript
// ✅ Good - Input sanitization
const sanitizeTrackName = (name: string): string => {
  return name
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 100); // Limit length
};
```

## Documentation Standards

### Code Comments

#### 1. JSDoc Comments
- Document all public APIs
- Include parameter and return types
- Provide usage examples

```typescript
/**
 * Loads and processes an audio track for playback
 * @param audioFile - The audio file to load
 * @param options - Configuration options for loading
 * @returns Promise that resolves to the loaded track
 * 
 * @example
 * ```typescript
 * const track = await loadAudioTrack(file, { normalize: true });
 * ```
 */
async function loadAudioTrack(
  audioFile: File, 
  options: LoadOptions = {}
): Promise<Track> {
  // Implementation
}
```

#### 2. Inline Comments
- Explain complex logic
- Document workarounds
- Clarify business rules

```typescript
// ✅ Good - Explanatory comment
// Convert to frequency domain for spectral analysis
// Using FFT size of 2048 for optimal balance between
// frequency resolution and time resolution
const fftSize = 2048;
const analyser = audioContext.createAnalyser();
analyser.fftSize = fftSize;
```

### README Documentation
- Keep README files up to date
- Include setup instructions
- Document API endpoints
- Provide troubleshooting guides

## Git Workflow

### Commit Messages

#### 1. Format
Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

#### 2. Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tooling changes

#### 3. Examples
```
feat(audio): add real-time spectrum analyzer
fix(playback): resolve memory leak in audio buffer
docs(api): update track management endpoints
refactor(components): extract reusable UI components
```

### Branch Strategy

#### 1. Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation updates

#### 2. Pull Request Guidelines
- Write descriptive PR titles
- Include testing instructions
- Reference related issues
- Request appropriate reviewers

## Tools and Scripts

### Available Scripts

```bash
# Development
npm run dev                    # Start development server
npm run dev:vite              # Start Vite development server

# Testing
npm run test                  # Run unit tests
npm run test:visual           # Run visual regression tests
npm run test:e2e             # Run end-to-end tests

# Code Quality
npm run lint                  # Run ESLint
npm run lint:fix             # Fix ESLint issues
npm run typecheck            # Run TypeScript compiler

# Build
npm run build                # Production build
npm run preview              # Preview production build
```

### Code Quality Tools

1. **ESLint**: Enforces coding standards
2. **TypeScript**: Provides type safety
3. **Prettier**: (To be configured) Code formatting
4. **Vitest**: Unit and integration testing
5. **Playwright**: End-to-end testing

## Conclusion

These coding standards ensure our codebase remains maintainable, scalable, and consistent. All team members should familiarize themselves with these guidelines and apply them consistently.

For questions or suggestions regarding these standards, please open an issue or start a discussion in the project repository.

---

*Last updated: January 2025*
