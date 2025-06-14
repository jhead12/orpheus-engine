# Vitest UI Configuration Update

## Issue Resolution: Removed `--port` option

The `--port` option was causing errors with the current version of Vitest UI (v1.6.1). This option is no longer supported in recent versions of Vitest UI.

## Changes Made

1. Removed the `--port 3333` option from the following scripts in `package.json`:
   - `test:ui`
   - `test:ui:safe`

2. Updated the `scripts/run-vitest-ui-windows.ps1` PowerShell script:
   - Removed port detection and configuration
   - Removed the `--port` option from the vitest command
   - Simplified the script to focus on running Vitest UI without port customization

## How to Run Tests UI

To run the Vitest UI, use one of these commands:

```bash
# Basic UI
pnpm run test:ui

# UI with safe defaults (no auto-opening browser)
pnpm run test:ui:safe

# For Windows users with proper PowerShell handling
pnpm run test:ui:windows
```

Vitest UI will automatically select an available port and display the URL in the terminal output.

## Note

If you need to customize the port in the future, you might need to configure it through Vitest's configuration files rather than command line arguments, depending on what the current version supports.
