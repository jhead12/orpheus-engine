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

### Installation
```bash
pnpm install
# or
npm install
```

### Running the App
```bash
pnpm dev
# or
npm run dev
```

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
