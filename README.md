# Orpheus Engine

**Version 1.0.18** - Professional AI-Powered Digital Audio Workstation

Orpheus Engine integrates the Omi device with AI to streamline music creation in your preferred DAW (Digital Audio Workstation). Use the Omi device as a recorder and AI assistant to manage DAW sessions, audio files, and creative workflows seamlessly.

## 🆕 What's New in v1.0.18

### Recent Features & Improvements
- **✨ Complete TypeScript Error Resolution**: Achieved 100% TypeScript compilation success with zero errors across the entire codebase
- **🔧 Enhanced Type Safety**: Added comprehensive type definitions and interfaces for robust development experience
- **🧩 Advanced Plugin System**: Extensible audio export plugin architecture with built-in and external plugin support
- **🎵 Audio Exporting & Recording**: Complete audio export and recording capabilities with multiple format support
- **⚡ Complete Electron Integration**: Full desktop application experience
- **🔧 Enhanced Build System**: Improved TypeScript compilation and ESLint configuration
- **🧩 Component Consolidation**: Streamlined Lane, SidePanel, and UI components
- **🍎 macOS Support**: Improved Python dependency handling for macOS systems
- **🐛 Bug Fixes**: Resolved merge conflicts, tokenizers compilation issues, and workspace path updates

### Recent Bug Fixes
- **✅ TypeScript Error Resolution**: Fixed all 18 TypeScript compilation errors across multiple components
  - Resolved `AudioRecorderComponent.tsx` method signature issues
  - Fixed `AudioLibrary.tsx` interface compatibility problems
  - Consolidated `App.tsx` conflicts and cleaned up duplicate files
  - Updated `MultiSourceRecorderComponent` import conflicts
  - Added proper type annotations to test files (`ProjectFileOperations.test.tsx`)
- **🧪 Test Suite Improvements**: Enhanced test file type safety with proper mock object interfaces
- **📁 Code Organization**: Consolidated conflicting files and archived legacy versions
- Fixed tokenizers compilation issues for Python 3.12
- Resolved merge conflicts in App.tsx and types.ts
- Updated workspace paths from `orpheus-engine-workstation` to `workstation`
- Improved TimelinePosition class implementation
- Fixed release preparation scripts for proper branch merging

For complete changelog, see [CHANGELOG.md](CHANGELOG.md)

## ✨ Features
- **🎤 Omi Device Integration**: Record audio directly from the Omi device
- **🤖 AI-Assisted Workflow**: AI helps manage DAW projects, files, and creative tasks
- **📡 Audio Streaming**: Stream audio from Omi to your DAW for real-time track addition
- **🎨 Modern UI**: Built with React (TypeScript) and Electron for a cross-platform desktop experience
- **💻 Desktop Application**: Native desktop app with Electron v36.3.1 integration ✅
- **✨ Type-Safe Development**: 100% TypeScript compliance with comprehensive type definitions for robust development
- **🧩 Plugin System**: Extensible plugin architecture for audio export and processing
- **🔗 Blockchain Integration**: IPFS storage and Story Protocol support for decentralized audio
- **🔧 Extensible Architecture**: Modular codebase for easy feature expansion
- **🌐 Server-Agnostic Configuration**: Deploy anywhere with environment-based configuration
- **🎛️ Professional DAW Interface**: FL Studio-inspired transport controls and audio processing
- **📊 Advanced Audio Analysis**: Real-time spectral analysis and AI-powered audio features
- **🧪 Comprehensive Testing**: Well-tested components with proper type safety in test suites

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
- **Blockchain**:
  - IPFS Integration
  - Story Protocol
  - Web3 Technologies
- **SDKs**:
  - Omi SDK
  - GPU Audio SDK

## 💻 Development Experience

### Type Safety & Code Quality
- **✅ 100% TypeScript Compliance**: Zero compilation errors across the entire codebase
- **🔧 Comprehensive Type Definitions**: Fully typed interfaces for all components and services
- **🧪 Type-Safe Testing**: Mock objects and test fixtures with proper type annotations
- **⚡ Fast Development**: Instant type checking and IntelliSense support
- **🛡️ Error Prevention**: Catch potential issues at compile-time rather than runtime

