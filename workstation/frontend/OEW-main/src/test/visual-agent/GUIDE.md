# Visual Testing Guide for OEW

This document provides a comprehensive guide to working with the Visual Testing Agent for the OEW application.

## Overview

The Visual Testing Agent is a tool that helps automate the creation and execution of visual regression tests for UI components. It supports:

1. Static screenshot testing
2. Animated GIF recording for interactive components
3. Batch test generation for multiple components

## Getting Started

### Prerequisites

Make sure you have all dependencies installed:

```bash
pnpm install
```

### Running Visual Tests

```bash
# Run all visual tests
pnpm run test:visual

# Run only GIF-based visual tests
pnpm run test:visual:gif

# Update visual test snapshots
pnpm run test:visual:update

# Update GIF-based test snapshots
pnpm run test:visual:gif:update
```

### Generating Visual Tests

```bash
# Generate tests for all components
pnpm run generate:visual-tests

# Generate test for a specific component
pnpm run generate:visual-test DNR  # Replace DNR with component name

# List all available components
pnpm run list:visual-tests
```

## How It Works

### Directory Structure

```
src/
  test/
    visual-agent/            # Visual testing agent code
      configs/               # Component test configurations
        index.ts             # Config registry
        DNRConfig.ts         # DNR component config
        ScrollbarConfig.ts   # Scrollbar component config
        ...
      cli.ts                 # CLI implementation
      generate-test.ts       # Test file generator
      gif-recorder.ts        # GIF recording utility
      types.ts               # TypeScript types
    helpers.ts               # Screenshot test helpers
```

### Adding a New Component Test

1. Create a new configuration file in `src/test/visual-agent/configs/`
2. Add the component to the `index.ts` in the configs directory
3. Generate the test with `pnpm run generate:visual-test YourComponent`

### Configuration Example

Create a file in `src/test/visual-agent/configs/YourComponentConfig.ts`:

```typescript
import { VisualTestConfig } from "../types";

export const YourComponentConfig: VisualTestConfig = {
  componentName: "YourComponent",
  importPath: "../../path/to/YourComponent",
  props: {
    // Base props for all test cases
    value: 50,
    onChange: () => {},
  },
  states: [
    {
      name: "default",
      props: {}, // Uses base props
    },
    {
      name: "active",
      props: { active: true }, // Overrides or adds to base props
    },
    {
      name: "interactive",
      interactions: [
        {
          type: "click",
          target: "button",
          delay: 300,
        },
        {
          type: "mousemove",
          target: "slider",
          value: { clientX: 200, clientY: 150 },
          delay: 500,
        },
      ],
      captureGif: true, // Record a GIF for this state
    },
  ],
  containerStyle: `
    width: 400px;
    height: 300px;
    background: #1e1e1e;
    padding: 20px;
  `,
  animationDuration: 2000, // Duration for GIF recording in ms
};
```

### Test Patterns

#### Static Screenshots

Use the `@visual` tag for static screenshots:

```typescript
it("visual test: renders component @visual", async () => {
  // Test code
  await expectScreenshot(container, "component-state");
});
```

#### Animated GIFs

Use the `@visual-gif` tag for animated GIFs:

```typescript
it("visual test: animates component @visual-gif", async () => {
  // Test with interactions
  await recordGif(container, "component-animation", 2000);
});
```

## Best Practices

1. **Test Different States**: Test components in their various states (default, active, disabled, etc.)

2. **Use Descriptive Names**: Name your test cases clearly to understand what's being tested

3. **Isolate Components**: Test components in isolation when possible

4. **Minimize Animation Duration**: Keep GIF recordings short to avoid large files

5. **Standardize Container Styles**: Use consistent container styles for similar components

## Troubleshooting

### Tests Failing Due to Minor Pixel Differences

Update the snapshots if the differences are expected:

```bash
pnpm run test:visual:update
```

### GIF Recording Issues

If GIF recording fails:

1. Check that the container is properly accessible in the DOM
2. Ensure interactions are targeting elements with the correct test IDs
3. Try increasing timeout durations for complex animations

### Missing Dependencies

If you encounter errors about missing dependencies:

```bash
pnpm install node-html-to-image playwright jest-image-snapshot
```
