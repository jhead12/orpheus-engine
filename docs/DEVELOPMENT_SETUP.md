# Development Setup Guide

## Quick Start

```bash
# 1. Clone and setup the project
git clone [repository-url]
cd orpheus-engine/workstation/frontend/OEW-main

# 2. Install dependencies
npm install

# 3. Setup development environment
npm run setup:all

# 4. Run quality checks
npm run quality:check

# 5. Start development
npm run dev
```

## Prerequisites

### Required Software

- **Node.js**: >= 20.19.0
- **pnpm**: >= 10.6.4 (recommended) or npm
- **Git**: Latest version
- **VS Code**: Recommended editor

### Recommended VS Code Extensions

- **TypeScript**: Built-in TypeScript support
- **ESLint**: Real-time linting
- **Prettier**: Code formatting
- **Auto Rename Tag**: HTML/JSX tag renaming
- **Bracket Pair Colorizer**: Better bracket visualization
- **GitLens**: Enhanced Git integration
- **Thunder Client**: API testing (optional)

Install all at once:
```bash
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension formulahendry.auto-rename-tag
code --install-extension CoenraadS.bracket-pair-colorizer
code --install-extension eamodio.gitlens
```

## Project Structure

```
orpheus-engine/workstation/frontend/OEW-main/
├── docs/                     # Documentation
│   ├── CODING_STANDARDS.md   # Coding best practices
│   └── CODE_REVIEW_CHECKLIST.md
├── src/                      # Source code
│   ├── components/           # Reusable UI components
│   ├── screens/             # Page-level components
│   ├── contexts/            # React contexts
│   ├── services/            # Business logic & APIs
│   ├── test/                # Test utilities
│   └── types/               # TypeScript definitions
├── scripts/                 # Build and utility scripts
├── .githooks/               # Git hooks
├── electron/                # Electron main process
└── public/                  # Static assets
```

## Development Workflow

### 1. Code Quality Setup

The project enforces high code quality standards through:

- **TypeScript**: Strict type checking
- **ESLint**: Code linting and style enforcement
- **Prettier**: Consistent code formatting
- **Vitest**: Unit and integration testing
- **Git Hooks**: Automated quality checks

### 2. Available Scripts

```bash
# Development
npm run dev                 # Start Electron app
npm run dev:vite           # Start web development server
npm run dev:local          # Start on localhost:3000

# Code Quality
npm run lint               # Check for linting errors
npm run lint:fix           # Fix auto-fixable linting errors
npm run format             # Format code with Prettier
npm run format:check       # Check if code is formatted
npm run typecheck          # Run TypeScript compiler
npm run quality:check      # Run all quality checks
npm run quality:fix        # Fix formatting and linting issues

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:ui            # Run tests with UI
npm run test:visual        # Run visual regression tests
npm run test:e2e           # Run end-to-end tests

# Build
npm run build              # Production build
npm run preview            # Preview production build

# Setup
npm run setup:all          # Setup everything (electron + hooks)
npm run setup:hooks        # Setup git hooks
npm run setup:electron     # Setup electron symlinks
```

### 3. Git Workflow

#### Branching Strategy

```bash
# Feature development
git checkout -b feature/audio-analyzer
git checkout -b fix/memory-leak-playback
git checkout -b refactor/component-extraction
git checkout -b docs/api-documentation
```

#### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build/tooling

**Examples:**
```bash
git commit -m "feat(audio): add real-time spectrum analyzer"
git commit -m "fix(playback): resolve memory leak in audio buffer"
git commit -m "docs(readme): update installation instructions"
```

#### Pre-commit Hooks

Git hooks automatically run before commits to ensure code quality:

1. **Prettier**: Formats staged files
2. **ESLint**: Lints and fixes staged files
3. **TypeScript**: Checks for type errors

To skip hooks temporarily (not recommended):
```bash
git commit --no-verify
```

## Code Standards

### TypeScript Guidelines

```typescript
// ✅ Good: Explicit interfaces and types
interface AudioTrackProps {
  track: AudioTrack;
  onPlay?: (track: AudioTrack) => void;
  className?: string;
}

const AudioTrackComponent: React.FC<AudioTrackProps> = ({ 
  track, 
  onPlay, 
  className = '' 
}) => {
  const handlePlay = useCallback(() => {
    onPlay?.(track);
  }, [onPlay, track]);

  return (
    <div className={`audio-track ${className}`}>
      <button onClick={handlePlay}>Play</button>
    </div>
  );
};

// ❌ Avoid: Any types and unclear interfaces
const Component = ({ data }: any) => {
  return <div onClick={() => data.play()}>{data.name}</div>;
};
```

### Import Organization