### Developer Tools
- **Real-time Type Checking**: Integrated with build process for immediate feedback
- **Automated Testing**: Comprehensive test suite with type-safe mocks
- **Modern Tooling**: Vite for fast builds, ESLint for code quality
- **Hot Module Replacement**: Instant updates during development

### Code Organization
- **Modular Architecture**: Well-structured components with clear interfaces
- **Clean Separation**: Frontend, backend, and service layers properly isolated
- **Plugin System**: Extensible architecture for custom functionality
- **Documentation**: Comprehensive inline documentation and type definitions

## 🧩 Plugin System

Orpheus Engine features a powerful plugin system for extending audio export capabilities:

### Built-in Plugins
- **Local File Plugin**: Export audio files to local storage
- **IPFS Plugin**: Decentralized storage on IPFS network
- **Story Protocol Plugin**: Blockchain-based intellectual property protection
- **Cloud Storage Plugin**: Integration with cloud storage providers

### Plugin Architecture
```typescript
// Example plugin usage
import { pluginManager } from '@services/plugins/PluginManager';

// Load and initialize plugins
await pluginManager.loadPlugins();

// Export audio with automatic plugin selection
const result = await pluginManager.export(audioClips, {
  blockchain: { storyProtocol: { enabled: true } },
  storage: { provider: 'ipfs' },
  metadata: { title: 'My Track', artist: 'Artist Name' }
});

// Get plugin recommendations
const recommendations = pluginManager.getExportRecommendations(options);
```

### Installing External Plugins
```bash
# Install plugin from npm
npm run plugin:install @orpheus/plugin-name

# Install from URL
npm run plugin:install https://example.com/plugin.js

# List installed plugins
npm run plugin:list
```

### Developing Plugins
Create custom plugins by implementing the `AudioExportPlugin` interface:

```typescript
import { AudioExportPlugin, PluginMetadata } from '@services/plugins/types';

export class MyCustomPlugin implements AudioExportPlugin {
  metadata: PluginMetadata = {
    id: 'my-custom-plugin',
    name: 'My Custom Plugin',
    version: '1.0.0',
    category: 'storage',
    supportedFormats: ['wav', 'mp3'],
    tags: ['custom', 'export']
  };

  async initialize(config: any, context: PluginContext): Promise<void> {
    // Plugin initialization
  }

  async exportClip(clip: Clip, options: ExportPluginOptions): Promise<PluginExportResult> {
    // Export logic
  }

  canHandle(options: ExportPluginOptions): boolean {
    // Return true if plugin can handle the export
  }
}
```

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

### Available Commands

#### Development & Startup
- `npm run install-all` - Install all dependencies across the monorepo
- `npm run install-all:force` - Force reinstall all dependencies (cleans node_modules first)
- `npm start` - Start the complete application (frontend, backend, and DAW)
- `npm run dev` - Start development mode (RAG backend, audio backend, and DAW)
- `npm run permissions` - Make all shell scripts executable

#### Component Services
- `npm run start:frontend` - Start frontend only (Electron + React)
- `npm run start:daw` - Start DAW interface only
- `npm run start:daw:local` - Start DAW interface locally
- `npm run start:daw:headless` - Start DAW in headless mode
- `npm run start:rag-backend` - Start Python RAG backend (port 5001)
- `npm run start:audio-backend` - Start audio processing backend (port 7008)
- `npm run start:monitor-backend` - Start monitoring backend (port 8000)
- `npm run start:vite` - Start Vite development server
- `npm run start:electron` - Build and start Electron application

#### Building & Testing
- `npm run build` - Build the frontend application
- `npm run build:electron` - Build Electron components only
- `npm run build-all` - Build all workspace components
- `npm test` - Run all tests (frontend and backend)
- `npm run test:frontend` - Run frontend tests only
- `npm run lint` - Run linting on all code
- `npm run lint:frontend` - Run frontend linting
- `npm run validate` - Run tests and linting
- `npm run typecheck` - Run TypeScript type checking ✅ **Zero errors achieved!**

> **🎯 Code Quality**: The codebase now maintains 100% TypeScript compliance with zero compilation errors, ensuring robust type safety and improved developer experience.

