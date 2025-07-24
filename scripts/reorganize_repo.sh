#!/usr/bin/env bash
# Repository Reorganization Script for Orpheus Engine
# This script reorganizes the repository to follow the HP AI Studio Blueprints structure

set -e  # Exit on error

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}===========================================================${NC}"
echo -e "${GREEN}Orpheus Engine Repository Reorganization${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  This script will reorganize your repository structure.${NC}"
echo -e "${YELLOW}⚠️  Make sure you have a backup or commit all changes before proceeding.${NC}"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Reorganization cancelled.${NC}"
    exit 1
fi

# Create main directory structure
echo -e "\n${BLUE}Creating main directory structure...${NC}"
mkdir -p audio-workstation/daw-core/{configs,data,demo,docs,src,tests}
mkdir -p audio-workstation/ai-features/{configs,data,notebooks,src,tests}
mkdir -p electron-app/{configs,src,build}
mkdir -p workstation/{configs,frontend/{src,public},backend,tests}
mkdir -p docs/{architecture,dev-guides,user-guides,api}
mkdir -p scripts
mkdir -p .github

# Create __init__.py files to mark directories as Python packages
echo -e "\n${BLUE}Creating Python package markers...${NC}"
touch audio-workstation/daw-core/src/__init__.py
touch audio-workstation/ai-features/src/__init__.py
touch audio-workstation/daw-core/src/audio/__init__.py
touch audio-workstation/daw-core/src/ui/__init__.py
touch audio-workstation/daw-core/src/utils/__init__.py
touch audio-workstation/ai-features/src/ml_models/__init__.py
touch audio-workstation/ai-features/src/audio_analysis/__init__.py

