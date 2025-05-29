# orpheus-engine

Orpheus Engine integrates the Omi device with AI to streamline music creation in your preferred DAW (Digital Audio Workstation). Use the Omi device as a recorder and AI assistant to manage DAW sessions, audio files, and creative workflows seamlessly.

## Features
- **Omi Device Integration**: Record audio directly from the Omi device.
- **AI-Assisted Workflow**: AI helps manage DAW projects, files, and creative tasks.
- **Audio Streaming**: Stream audio from Omi to your DAW for real-time track addition.
- **Modern UI**: Built with React (TypeScript) and Electron for a cross-platform desktop experience.
- **Desktop Application**: Native desktop app with Electron v36.3.1 integration ✅
- **Extensible Architecture**: Modular codebase for easy feature expansion.

## Technologies Used
- **Frontend**:
  - React (TypeScript)
  - Electron
  - Vite
- **Backend**:
  - Node.js/TypeScript
  - Python (RAG Backend)
  - Flask
- **AI/ML**:
  - ChromaDB
  - RAG (Retrieval Augmented Generation)
- **SDKs**:
  - Omi SDK
  - GPU Audio SDK

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

#### System Health & Maintenance
- `npm run system-check` - Run comprehensive system health validation
- `npm run health-check` - Alias for system-check
- `npm run fix-python-deps` - Automatically resolve Python dependency conflicts
- `npm run doctor` - Complete system repair workflow (fix dependencies + health check)
- `npm run verify-mcp` - Verify MCP (Model Context Protocol) package integration

#### Port Management
- `npm run clear-ports` - Clear Orpheus Engine ports (3000, 5000, 5173, 7008, 8000)
- `npm run clear-ports:all` - Clear all development ports (includes additional common ports)
- `npm run ports:clear` - Alias for clear-ports
- `npm run ports:kill` - Force clear all ports (aggressive cleanup)

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

Run the complete application (frontend and backend) with:
```bash
npm start
```

This will concurrently start:
- The Python RAG backend on port 5000
- The Vite/Electron frontend application

You can also run components separately:
```bash
# Run only the frontend
npm run start:frontend

# Run only the backend
npm run start:backend
```

**Desktop Application (Electron)**:
```bash
# Development mode - React + Electron together
cd orpheus-engine-workstation/frontend
npm run electron-dev

# Production mode - build and run
npm run electron-build

# Create distributable packages
npm run dist
```

The app will be available at:
- Frontend (Vite dev server): http://localhost:5173
- Python RAG Backend: http://localhost:5000

## Quick Start

1. **Clone the repository**:
```bash
git clone https://github.com/creativeplatform/orpheus-engine.git
cd orpheus-engine
```

2. **Install Dependencies**:
```bash
# Install all project dependencies (Node.js and Python)
npm run install-all

# Make shell scripts executable
npm run permissions
```

3. **Start the Application**:
```bash
# Start both frontend and backend
npm start
```

The application components will be available at:
- **Frontend UI**: http://localhost:5173
- **RAG Backend API**: http://localhost:5000
- **Audio Processing Service**: http://localhost:7008

### Component Overview

The application consists of three main parts:
1. **Frontend (OEW-Main)**: Electron/React application for the DAW interface
2. **Python RAG Backend**: AI-powered audio analysis and processing
3. **TypeScript Backend**: Audio file management and real-time processing

### Development Mode

To run components individually:

```bash
# Frontend only (Electron + Vite)
npm run start:frontend

# Python RAG Backend only
npm run start:backend

# Build the application
npm run build
```

### Troubleshooting

