# Orpheus Engine Workstation - Dependencies & Requirements

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **CPU**: Intel i5 or AMD Ryzen 5 (2.0GHz+)
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 2GB free space
- **Node.js**: v16+ (v18+ recommended)
- **Python**: 3.8+ (for AI/ML features)

### Recommended for AI Features
- **RAM**: 16GB+ for large audio file processing
- **GPU**: NVIDIA GPU with CUDA support (optional, for ML acceleration)
- **Storage**: SSD recommended for better performance

## Node.js Dependencies

### Core Dependencies (from package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "electron": "^25.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0"
  }
}
```

### Development Dependencies
- **Testing**: vitest, @testing-library/react
- **Build Tools**: electron-builder, cross-env
- **Code Quality**: eslint, prettier
- **Type Checking**: @types/react, @types/node

## Python Dependencies (for AI/ML Features)

### MLFlow & Jupyter Integration
```bash
pip install mlflow>=2.0.0
pip install jupyter jupyterlab
pip install jupyter-book
```

### Audio Processing Libraries
```bash
pip install librosa>=0.9.0
pip install soundfile>=0.10.0
pip install numpy>=1.21.0
pip install pandas>=1.3.0
pip install scikit-learn>=1.0.0
```

### Visualization & Analysis
```bash
pip install matplotlib>=3.5.0
pip install seaborn>=0.11.0
pip install plotly>=5.0.0
```

### Optional: HP AI Studio Framework
```bash
# If HP AI Studio Framework is available
pip install hpai-studio-framework
```

## System Dependencies

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install -y build-essential python3-dev
sudo apt install -y libasound2-dev  # For audio support
sudo apt install -y dbus-x11 xvfb   # For headless operation
```

### macOS
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Windows
- **Visual Studio Build Tools** or **Visual Studio Community**
- **Windows SDK** (usually included with VS)

## Installation Commands

### Quick Setup
```bash
# Clone repository
git clone https://github.com/jhead12/orpheus-engine.git
cd orpheus-engine

# Install Node.js dependencies
npm install

# Make scripts executable (Linux/macOS)
chmod +x scripts/*.sh

# Install Python dependencies (optional, for AI features)
pip install mlflow jupyter librosa soundfile numpy pandas scikit-learn
```

### Verification
```bash
# Check Node.js installation
node --version  # Should be v16+
npm --version   # Should be v7+

# Check Python installation (if using AI features)
python --version  # Should be 3.8+
pip --version

# Check if MLFlow is installed
mlflow --version  # Should be 2.0+

# Verify application starts
npm run dev
```

## Environment Variables

### Required for MLFlow Integration
```bash
export MLFLOW_TRACKING_URI=http://localhost:5002
export MLFLOW_EXPERIMENT_NAME=orpheus-audio-analysis
export MLFLOW_DEFAULT_ARTIFACT_ROOT=./mlruns
```

### Optional Configuration
```bash
# Backend service integration
export BACKEND_HOST=localhost
export BACKEND_PORT=5001
export AUDIO_HOST=localhost
export AUDIO_PORT=7008

# Development settings
export NODE_ENV=development
export VITE_PORT=5173
export ELECTRON_DISABLE_GPU=0  # Set to 1 for headless mode
```

## Port Usage

### Default Ports
- **5173**: Vite development server (main app)
- **3000**: Alternative development port
- **5002**: MLFlow tracking server
- **8888**: Jupyter Lab server
- **5001**: Python backend API (if integrated)

### Port Conflicts Resolution
```bash
# Use alternative port for main app
npm run dev:local  # Uses port 3000

# Check for port conflicts
netstat -tulpn | grep :5173
```

## Common Installation Issues

### Node.js Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
```

### Python/MLFlow Issues
```bash
# Update pip
python -m pip install --upgrade pip

# Install with verbose output
pip install -v mlflow

# Check Python path
which python
which pip
```

### Electron Issues
```bash
# Rebuild Electron
npm run setup:electron

# Clear Electron cache
rm -rf ~/.cache/electron
```

### Permission Issues (Linux/macOS)
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

## Performance Optimization

### For Large Audio Files
- Increase Node.js memory limit: `export NODE_OPTIONS="--max-old-space-size=8192"`
- Use SSD storage for faster file I/O
- Close unnecessary applications to free RAM

### For ML Workloads
- Use GPU acceleration if available: Install CUDA and cuDNN
- Increase Python memory limits for large datasets
- Use environment-specific Python virtual environments

## Security Considerations

### API Keys
- **Never commit API keys to repository**
- Use environment variables for sensitive data
- Use `.env` files for local development (not committed)

### Network Security
- MLFlow server runs on localhost by default
- Configure firewalls appropriately for production
- Use HTTPS in production environments

## Development Tools

### Recommended VS Code Extensions
- **TypeScript**: Built-in VS Code support
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Python**: Python language support
- **Jupyter**: Notebook support in VS Code

### Browser Requirements
- **Chrome/Chromium**: 90+ (recommended for development)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Troubleshooting Resources

### Log Files
- **Electron logs**: Check console in development mode
- **MLFlow logs**: Check MLFlow server output
- **Application logs**: Available in browser developer tools

### Common Commands
```bash
# Check system info
npm run validate:env

# Fix common issues
npm run fix-vite
npm run fix-electron-path

# Clean rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Support
- **GitHub Issues**: https://github.com/jhead12/orpheus-engine/issues
- **Documentation**: All setup guides in repository
- **MLFlow Docs**: https://mlflow.org/docs/latest/
- **Electron Docs**: https://www.electronjs.org/docs/