# Move documentation
echo -e "\n${BLUE}Moving documentation...${NC}"
if [ -d "docs" ]; then
    cp -r docs/* docs/
    echo -e "${GREEN}✓ Documentation moved${NC}"
else
    echo -e "${YELLOW}⚠️  No docs directory found, skipping...${NC}"
fi

# Create README files
echo -e "\n${BLUE}Creating README files...${NC}"

# Root README
cat > README.md <<EOL
# Orpheus Engine Workstation

A professional-grade Digital Audio Workstation (DAW) with integrated AI/ML features.

## Overview

Orpheus Engine is a modern, electron-based digital audio workstation that combines traditional audio recording and editing capabilities with cutting-edge AI and machine learning features for audio analysis, enhancement, and creative tools.

## Features

- 🎵 Professional audio recording and editing
- 🎛️ Full-featured mixer with effects processing
- 🎹 MIDI sequencing and virtual instruments
- 🧠 AI-powered audio analysis and enhancement
- 📊 MLFlow integration for experiment tracking

## Project Structure

This repository follows the HP AI Studio Blueprints structure:

- \`/audio-workstation/\` - Core DAW and AI features
- \`/electron-app/\` - Electron application wrapper
- \`/workstation/\` - Complete workstation UI
- \`/docs/\` - Documentation
- \`/scripts/\` - Development and deployment scripts

## Getting Started

See the [Installation Guide](docs/dev-guides/installation_guide.md) for setup instructions.

## Requirements

See [REQUIREMENTS.md](docs/REQUIREMENTS.md) for system requirements and dependencies.

---

> Built with ❤️ using [**HP AI Studio**](https://www.hp.com/us-en/workstations/ai-studio.html).
EOL

# DAW Core README
cat > audio-workstation/daw-core/README.md <<EOL
# Orpheus Engine - DAW Core

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js: v18+](https://img.shields.io/badge/Node.js-v18%2B-green)](https://nodejs.org/)
[![Python: 3.8+](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)

## Overview

Core DAW functionality including audio recording, playback, mixing, and timeline editing.

## Project Structure

- \`/configs/\` - Configuration files for audio settings
- \`/data/\` - Sample audio files for testing
- \`/demo/\` - Demonstration projects
- \`/docs/\` - Documentation
- \`/src/\` - Core source code
  - \`/audio/\` - Audio processing modules
  - \`/ui/\` - UI components
  - \`/utils/\` - Utilities
- \`/tests/\` - Unit and integration tests

## Setup

### Step 0: Minimum Hardware Requirements
- CPU: Intel i5/AMD Ryzen 5 (2.0GHz+)
- RAM: 8GB minimum, 16GB recommended
- Storage: 2GB free space

### Installation
\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm run dev
\`\`\`

## Support & Troubleshooting

For issues, please check the [GitHub Issues](https://github.com/jhead12/orpheus-engine/issues) or refer to the troubleshooting section in the documentation.

---

> Built with ❤️ using [**HP AI Studio**](https://www.hp.com/us-en/workstations/ai-studio.html).
EOL

# AI Features README
cat > audio-workstation/ai-features/README.md <<EOL
# Orpheus Engine - AI Features

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python: 3.8+](https://img.shields.io/badge/Python-3.8%2B-blue)](https://www.python.org/)
[![MLflow: 2.0+](https://img.shields.io/badge/MLflow-2.0%2B-blue)](https://mlflow.org/)

## Overview

AI and machine learning features for audio analysis, enhancement, and creative tools.

## Project Structure

- \`/configs/\` - Configuration files for AI models
- \`/data/\` - Training data and models
- \`/notebooks/\` - Jupyter notebooks for analysis
- \`/src/\` - Source code
  - \`/ml_models/\` - Machine learning models
  - \`/audio_analysis/\` - Audio analysis tools
- \`/tests/\` - Unit and integration tests

## Setup

### Step 0: Minimum Hardware Requirements
- CPU: Intel i5/AMD Ryzen 5 (2.0GHz+)
- RAM: 16GB+ recommended
- GPU: NVIDIA GPU with CUDA support (optional)
- Storage: SSD recommended for better performance

### Installation
\`\`\`bash
pip install -r requirements.txt
\`\`\`

## Usage

### Notebooks
Jupyter notebooks in the \`/notebooks\` directory demonstrate various AI features:

\`\`\`bash
jupyter lab notebooks/audio_analysis_demo.ipynb
\`\`\`

### MLFlow Integration
\`\`\`bash
export MLFLOW_TRACKING_URI=http://localhost:5002
mlflow ui
\`\`\`

## Support & Troubleshooting

For issues, please check the [GitHub Issues](https://github.com/jhead12/orpheus-engine/issues) or refer to the troubleshooting section in the documentation.

---

> Built with ❤️ using [**HP AI Studio**](https://www.hp.com/us-en/workstations/ai-studio.html).
EOL

# Move REQUIREMENTS.md to docs
echo -e "\n${BLUE}Moving REQUIREMENTS.md to docs...${NC}"
cp docs/REQUIREMENTS.md docs/REQUIREMENTS.md.bak  # Backup
cp docs/REQUIREMENTS.md docs/dev-guides/requirements.md

# Create configuration examples
echo -e "\n${BLUE}Creating configuration examples...${NC}"

# Audio settings config
cat > audio-workstation/daw-core/configs/audio-settings.yaml <<EOL
# Orpheus Engine - Audio Settings Configuration

# Audio Engine
audio_engine:
  driver: "CoreAudio"  # Options: CoreAudio, ASIO, WASAPI, ALSA
  sample_rate: 48000   # Hz
  bit_depth: 24        # Bits
  buffer_size: 512     # Samples
  input_channels: 2    # Stereo input
  output_channels: 2   # Stereo output

# Recording
recording:
  auto_arm_new_tracks: true
  countdown: 0         # Seconds, 0 = disabled
  metronome: false     # Enable metronome during recording
  input_monitoring: true
  record_format: "wav" # Options: wav, aiff, flac

# Playback
playback:
  looping: false
  auto_scroll: true
  pre_roll: 0          # Seconds
  post_roll: 2         # Seconds
  metronome: false

# Metering
metering:
  peak_hold_time: 2000 # Milliseconds
  meter_update_rate: 24 # Frames per second
  show_rms: true
  show_peak: true
  show_clip_indicator: true

# Timeline
timeline:
  snap_to_grid: true
  grid_type: "beats"   # Options: beats, seconds, frames
  tempo: 120           # BPM
  time_signature: "4/4"
  zoom_level: 100      # Percentage
EOL

# UI settings config
cat > audio-workstation/daw-core/configs/ui-settings.yaml <<EOL
# Orpheus Engine - UI Settings Configuration

# Theme
theme:
  name: "dark"  # Options: dark, light, custom
  accent_color: "#4a90e2"
  primary_font: "Inter"
  monospace_font: "JetBrains Mono"

# Layout
layout:
  show_mixer: true
  show_browser: true
  show_timeline: true
  show_transport: true
  vertical_zoom: 100   # Percentage
  horizontal_zoom: 100 # Percentage
  track_height: 80     # Pixels
  
# Windows
window:
  remember_position: true
  remember_size: true
  default_width: 1280
  default_height: 720
  
# Performance
performance:
  disable_animations: false
  low_power_mode: false
  waveform_resolution: "medium" # Options: low, medium, high
  max_undo_steps: 100
EOL

# Secrets config template
cat > audio-workstation/daw-core/configs/secrets.yaml.example <<EOL
# Orpheus Engine - Secrets Configuration TEMPLATE
# IMPORTANT: Rename this file to secrets.yaml and add your actual keys
# DO NOT commit the actual secrets.yaml file to git

# API Keys
api_keys:
  cloud_storage: "YOUR_CLOUD_STORAGE_API_KEY"
  audio_analysis_service: "YOUR_AUDIO_ANALYSIS_API_KEY"
  
# Integration Endpoints
endpoints:
  cloud_sync: "https://api.example.com/cloud-sync"
  audio_analysis: "https://api.example.com/audio-analysis"
  
# Database
database:
  username: "db_user"
  password: "YOUR_DATABASE_PASSWORD"
  host: "localhost"
  port: 5432
  name: "orpheus_db"
EOL

# Create .gitignore files
echo -e "\n${BLUE}Creating .gitignore files...${NC}"

# Root .gitignore
cat > .gitignore <<EOL
# Logs
logs
*.log
npm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/
.nyc_output/

# Build outputs
dist/
build/
out/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
develop-eggs/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
*.egg-info/
.installed.cfg
*.egg

# Jupyter Notebook
.ipynb_checkpoints
*/.ipynb_checkpoints/*

# ML/Data
mlruns/
mlflow_artifacts/
model/
*.pkl
*.h5
*.onnx

# Electron
.electron-cache/
.webpack/
release/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.DS_Store

# Secrets
**/configs/secrets.yaml
EOL