#### System Health & Maintenance
- `npm run system-check` - Run comprehensive system health validation
- `npm run fix-permissions` - Fix npm cache permissions
- `npm run fix-python-deps` - Automatically resolve Python dependency conflicts
- `npm run fix-tokenizers` - Fix tokenizers compilation issues
- `npm run fix-tokenizers-macos` - Fix tokenizers for macOS
- `npm run fix-sentence-transformers` - Fix sentence transformers dependencies
- `npm run fix-vite` - Install missing Vite dependencies
- `npm run fix-electron-path` - Fix Electron path issues
- `npm run fix-vite-path` - Fix Vite path not found issues
- `npm run setup-python` - Set up Python environment
- `npm run setup-symlinks` - Set up project symlinks
- `npm run update-submodules` - Update Git submodules

#### Workspace Management
- `npm run clean` - Clean workspace and reinstall dependencies
- `npm run clean-only` - Clean workspace without reinstalling
- `npm run sync-versions` - Synchronize versions across workspaces

#### Version Management
- `npm run version:patch` - Bump patch version (1.0.0 -> 1.0.1)
- `npm run version:minor` - Bump minor version (1.0.0 -> 1.1.0)
- `npm run version:major` - Bump major version (1.0.0 -> 2.0.0)
- `npm run changelog` - Generate changelog entries

#### Release Management
- `npm run release:prepare` - Prepare for a release (merge develop into main)
- `npm run release:patch` - Prepare and release patch version
- `npm run release:minor` - Prepare and release minor version
- `npm run release:major` - Prepare and release major version

#### Branch Management
- `npm run branch:feature --name=feature-name` - Create a new feature branch
- `npm run branch:hotfix --name=hotfix-name` - Create a new hotfix branch
- `npm run branch:cleanup` - Clean up merged branches
- `npm run branch:release` - Create release branch

#### GitHub Integration
- `npm run github:release` - Create GitHub release with changelog

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

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ (v18+ recommended)
- **npm** v7+ or **Yarn** 1.x
- **Python** 3.8+ (for AI/ML features)
- **Git** (for submodules)

### 1. Clone and Setup
```bash
# Clone the repository
git clone https://github.com/creativeplatform/orpheus-engine.git
cd orpheus-engine

# Install all dependencies (Node.js and Python)
npm run install-all

# Make shell scripts executable
npm run permissions

# Run system health check
npm run system-check
```

### 2. Environment Configuration (Optional)
For custom server configuration, copy and edit the environment file:
```bash
# Copy example environment file
cp workstation/frontend/OEW-main/.env.example .env.local

# Edit your custom settings
nano .env.local
```

### 3. Start the Application
```bash
# Start the complete application
npm start

# Or start in development mode
npm run dev
```

The application will be available at:
- **Frontend UI**: http://localhost:3000
- **RAG Backend API**: http://localhost:5001  
- **Audio Processing**: http://localhost:7008
- **Vite Dev Server**: http://localhost:5174

### 4. Verify Everything Works
```bash
# Run comprehensive system check
npm run system-check

# Check if all services are running
npm run verify-setup
```
- **Frontend UI**: http://localhost:5173
- **RAG Backend API**: http://localhost:5000
- **Audio Processing Service**: http://localhost:7008

### Component Overview

The application consists of three main parts:
1. **Frontend**: Electron/React/Vite application for the DAW interface
2. **Python RAG Backend**: AI-powered audio analysis and processing
3. **TypeScript Backend**: Audio file management and real-time processing

### Development Mode

To run components individually:

```bash
# Frontend only (Electron + Vite)
npm run start:vite

# Python RAG Backend only
npm run start:backend

# Build the application
npm run build
```

### 🔧 Troubleshooting

#### Common Issues & Solutions

1. **Missing Dependencies**:
   ```bash
   # Force reinstall all dependencies
   npm run install-all:force
   
   # Fix Python dependencies specifically
   npm run fix-python-deps
   
   # Fix tokenizers compilation (general)
   npm run fix-tokenizers
   
   # Fix tokenizers on macOS
   npm run fix-tokenizers-macos
   ```

2. **Permission Issues**:
   ```bash
   # Fix npm cache permissions
   npm run fix-permissions
   
   # Make scripts executable
   npm run permissions
   ```

3. **Port Conflicts**:
   ```bash
   # Check what's using Orpheus Engine ports
   npm run system-check
   
   # Clear specific ports if needed
   lsof -ti:3000,5001,5174,7008,8000 | xargs kill -9
   ```

