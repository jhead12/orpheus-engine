# orpheus-engine

Orpheus Engine integrates the Omi device with AI to streamline music creation in your preferred DAW (Digital Audio Workstation). Use the Omi device as a recorder and AI assistant to manage DAW sessions, audio files, and creative workflows seamlessly.

## Features
- **Omi Device Integration**: Record audio directly from the Omi device.
- **AI-Assisted Workflow**: AI helps manage DAW projects, files, and creative tasks.
- **Audio Streaming**: Stream audio from Omi to your DAW for real-time track addition.
- **Modern UI**: Built with React (TypeScript) and Electron for a cross-platform desktop experience.
- **Extensible Architecture**: Modular codebase for easy feature expansion.

## Technologies Used
- **React** (TypeScript)
- **Electron**
- **Vite**
- **Node.js**
- **Omi SDK**

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- pnpm or npm

### Installation and Setup

1. Install all dependencies with a single command:
```bash
npm run install-all
```

This will install:
- Root project dependencies
- Frontend dependencies
- Backend dependencies
- Python dependencies

2. Make all shell scripts executable:
```bash
npm run permissions
```

### Available Commands

#### Development
- `npm run install-all` - Install all dependencies across the monorepo
- `npm run permissions` - Make all shell scripts executable
- `npm run build` - Build the frontend application
- `npm run test` - Run all tests (frontend and backend)
- `npm run lint` - Run linting on all code

#### Version Management
- `npm run version:major` - Bump major version (1.0.0 -> 2.0.0)
- `npm run version:minor` - Bump minor version (1.0.0 -> 1.1.0)
- `npm run version:patch` - Bump patch version (1.0.0 -> 1.0.1)

#### Release Management
- `npm run release:prepare` - Prepare for a release (merge develop into main)
- `npm run release:major` - Prepare and release major version
- `npm run release:minor` - Prepare and release minor version
- `npm run release:patch` - Prepare and release patch version

#### Branch Management
- `npm run branch:feature --name=feature-name` - Create a new feature branch
- `npm run branch:hotfix --name=hotfix-name` - Create a new hotfix branch
- `npm run branch:cleanup` - Clean up merged branches

### Running the App
```bash
# From the orpheus-engine-workstation directory
./start-dev.sh
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

### Directory Structure
- `src/` – Main React app source code
- `OEW-main/` – Electron app and build config
- `gpuaudio-sdk/` – Omi device SDK integration
- `data/` – Example audio files
- `assets/` – UI assets (audio, fonts, images)

## Troubleshooting: Using a Local ffmpeg Binary

If you encounter the error `FileNotFoundError: [Errno 2] No such file or directory: 'ffmpeg'` when running audio transcription or processing code, it means the system cannot find the `ffmpeg` executable. This is common if you have a local build of ffmpeg (such as in the `./ffmpeg` directory) and it is not installed globally.

### Solution: Add Local ffmpeg to PATH

Before running any code that uses `ffmpeg` (such as Whisper or torchaudio), add the following lines to your notebook or Python script:

```python
import os
ffmpeg_dir = os.path.abspath("./ffmpeg")
os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
```

This ensures that Python and any subprocesses can find and use your local `ffmpeg` binary.

**Note:**
- Make sure `./ffmpeg/ffmpeg` exists and is executable (`chmod +x ./ffmpeg/ffmpeg` if needed).
- Add these lines before importing libraries like `whisper` or `torchaudio`.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
See [LICENSE](LICENSE) for details.
