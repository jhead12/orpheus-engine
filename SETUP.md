# Orpheus Engine Setup Guide

This guide will help you get Orpheus Engine up and running on your system.

## Quick Setup

For new users, simply run:

```bash
npm install
```

This will automatically:
- Download and update git submodules
- Set up Python dependencies
- Install Node.js dependencies
- Check workspace structure
- Fix file permissions

## Manual Setup

If you prefer to run setup steps manually:

1. **Install git submodules:**
   ```bash
   npm run setup-submodules
   ```

2. **Set up Python environment:**
   ```bash
   npm run setup-python
   ```

3. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

4. **Fix permissions:**
   ```bash
   npm run fix-permissions
   ```

## Starting the Application

Once setup is complete, start the integrated DAW:

```bash
npm start
```

This will:
- Launch the Electron application
- Start all backend services
- Display a loading screen while services initialize
- Open the DAW interface when ready

## Troubleshooting

### Port Conflicts
If you encounter port conflicts (especially on macOS with Control Center):

```bash
npm run clear-ports
```

### System Check
To verify your installation:

```bash
npm run system-check
```

### Full Clean Reinstall
If you need to start fresh:

```bash
npm run clean
npm install
```

### Git Submodules
If submodules are not properly downloaded:

```bash
git submodule init
git submodule update --recursive
```

## Development

For development with hot reloading:

```bash
npm run dev
```

This starts the backend and DAW in development mode.

## System Requirements

- **Node.js**: >= 16.0.0
- **npm**: >= 7.0.0
- **Python**: >= 3.8
- **Git**: For submodule management
- **macOS/Linux**: Recommended (Windows support experimental)

## Project Structure

- `OEW-main/` - Main DAW application (React/TypeScript)
- `orpheus-engine-workstation/backend/` - Python backend API
- `electron/` - Electron main process and service management
- `scripts/` - Setup and utility scripts

## Getting Help

- Check the main README.md for detailed documentation
- Run `npm run system-check` to diagnose issues
- Check the GitHub issues for known problems