1. **Missing ffmpeg**:
   If you see errors about ffmpeg, ensure it's installed:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ffmpeg

   # MacOS
   brew install ffmpeg
   ```

2. **Python Dependencies**:
   If you encounter Python module errors:
   ```bash
   cd orpheus-engine-workstation/backend/agentic_rag
   pip install -r requirements.txt
   ```

3. **Port Conflicts**:
   The application uses ports 5000 (RAG), 5173 (Vite), and 7008 (Audio). Ensure these ports are available.

## Development Workflow

### Code Organization

```
orpheus-engine-workstation/
├── OEW-main/           # Frontend Electron/React application
├── backend/            # TypeScript and Python backends
│   ├── src/           # TypeScript backend source
│   └── agentic_rag/   # Python RAG backend
├── data/              # Audio files and test data
└── chroma_db/         # Vector database for audio analysis
```

### Hot Reloading

- Frontend: Vite provides hot module replacement (HMR)
- Backend: Nodemon watches for TypeScript changes
- RAG: Flask debug mode auto-reloads on changes

### Building for Production

1. **Build the application**:
```bash
npm run build
```

2. **Run tests and linting**:
```bash
npm run validate
```

3. **Create a release**:
```bash
npm run release:patch  # For patch release
npm run release:minor  # For minor release
npm run release:major  # For major release
```

### Architecture Notes

1. **Frontend**:
   - Electron for native desktop features
   - React for UI components
   - TypeScript for type safety
   - Vite for fast development

2. **Audio Processing**:
   - Real-time audio processing with Web Audio API
   - FFmpeg for audio file manipulation
   - ChromaDB for audio feature vectorization

3. **AI Integration**:
   - RAG (Retrieval Augmented Generation) for audio analysis
   - Python backend for ML tasks
   - Real-time audio feature extraction

## Project Structure
- `orpheus-engine-workstation/` – Main project directory
  - `OEW-main/` – Electron/Vite frontend app
  - `backend/` – TypeScript and Python backends
    - `src/` – TypeScript backend source
    - `agentic_rag/` – Python RAG backend
  - `data/` – Audio files and data
  - `chroma_db/` – ChromaDB vector database
  - `ffmpeg/` – Local ffmpeg binaries
- `gpuaudio-sdk/` – Omi device SDK integration
- `scripts/` – Project management scripts
- `utils/` – Shared utilities

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

## System Requirements

In addition to Node.js and npm, the following system packages are required for headless operation:
- dbus-x11
- xvfb

### Installing System Dependencies

```bash
apt-get update && apt-get install -y dbus-x11 xvfb
```

## Setup & Installation

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

#### System Health & Maintenance
- `npm run system-check` - Run comprehensive system health validation
- `npm run health-check` - Alias for system-check
- `npm run fix-python-deps` - Automatically resolve Python dependency conflicts
- `npm run doctor` - Complete system repair workflow (fix dependencies + health check)
- `npm run verify-mcp` - Verify MCP (Model Context Protocol) package integration

#### Port Management
- `npm run clear-ports` - Clear Orpheus Engine ports (3000, 5000, 5173, 7008, 8000)
- `npm run clear-ports:all` - Clear all development ports (includes additional common ports)
- `npm run ports:clear` - Alias for clear-ports
- `npm run ports:kill` - Force clear all ports (aggressive cleanup)

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

Run the complete application (frontend and backend) with:
```bash
npm start
```

This will concurrently start:
- The Python RAG backend on port 5000
- The Vite/Electron frontend application

You can also run components separately:
```bash
# Run only the frontend
npm run start:frontend

# Run only the backend
npm run start:backend
```

**Desktop Application (Electron)**:
```bash
# Development mode - React + Electron together
cd orpheus-engine-workstation/frontend
npm run electron-dev

# Production mode - build and run
npm run electron-build

# Create distributable packages
npm run dist
```

The app will be available at:
- Frontend (Vite dev server): http://localhost:5173
- Python RAG Backend: http://localhost:5000

## Quick Start

1. **Clone the repository**:
```bash
git clone https://github.com/creativeplatform/orpheus-engine.git
cd orpheus-engine
```

2. **Install Dependencies**:
```bash
# Install all project dependencies (Node.js and Python)
npm run install-all

# Make shell scripts executable
npm run permissions
```

3. **Start the Application**:
```bash
# Start both frontend and backend
npm start
```

The application components will be available at:
- **Frontend UI**: http://localhost:5173
- **RAG Backend API**: http://localhost:5000
- **Audio Processing Service**: http://localhost:7008

### Component Overview

The application consists of three main parts:
1. **Frontend (OEW-Main)**: Electron/React application for the DAW interface
2. **Python RAG Backend**: AI-powered audio analysis and processing
3. **TypeScript Backend**: Audio file management and real-time processing

### Development Mode

To run components individually:

```bash
# Frontend only (Electron + Vite)
npm run start:frontend

# Python RAG Backend only
npm run start:backend