4. **Python/AI Backend Issues**:
   ```bash
   # Set up Python environment
   npm run setup-python
   
   # Fix sentence transformers
   npm run fix-sentence-transformers
   
   # Check backend status
   curl http://localhost:5001/health
   ```

5. **Electron/Frontend Issues**:
   ```bash
   # Fix Vite dependencies
   npm run fix-vite
   
   # Fix Electron path issues
   npm run fix-electron-path
   
   # Fix Vite path not found
   npm run fix-vite-path
   ```

6. **Build Issues**:
   ```bash
   # Clean and rebuild
   npm run clean
   
   # Check TypeScript errors
   npm run typecheck
   
   # Validate with tests and linting
   npm run validate
   ```

#### Platform-Specific Issues

**macOS**:
- Install Xcode Command Line Tools: `xcode-select --install`
- Fix tokenizers: `npm run fix-tokenizers-macos`
- Install Rust if needed: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

**Linux**:
- Install required packages: `sudo apt-get install build-essential python3-dev`
- For headless operation: `npm run setup:daw`

**Windows**:
- Install Visual Studio Build Tools
- Use WSL2 for better compatibility

#### Getting Help

Run the comprehensive system check to diagnose issues:
```bash
npm run system-check
```

This will check:
- Node.js and npm versions
- Python environment
- Required system packages
- Port availability
- Service health
- File permissions

## 🌐 Server-Agnostic Configuration

Orpheus Engine is designed to be **completely server-agnostic**, allowing deployment in any environment without code changes. All server connections use environment variables with intelligent defaults.

### Environment Variables

Create a `.env.local` file in your project root to customize server settings:

```bash
# Copy the example environment file
cp workstation/frontend/OEW-main/.env.example .env.local
```

#### Core Configuration
```bash
# Backend API Server
BACKEND_HOST=localhost          # Default: localhost
BACKEND_PORT=5001              # Default: 5001
BACKEND_PROTOCOL=http          # Default: http

# Frontend Server  
FRONTEND_HOST=localhost        # Default: localhost
FRONTEND_PORT=3000            # Default: 3000
FRONTEND_PROTOCOL=http        # Default: http

# Vite Development Server
VITE_HOST=localhost           # Default: localhost
VITE_PORT=5174               # Default: 5174
VITE_PROTOCOL=http           # Default: http

# Audio Processing Service
AUDIO_HOST=localhost          # Default: localhost
AUDIO_PORT=7008              # Default: 7008
AUDIO_PROTOCOL=http          # Default: http

# Environment
NODE_ENV=development         # development | production
```

### Deployment Examples

#### 🐳 Docker Deployment
```bash
# docker-compose.yml environment
BACKEND_HOST=orpheus-backend
BACKEND_PORT=5001
FRONTEND_HOST=orpheus-frontend  
FRONTEND_PORT=3000
VITE_HOST=orpheus-vite
VITE_PORT=5174
```

#### ☁️ Cloud Production
```bash
BACKEND_HOST=api.orpheus-engine.com
BACKEND_PORT=443
BACKEND_PROTOCOL=https
FRONTEND_HOST=app.orpheus-engine.com
FRONTEND_PORT=443
FRONTEND_PROTOCOL=https
VITE_HOST=dev.orpheus-engine.com
VITE_PORT=443
VITE_PROTOCOL=https
NODE_ENV=production
```

#### 🏠 Custom Network
```bash
# Internal network setup
BACKEND_HOST=192.168.1.100
BACKEND_PORT=8001
FRONTEND_HOST=192.168.1.101
FRONTEND_PORT=8000
VITE_HOST=192.168.1.102
VITE_PORT=8080
```

### Configuration in Code

The environment configuration is centralized and easily accessible:

```typescript
// Auto-configured URLs based on environment
import { 
  getBackendUrl, 
  getFrontendUrl, 
  getViteUrl,
  getApiBaseUrl 
} from '@config/environment';

// These automatically use your environment variables
const apiUrl = getBackendUrl();        // http://localhost:5001
const frontendUrl = getFrontendUrl();  // http://localhost:3000  
const viteUrl = getViteUrl();         // http://localhost:5174
```

### Benefits