# Create directory structure guide document
echo -e "\n${BLUE}Creating directory structure guide...${NC}"

cat > docs/architecture/directory_structure.md <<EOL
# Orpheus Engine - Directory Structure Guide

This document outlines the directory structure used in the Orpheus Engine project, based on the HP AI Studio Blueprints format.

## Root Directory

\`\`\`
# Root Directory
├── audio-workstation/               # Main category for DAW features
│   │
│   ├── daw-core/                    # Core DAW functionality
│   │   ├── configs/                 # Configuration files
│   │   │   ├── audio-settings.yaml  # Default audio settings
│   │   │   ├── ui-settings.yaml     # UI preferences
│   │   │   └── secrets.yaml.example # Template for API keys (gitignored)
│   │   ├── data/                    # Sample audio files for testing
│   │   ├── demo/                    # Current 'demo' folder contents
│   │   ├── docs/                    # DAW documentation
│   │   │   ├── installation_guide.md
│   │   │   ├── architecture.md
│   │   │   └── user_manual.md
│   │   ├── src/                     # Core DAW source code
│   │   │   ├── __init__.py
│   │   │   ├── audio/               # Audio processing modules
│   │   │   ├── ui/                  # UI components
│   │   │   └── utils/               # Utilities
│   │   ├── tests/                   # Unit and integration tests
│   │   ├── .gitignore
│   │   ├── requirements.txt         # Python dependencies
│   │   └── README.md
│   │
│   ├── ai-features/                 # AI-enhanced features
│       ├── configs/
│       ├── data/                    # Training data and models
│       ├── notebooks/               # Analysis notebooks
│       ├── src/                     # AI feature implementation
│       │   ├── __init__.py
│       │   ├── ml_models/           # Machine learning models
│       │   └── audio_analysis/      # Audio analysis tools
│       ├── tests/
│       ├── requirements.txt
│       └── README.md
│
├── electron-app/                    # Electron application wrapper
│   ├── configs/
│   ├── src/
│   ├── build/                       # Build output
│   └── README.md
│
├── workstation/                     # Complete workstation UI
│   ├── configs/
│   ├── frontend/
│   │   ├── src/
│   │   └── public/
│   ├── backend/
│   ├── tests/
│   └── README.md
│
├── docs/                            # Project-wide documentation
│   ├── architecture/
│   ├── dev-guides/
│   ├── user-guides/
│   └── api/
│
├── scripts/                         # Development and deployment scripts
│
├── .github/                         # GitHub workflows and templates
│
├── .gitignore
├── LICENSE
├── README.md                        # Main project README
└── requirements.txt                 # Top-level dependencies
\`\`\`

## Purpose of Each Directory

### audio-workstation

The main category for DAW features, split into two main modules:

#### daw-core
Contains the core DAW functionality:
- **configs**: Configuration files for audio engine, UI, etc.
- **data**: Sample audio files for testing and development
- **demo**: Demonstration projects and examples
- **docs**: Documentation specific to DAW core
- **src**: Source code for the DAW core functionality
- **tests**: Unit and integration tests

#### ai-features
Contains the AI and machine learning features:
- **configs**: Configuration for AI models and pipelines
- **data**: Training data, datasets, and pre-trained models
- **notebooks**: Jupyter notebooks for analysis and demonstrations
- **src**: Source code for AI feature implementation
- **tests**: Tests for AI features

### electron-app
Contains the Electron application wrapper:
- **configs**: Electron-specific configurations
- **src**: Electron-specific source code
- **build**: Build outputs and configurations

### workstation
Contains the complete workstation UI:
- **configs**: UI-specific configurations
- **frontend**: Frontend React components and assets
- **backend**: Backend services for the workstation
- **tests**: UI and integration tests

### docs
Project-wide documentation:
- **architecture**: System architecture and design
- **dev-guides**: Developer guides and setup instructions
- **user-guides**: End-user manuals and guides
- **api**: API documentation

### scripts
Development, deployment, and utility scripts

### .github
GitHub workflows, templates, and actions

## File Naming Conventions

- Use **kebab-case** for file and directory names (e.g., \`audio-settings.yaml\`)
- Use **snake_case** for Python modules and packages (e.g., \`audio_analysis\`)
- Use **PascalCase** for React components and classes (e.g., \`AudioTrack.tsx\`)
- Use **camelCase** for JavaScript/TypeScript functions and variables

## README Format

Every project-level README.md file should include:

1. **Title & Badges**: Project title and relevant badges
2. **Overview**: Concise summary of purpose and functionality
3. **Project Structure**: High-level description of organization
4. **Setup**: Step-by-step setup instructions
5. **Usage**: Clear explanation of how to use the project
6. **Support & Troubleshooting**: Guidance for getting help

---

> Built with ❤️ using [**HP AI Studio**](https://www.hp.com/us-en/workstations/ai-studio.html).
EOL

# Create installation guide
echo -e "\n${BLUE}Creating installation guide...${NC}"

cat > docs/dev-guides/installation_guide.md <<EOL
# Orpheus Engine - Installation Guide

This guide provides step-by-step instructions for setting up the Orpheus Engine development environment.

## Prerequisites

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

## Step 1: Clone the Repository

\`\`\`bash
git clone https://github.com/jhead12/orpheus-engine.git
cd orpheus-engine
\`\`\`

## Step 2: Install Node.js Dependencies

\`\`\`bash
# Using npm
npm install

# OR using pnpm (recommended)
pnpm install
\`\`\`

## Step 3: Install Python Dependencies (for AI Features)

\`\`\`bash
# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
\`\`\`

## Step 4: Configure Environment

1. Create a \`.env\` file in the root directory:

\`\`\`bash
# Copy the example .env file
cp .env.example .env

# Edit the .env file with your settings
nano .env
\`\`\`

2. Configure audio settings:

\`\`\`bash
# Copy the example audio settings
cp audio-workstation/daw-core/configs/audio-settings.yaml.example audio-workstation/daw-core/configs/audio-settings.yaml
\`\`\`

## Step 5: Start Development Server

\`\`\`bash
# Start the development server
npm run dev
\`\`\`

## Step 6: Verify Installation

1. The Electron app should launch automatically
2. Check the console for any errors
3. Verify that audio input/output devices are detected

## Troubleshooting

### Common Issues

#### Node.js Errors
\`\`\`bash
# Clear npm cache
npm cache clean --force

# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install
\`\`\`

#### Python/MLFlow Issues
\`\`\`bash
# Update pip
python -m pip install --upgrade pip

# Install with verbose output
pip install -v mlflow

# Check Python path
which python
which pip
\`\`\`

#### Electron Issues
\`\`\`bash
# Rebuild Electron
npm run setup:electron

# Clear Electron cache
rm -rf ~/.cache/electron
\`\`\`

#### Permission Issues (Linux/macOS)
\`\`\`bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
\`\`\`

### Getting Help

If you encounter problems not covered here:
1. Check the [GitHub Issues](https://github.com/jhead12/orpheus-engine/issues) for similar problems
2. Search the documentation for specific error messages
3. Open a new issue with detailed information about your problem

---

> Built with ❤️ using [**HP AI Studio**](https://www.hp.com/us-en/workstations/ai-studio.html).
EOL

echo -e "\n${GREEN}✓ Structure plan and initial files created${NC}"
echo -e "\n${BLUE}===========================================================${NC}"
echo -e "${GREEN}Repository reorganization plan complete!${NC}"
echo -e "${BLUE}===========================================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review the DIRECTORY_STRUCTURE_PLAN.md file"
echo "2. Review the generated directory structure and files"
echo "3. Implement the migration according to the plan"
echo "4. Update import paths in all source files"
echo "5. Test all functionality after migration"
echo ""
echo -e "${BLUE}Done!${NC}"
