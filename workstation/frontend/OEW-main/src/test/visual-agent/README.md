# Visual Testing Agent

This directory contains tools and utilities for automating visual regression tests for the OEW application.

## Overview

The Visual Testing Agent provides:

1. **Test Generation** - Automated creation of visual tests for components
2. **GIF Recording** - Ability to generate animated GIFs of component interactions
3. **CLI Interface** - Commands for running and managing visual tests

## Getting Started

```bash
# Generate visual tests for all components
npm run generate:visual-tests

# Generate test for a specific component
npm run generate:visual-test DNR

# Run visual tests
npm run test:visual

# Run visual tests and generate GIFs
npm run test:visual:gif

# Update visual test snapshots
npm run test:visual:update
```

## Configuration

Component test configurations are stored in `src/test/visual-agent/configs/`.
See `DNRConfig.ts` for an example of how to configure tests for a component.
