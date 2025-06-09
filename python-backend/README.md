# Orpheus Engine Python Backend

A high-performance Python backend for the Orpheus Engine DAW that provides professional audio processing capabilities.

## Features

- **Real-time Audio Processing**: Low-latency audio processing using librosa and scipy
- **WebSocket Communication**: Real-time bidirectional communication with frontend
- **Native System Integration**: File dialogs, menus, and OS-level integration
- **Professional Audio Support**: Support for multiple audio formats and MIDI
- **Plugin Architecture**: Extensible effects and instrument system
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Quick Start

### Installation

```bash
cd python-backend
pip install -e .
```

### Development Installation

```bash
cd python-backend
pip install -e ".[dev,audio,gui]"
```

### Running the Backend

```bash
# Start the backend server
orpheus-backend

# Or run directly
python -m orpheus_backend.main
```

### Development Mode

```bash
# Start with auto-reload
uvicorn orpheus_backend.main:app --reload --host 127.0.0.1 --port 8000
```

## Architecture

The Python backend is designed to be a drop-in replacement for Electron's native capabilities:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │◄──►│  Python Backend  │◄──►│  Native System  │
│   (Frontend)    │    │   (FastAPI)      │    │  (File I/O)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
      │ WebSocket              │ Audio                  │ MIDI
      │ HTTP API               │ Processing             │ Hardware
      └────────────────────────┘                        └─────────
```

## API Endpoints

### WebSocket

- `ws://localhost:8000/ws` - Main WebSocket connection for real-time communication

### REST API

- `POST /api/upload-audio` - Upload audio files
- `GET /api/project/{id}` - Get project data
- `POST /api/project/{id}` - Save project data
- `GET /api/audio/analyze/{file_id}` - Audio analysis results

## Integration with Electron

The Python backend can work alongside the existing Electron setup:

1. **Development Mode**: Electron connects to Python backend via WebSocket
2. **Production Mode**: Python backend serves the React app directly
3. **Hybrid Mode**: Both Electron and Python backend run simultaneously

## Configuration

Create a `.env` file in the python-backend directory:

```env
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
AUDIO_BUFFER_SIZE=512
SAMPLE_RATE=44100
ENABLE_MIDI=true
ENABLE_GUI_DIALOGS=true
LOG_LEVEL=INFO
```

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black src/
```

### Type Checking

```bash
mypy src/
```

## License

This project is licensed under the same terms as the main Orpheus Engine project.