```typescript
// 1. External libraries
import React, { useState, useCallback } from 'react';
import { Button, Typography } from '@mui/material';

// 2. Internal modules (using path aliases)
import { AudioService } from '@orpheus/services';
import { useWorkstation } from '@orpheus/contexts';
import { Track } from '@orpheus/types';

// 3. Relative imports
import './Component.css';
```

### Path Aliases

The project uses path aliases for cleaner imports:

```typescript
// ✅ Use aliases
import { TrackComponent } from '@orpheus/components';
import { useAuth } from '@orpheus/contexts';
import { AudioUtils } from '@orpheus/utils';

// ❌ Avoid relative paths
import { TrackComponent } from '../../components/TrackComponent';
import { useAuth } from '../../../contexts/AuthContext';
```

## Testing Strategy

### Test Types

1. **Unit Tests**: Test individual components/functions
2. **Integration Tests**: Test component interactions
3. **Visual Tests**: Test UI appearance
4. **E2E Tests**: Test complete user workflows

### Test Structure

```typescript
describe('Component Name', () => {
  describe('when condition', () => {
    it('should behavior', () => {
      // Arrange
      const props = { /* test props */ };
      
      // Act
      render(<Component {...props} />);
      
      // Assert
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- AudioPlayer.test.tsx

# Run tests with UI
npm run test:ui

# Run visual regression tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update
```

## Performance Guidelines

### React Performance

```typescript
// ✅ Good: Memoization for expensive operations
const ExpensiveList = React.memo<ListProps>(({ items, onSelect }) => {
  const sortedItems = useMemo(() => 
    items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );

  const handleSelect = useCallback((item: Item) => {
    onSelect(item);
  }, [onSelect]);

  return (
    <div>
      {sortedItems.map(item => (
        <ListItem 
          key={item.id} 
          item={item} 
          onSelect={handleSelect} 
        />
      ))}
    </div>
  );
});

// ✅ Good: Cleanup in useEffect
useEffect(() => {
  const timer = setInterval(updateData, 1000);
  return () => clearInterval(timer);
}, []);
```

### Bundle Optimization

- Use dynamic imports for code splitting
- Lazy load non-critical components
- Optimize images and assets
- Remove unused dependencies

## Debugging

### Development Tools

1. **React DevTools**: Component debugging
2. **Redux DevTools**: State management debugging
3. **Chrome DevTools**: Performance profiling
4. **VS Code Debugger**: Step-through debugging

### Common Issues

#### TypeScript Errors

```bash
# Check for type errors
npm run typecheck

# Common fixes
npm run lint:fix
npm run format
```

#### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for dependency conflicts
npm ls
```

#### Test Failures

```bash
# Run specific test
npm test -- --testNamePattern="Component Name"

# Update snapshots
npm run test:visual:update

# Check test coverage
npm run test -- --coverage
```

## Contributing

### Before Starting

1. Read the [Coding Standards](./CODING_STANDARDS.md)
2. Review the [Code Review Checklist](./CODE_REVIEW_CHECKLIST.md)
3. Setup git hooks: `npm run setup:hooks`
4. Run quality checks: `npm run quality:check`

### Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop with Quality Checks**
   ```bash
   # Make changes
   # Run tests in watch mode
   npm run test:watch
   
   # Check code quality frequently
   npm run quality:fix
   ```

3. **Before Committing**
   ```bash
   # Run full quality check
   npm run quality:check
   
   # Commit (hooks will run automatically)
   git commit -m "feat(scope): description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request in GitHub
   ```

### Pull Request Guidelines

- Write clear PR title and description
- Include testing instructions
- Reference related issues
- Ensure all CI checks pass
- Request appropriate reviewers

## Troubleshooting

### Common Setup Issues

#### Node Version Issues
```bash
# Check Node version
node --version

# Use Node Version Manager
nvm install 20.19.0
nvm use 20.19.0
```

#### Permission Issues
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
```

#### Git Hooks Not Working
```bash
# Reinstall hooks
npm run setup:hooks

# Check hook permissions
ls -la .git/hooks/
```

### Performance Issues

#### Slow Development Server
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Restart development server
npm run dev:vite
```

#### Memory Issues
```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

## Resources

### Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [ESLint Rules](https://eslint.org/docs/rules/)

### Project Resources

- [Coding Standards](./CODING_STANDARDS.md)
- [Code Review Checklist](./CODE_REVIEW_CHECKLIST.md)
- [API Documentation](./API.md) (if available)

### Getting Help

1. Check existing documentation
2. Search issues in the repository
3. Ask in team chat/discussions
4. Create a detailed issue with reproduction steps

---

**Happy coding! 🚀**

*Last updated: January 2025*