- ✅ **Deploy Anywhere**: Docker, cloud, bare metal, or local
- ✅ **Environment Isolation**: Different configs for dev/staging/prod  
- ✅ **Team Flexibility**: Each developer can use custom ports
- ✅ **CI/CD Ready**: Easy integration with deployment pipelines
- ✅ **Zero Code Changes**: Environment changes don't require rebuilds

### Supported Environment Files

The application automatically loads environment variables from:
1. `.env.local` - Local overrides (gitignored)
2. `.env.development` - Development environment  
3. `.env.production` - Production environment
4. `.env` - Default environment

## Development Workflow

### Code Organization

```
orpheus-engine-workstation/
├── frontend/          # Main Electron/React/Vite frontend application
├── backend/          # TypeScript and Python backends
│   ├── src/         # TypeScript backend source
│   └── agentic_rag/ # Python RAG backend
├── shared/          # Shared types and utilities
├── data/            # Audio files and test data
└── chroma_db/       # Vector database for audio analysis
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

## 📁 Project Structure

```
orpheus-engine/
├── 📄 package.json              # Root package with 60+ scripts
├── 📄 CHANGELOG.md              # Version history and features
├── 📄 README.md                 # This documentation
├── 📄 requirements.txt          # Python dependencies
├── 📄 tsconfig.json            # TypeScript configuration
├── 
├── 🖥️  electron/               # Electron main process
│   ├── main.ts                 # Main application entry
│   ├── service-manager.ts      # Service orchestration
│   ├── startup-window.ts       # Startup UI
│   └── preload.ts             # Renderer preload scripts
│
├── 📜 scripts/                 # 30+ automation scripts
│   ├── install-all.js         # Dependency installer
│   ├── system-check.js        # Health diagnostics
│   ├── setup-python.js        # Python environment
│   ├── fix-*.js               # Various fix utilities
│   └── clear-ports.js         # Port management
│
├── 🏭 workstation/            # Main workspace
│   ├── 🎨 frontend/           # React/Electron frontend
│   │   ├── src/              # React components and services
│   │   │   ├── components/daw/      # DAW-specific UI
│   │   │   ├── services/           # API and plugin services
│   │   │   │   ├── plugins/        # Plugin system
│   │   │   │   │   ├── PluginManager.ts    # Core plugin manager
│   │   │   │   │   ├── types.ts            # Plugin type definitions
│   │   │   │   │   └── built-in/           # Built-in plugins
│   │   │   │   │       ├── LocalFilePlugin.ts
│   │   │   │   │       ├── IPFSPlugin.ts
│   │   │   │   │       ├── StoryProtocolPlugin.ts
│   │   │   │   │       └── CloudStoragePlugin.ts
│   │   │   │   └── config/         # Environment config
│   │   │   ├── electron/     # Electron integration
│   │   │   └── dist/         # Built application
│   │   └── package.json      # Frontend dependencies
│   │
│   ├── 🔧 backend/           # Python & Node.js backends
│   │   ├── agentic_rag/     # AI/RAG backend
│   │   │   ├── main.py      # Flask API server
│   │   │   ├── rag_pipeline.py    # AI processing
│   │   │   ├── audio_utils.py     # Audio analysis
│   │   │   └── requirements.txt   # Python deps
│   │   ├── main.py          # Audio processing service
│   │   └── monitor_api.py   # System monitoring
│   │
│   ├── 📊 data/             # Audio files and datasets
│   ├── 🗄️  chroma_db/       # Vector database
│   ├── 🔗 shared/           # Shared utilities
│   └── 📝 docs/             # Project documentation
│
├── 🐍 python/               # Standalone Python utilities
└── 📁 src/                  # Additional source components
```

### Key Components

- **🎛️ DAW Interface**: Professional audio workstation UI with FL Studio-inspired design
- **🧩 Plugin System**: Extensible architecture for audio export and processing plugins
- **🤖 AI Backend**: RAG-powered audio analysis and intelligent assistance  
- **🎵 Audio Engine**: Real-time audio processing and streaming
- **⚡ Electron**: Native desktop application with system integration
- **🌐 Server-Agnostic**: Environment-based configuration for any deployment
- **🔧 Automation**: Comprehensive scripts for setup, maintenance, and deployment

## 🔗 Blockchain & Decentralized Features

Orpheus Engine includes built-in support for decentralized technologies:

### IPFS Integration
- Store audio files on IPFS network
- Automatic content addressing and deduplication
- Decentralized file sharing and distribution

### Story Protocol
- Blockchain-based intellectual property protection
- Automatic copyright registration
- Royalty management and distribution
- Creator attribution and provenance tracking

### Web3 Capabilities
- MetaMask integration for wallet connections
- Smart contract interactions for music NFTs
- Decentralized storage with IPFS
- Token-gated access controls

### Usage Example
```typescript
// Export to IPFS with Story Protocol protection
const result = await pluginManager.export(audioClips, {
  storage: { 
    provider: 'ipfs',
    options: { pin: true, gateway: 'https://ipfs.io' }
  },
  blockchain: {
    storyProtocol: {
      enabled: true,
      registerIP: true,
      metadata: {
        title: 'My Song',
        creator: '0x1234...',
        license: 'CC-BY-SA'
      }
    }
  }
});

