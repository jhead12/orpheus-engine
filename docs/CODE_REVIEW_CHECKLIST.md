# Code Review Checklist

## Overview

This checklist ensures consistent and thorough code reviews for the Orpheus Engine project. Use this as a guide when reviewing pull requests or conducting code audits.

## Pre-Review Setup

- [ ] Pull request has a clear title and description
- [ ] Changes are focused on a single feature/fix
- [ ] All CI checks are passing
- [ ] Branch is up to date with target branch

## Code Quality

### TypeScript & Type Safety

- [ ] No use of `any` type (or properly justified)
- [ ] Interfaces and types are properly defined
- [ ] Type imports use `import type` when appropriate
- [ ] Generic types are used effectively
- [ ] Null/undefined handling is explicit

```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email?: string; // Optional is explicit
}

const user: UserProfile | null = await fetchUser(id);
if (user) {
  // Null check before use
  console.log(user.name);
}

// ❌ Avoid
const user: any = await fetchUser(id);
console.log(user.name); // No type safety
```

### React Components

- [ ] Components are properly typed with interfaces
- [ ] Props are destructured with default values
- [ ] Event handlers use correct event types
- [ ] useEffect dependencies are correct
- [ ] No inline object/function creation in JSX
- [ ] Proper key props for list items

```typescript
// ✅ Good
interface ButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  variant = 'primary', 
  disabled = false 
}) => {
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      onClick(event);
    }
  }, [onClick, disabled]);

  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

### Performance

- [ ] React.memo used for expensive components
- [ ] useMemo used for expensive calculations
- [ ] useCallback used for event handlers
- [ ] Lazy loading implemented where appropriate
- [ ] No memory leaks (cleanup in useEffect)

```typescript
// ✅ Good - Memoization
const ExpensiveComponent = React.memo<Props>(({ data, onSelect }) => {
  const processedData = useMemo(() => 
    data.filter(item => item.isValid).sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  const handleSelect = useCallback((item: DataItem) => {
    onSelect(item);
  }, [onSelect]);

  useEffect(() => {
    const timer = setInterval(() => {
      // Some periodic task
    }, 1000);

    return () => clearInterval(timer); // Cleanup
  }, []);

  return (
    // Component JSX
  );
});
```

## Code Structure

### File Organization

- [ ] Files are in appropriate directories
- [ ] Consistent naming conventions
- [ ] Path aliases used instead of relative imports
- [ ] Barrel exports used where appropriate

```typescript
// ✅ Good - Path aliases
import { AudioService } from '@orpheus/services';
import { TrackComponent } from '@orpheus/components';
import { useWorkstation } from '@orpheus/contexts';

// ❌ Avoid - Relative imports
import { AudioService } from '../../../services/AudioService';
import { TrackComponent } from '../../components/TrackComponent';
```

### Function Design

- [ ] Functions have single responsibility
- [ ] Function names are descriptive
- [ ] Parameters are properly typed
- [ ] Return types are explicit for public APIs
- [ ] Error handling is appropriate

```typescript
// ✅ Good
async function loadAudioTrack(
  file: File,
  options: LoadOptions = {}
): Promise<AudioTrack> {
  try {
    const audioBuffer = await file.arrayBuffer();
    const track = await processAudioData(audioBuffer, options);
    return track;
  } catch (error) {
    throw new AudioLoadError(`Failed to load audio track: ${error.message}`);
  }
}

// ❌ Avoid
function load(f: any): any {
  // Unclear purpose, no error handling
  return f.getData();
}
```

## Testing

### Test Coverage

- [ ] New components have unit tests
- [ ] Critical logic has test coverage
- [ ] Edge cases are tested
- [ ] Error conditions are tested
- [ ] Integration tests for complex features

### Test Quality

- [ ] Tests are focused and atomic
- [ ] Test names describe behavior
- [ ] Mocks are properly typed
- [ ] Test data is realistic
- [ ] Tests are deterministic

```typescript
// ✅ Good test structure
describe('AudioPlayer', () => {
  describe('when audio is loaded', () => {
    beforeEach(() => {
      // Setup for this test group
    });

    it('should display track duration correctly', () => {
      const mockTrack = createMockTrack({ duration: 180 });
      render(<AudioPlayer track={mockTrack} />);
      
      expect(screen.getByText('3:00')).toBeInTheDocument();
    });

    it('should enable play button', () => {
      const mockTrack = createMockTrack();
      render(<AudioPlayer track={mockTrack} />);
      
      expect(screen.getByRole('button', { name: /play/i })).toBeEnabled();
    });
  });

  describe('when no audio is loaded', () => {
    it('should disable play button', () => {
      render(<AudioPlayer track={null} />);
      
      expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
    });
  });
});
```

## Security

### Input Validation

- [ ] User inputs are validated
- [ ] File uploads are restricted
- [ ] URLs are validated
- [ ] No innerHTML with user content

```typescript
// ✅ Good - Input validation
function validateTrackName(name: string): boolean {
  return (
    typeof name === 'string' &&
    name.trim().length > 0 &&
    name.length <= 100 &&
    !/[<>"]/.test(name) // No HTML injection
  );
}

const sanitizedName = trackName.trim().substring(0, 100);
```

### Data Handling

- [ ] Sensitive data is not logged
- [ ] API responses are validated
- [ ] Error messages don't leak information
- [ ] HTTPS used for external requests

## Performance

### Bundle Size

- [ ] No unnecessary dependencies
- [ ] Tree shaking is effective
- [ ] Dynamic imports for large modules
- [ ] Images are optimized

### Runtime Performance

- [ ] No unnecessary re-renders
- [ ] Efficient algorithms used
- [ ] Memory usage is reasonable
- [ ] No blocking operations on main thread

## Documentation

### Code Documentation

- [ ] Complex logic is commented
- [ ] Public APIs have JSDoc comments
- [ ] Type definitions are documented
- [ ] Examples provided where helpful

```typescript
/**
 * Analyzes audio frequency spectrum and returns dominant frequencies
 * 
 * @param audioBuffer - The audio data to analyze
 * @param options - Analysis configuration
 * @returns Array of frequency data with amplitudes
 * 
 * @example
 * ```typescript
 * const spectrum = analyzeFrequencySpectrum(buffer, { 
 *   fftSize: 2048,
 *   smoothing: 0.8 
 * });
 * ```
 */
function analyzeFrequencySpectrum(
  audioBuffer: AudioBuffer,
  options: AnalysisOptions = {}
): FrequencyData[] {
  // Implementation
}
```

### README Updates

- [ ] README reflects new features
- [ ] Setup instructions are current
- [ ] API documentation is updated
- [ ] Troubleshooting guides are current

## Git & Workflow

### Commit Quality

- [ ] Commits follow conventional format
- [ ] Commit messages are descriptive
- [ ] Commits are atomic (single purpose)
- [ ] No debug code or commented code

```bash
# ✅ Good commit messages
feat(audio): add real-time spectrum analyzer
fix(playback): resolve memory leak in audio buffer
docs(api): update track management endpoints
refactor(ui): extract reusable button component

# ❌ Avoid
fix stuff
wip
update code
```

### Branch Strategy

- [ ] Branch name follows convention
- [ ] Feature branches are focused
- [ ] No merge commits in feature branches
- [ ] Clean git history

## Final Checklist

Before approving a pull request:

- [ ] All automated checks pass
- [ ] Code follows project standards
- [ ] Tests are comprehensive
- [ ] Documentation is updated
- [ ] No breaking changes without migration guide
- [ ] Performance impact assessed
- [ ] Security implications considered

## Review Comments

When providing feedback:

- [ ] Be constructive and specific
- [ ] Explain the reasoning behind suggestions
- [ ] Provide code examples when helpful
- [ ] Acknowledge good practices
- [ ] Distinguish between critical issues and suggestions

### Comment Examples

```markdown
**Critical:** This could cause a memory leak
```typescript
// Current code
useEffect(() => {
  const timer = setInterval(updateData, 1000);
}, []);

// Suggested fix
useEffect(() => {
  const timer = setInterval(updateData, 1000);
  return () => clearInterval(timer); // Add cleanup
}, []);
```

**Suggestion:** Consider memoizing this calculation for better performance
```typescript
// Instead of calculating on every render
const sortedTracks = tracks.sort(...);

// Consider memoizing
const sortedTracks = useMemo(() => tracks.sort(...), [tracks]);
```

**Good practice:** Excellent use of TypeScript generics here! 👏
```

---

*This checklist should be used as a guide. Adapt it based on the specific context and complexity of the changes being reviewed.*