# Build the application
npm run build
```

### Troubleshooting

1. **Missing ffmpeg**:
   If you see errors about ffmpeg, ensure it's installed:
   ```bash
   # Ubuntu/Debian
   sudo apt-get install ffmpeg

   # MacOS
   brew install ffmpeg
   ```

2. **Python Dependencies**:
   If you encounter Python module errors:
   ```bash
   cd orpheus-engine-workstation/backend/agentic_rag
   pip install -r requirements.txt
   ```

3. **Port Conflicts**:
   The application uses ports 5000 (RAG), 5173 (Vite), and 7008 (Audio). Ensure these ports are available.

## Development Workflow

### Code Organization

```
orpheus-engine-workstation/
├── OEW-main/           # Frontend Electron/React application
├── backend/            # TypeScript and Python backends
│   ├── src/           # TypeScript backend source
│   └── agentic_rag/   # Python RAG backend
├── data/              # Audio files and test data
└── chroma_db/         # Vector database for audio analysis
```

### Hot Reloading

- Frontend: Vite provides hot module replacement (HMR)
- Backend: Nodemon watches for TypeScript changes
- RAG: Flask debug mode auto-reloads on changes

### Building for Production

1. **Build the application**:
```bash
npm run build
```

2. **Run tests and linting**:
```bash
npm run validate
```

3. **Create a release**:
```bash
npm run release:patch  # For patch release
npm run release:minor  # For minor release
npm run release:major  # For major release
```

### Architecture Notes

1. **Frontend**:
   - Electron for native desktop features
   - React for UI components
   - TypeScript for type safety
   - Vite for fast development

2. **Audio Processing**:
   - Real-time audio processing with Web Audio API
   - FFmpeg for audio file manipulation
   - ChromaDB for audio feature vectorization

3. **AI Integration**:
   - RAG (Retrieval Augmented Generation) for audio analysis
   - Python backend for ML tasks
   - Real-time audio feature extraction

## Project Structure
- `orpheus-engine-workstation/` – Main project directory
  - `OEW-main/` – Electron/Vite frontend app
  - `backend/` – TypeScript and Python backends
    - `src/` – TypeScript backend source
    - `agentic_rag/` – Python RAG backend
  - `data/` – Audio files and data
  - `chroma_db/` – ChromaDB vector database
  - `ffmpeg/` – Local ffmpeg binaries
- `gpuaudio-sdk/` – Omi device SDK integration
- `scripts/` – Project management scripts
- `utils/` – Shared utilities

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

## System Requirements

In addition to Node.js and npm, the following system packages are required for headless operation:
- dbus-x11
- xvfb

### Installing System Dependencies

```bash
apt-get update && apt-get install -y dbus-x11 xvfb
```

## 🤖 AI Features

The Orpheus Engine DAW includes built-in AI capabilities powered by the Model Context Protocol (MCP). These features help streamline your workflow and enhance creativity.

### Getting Started with AI

1. The AI assistant is automatically enabled when you launch the DAW
2. Access AI features through:
   - Analysis Panel (Ctrl/Cmd + A)
   - Context menus on clips and tracks
   - The AI Assistant button in the toolbar

### Key AI Features

#### Audio Analysis
- Right-click any audio clip and select "Analyze with AI"
- Get instant feedback on:
  - Key and tempo detection
  - Chord progression analysis
  - Audio quality assessment
  - Spectral analysis

#### Arrangement Assistant
- Select multiple tracks and choose "Get AI Arrangement Suggestions"
- The AI will suggest:
  - Structure improvements
  - Section transitions
  - Part variations
  - Orchestration ideas

#### MIDI Generation
- Right-click any MIDI track and select "Generate with AI"
- Options include:
  - Continue melody
  - Generate harmony
  - Create variation
  - Match style of another clip

#### Mixing Assistant
- Select "AI Mix Suggestions" from the mixer
- Get real-time feedback on:
  - EQ adjustments
  - Dynamic processing
  - Level balancing
  - Stereo placement

### AI Configuration

Configure AI behavior in Settings > AI Assistant:
```json
{
  "creativity": 0.8,        // 0-1: How creative should suggestions be
  "response_time": "fast",  // fast/balanced/detailed
  "style_learning": true,   // Learn from your editing style
  "auto_suggest": false     // Enable/disable automatic suggestions
}
```

### Tips for Best Results

1. Keep audio clips under 2 minutes for fastest analysis
2. Use high-quality source material for better suggestions
3. Be specific when using style matching features
4. Start with "balanced" response time and adjust as needed

### Extending AI Features

Developers can extend the AI capabilities by:
1. Adding new analysis types in `src/services/ai/analysisTypes.ts`
2. Creating custom AI message handlers in `src/services/mcp/handlers/`
3. Contributing to the MCP protocol specification