console.log('IPFS Hash:', result.ipfsHash);
console.log('Story Protocol ID:', result.storyProtocolId);
```

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

## Audio Analysis Integration

### Setting Up Audio Analysis Backend

1. Install required Python libraries:
```bash
pip install -r requirements.txt
```

2. Verify FFmpeg installation:
```bash
npm run system-check
```

3. Configure audio analysis parameters in `python/audio_analysis.py`:
```python
ANALYSIS_PARAMS = {
    'windowSize': 2048,
    'hopLength': 512,
    'melBands': 128,
    'fmin': 20,
    'fmax': 20000
}
```

### MCP Server Integration

1. Start the MCP server:
```bash
npm run start-mcp
```

2. Configure MCP capabilities in your project:
```typescript
const mcpCapabilities = [
  'audioAnalysis',
  'midiGeneration',
  'mixingAssistant',
  'arrangementSuggestions'
];
```

3. Verify MCP connection:
```bash
npm run verify-mcp
```

### Advanced Audio Features

The Orpheus Engine includes advanced audio analysis capabilities:

1. **Spectral Analysis**
   - FFT-based frequency analysis
   - Mel-frequency cepstral coefficients (MFCCs)
   - Spectral contrast features

2. **Audio Feature Extraction**
   - Onset detection
   - Pitch tracking
   - Beat detection
   - Key detection

3. **AI-Assisted Audio Processing**
   - Automatic gain control
   - Noise reduction
   - Audio enhancement
   - Style transfer

4. **Real-time Analysis**
   - Live waveform visualization
   - Spectrum analysis
   - Audio fingerprinting
   - Feature tracking

### Using Audio Analysis Features

1. **Basic Analysis**
```typescript
import { AudioService } from '@services/audio';

const analysis = await AudioService.analyzeAudio(audioBuffer, {
  type: 'spectral',
  resolution: 1024,
  windowSize: 2048
});
```

2. **Advanced Analysis with Python Backend**
```typescript
import { pythonBridge } from '@services/pythonBridge';

const features = await pythonBridge.analyzeAudio(audioBuffer, {
  mfcc: true,
  chromagram: true,
  onsets: true
});
```

3. **MCP-Based Analysis**
```typescript
import { MCPService } from '@services/mcp';

const suggestions = await MCPService.analyze({
  audio: audioBuffer,
  type: 'arrangement',
  context: 'mixing'
});
```

### Performance Considerations

- Audio analysis is CPU-intensive; use appropriate buffer sizes
- Consider using Web Workers for heavy processing
- Enable GPU acceleration when available
- Cache analysis results when possible

### Troubleshooting

Common issues and solutions:

1. **Python Analysis Failed**
   - Check Python environment
   - Verify librosa installation
   - Check FFmpeg availability

2. **MCP Connection Issues**
   - Verify server is running
   - Check port availability
   - Validate capabilities configuration

3. **Poor Performance**
   - Adjust buffer sizes
   - Enable worker threads
   - Check system resources

### Contributing to Audio Features

To add new audio analysis features:

1. Add Python analysis function in `python/audio_analysis.py`
2. Create corresponding TypeScript interface
3. Add MCP capability declaration
4. Implement frontend visualization
5. Add documentation and tests