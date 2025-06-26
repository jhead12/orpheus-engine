# Vitest UI Configuration Fix

## Issue

When running `pnpm run test:ui`, an error was encountered:

```
CACError: Unknown option `--port`
```

This occurred because recent versions of Vitest UI no longer support the `--port` option in the command line.

## Changes Made

1. Removed the `port` configuration from the `ui` section in `vitest.config.ts`:
   ```typescript
   ui: {
     // port: 3333,  <-- Removed this line
     host: '127.0.0.1',
     open: false, // Let's not auto-open to avoid permission issues
   },
   ```

2. Updated the `scripts/run-vitest-ui-windows.ps1` script to remove port detection and configuration.

## Notes

- Vitest UI now automatically selects an available port
- The host and open settings were kept as they are still supported
- The TypeScript errors in vitest.config.ts are related to dependency version conflicts and not directly related to the port issue
