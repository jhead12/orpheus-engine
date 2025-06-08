# Orpheus Engine Audio Library

## Overview
This directory contains audio files used by the Orpheus Engine's Agentic RAG pipeline for transcription and analysis.

## Directory Structure
```
workstation/
├── data/                           # Audio files library
│   ├── tester.mp3                 # Primary test audio file
│   ├── metronome-tick.wav         # Metronome audio samples
│   ├── metronome-tick-accentuated.wav
│   ├── audio_library_index.json  # Audio library metadata
│   └── README.md                  # This file
└── logs/                          # RAG pipeline logs
```

## Usage

### Primary Test File
- **tester.mp3**: Main audio file used by `agentic_rag.ipynb` for testing transcription and RAG pipeline functionality.

### Additional Audio Files
- **metronome-tick.wav**: Basic metronome tick sound
- **metronome-tick-accentuated.wav**: Accentuated metronome tick sound

### Adding New Audio Files
1. Place audio files in this directory (`workstation/data/`)
2. Update the `audio_library_index.json` file with new file information
3. Supported formats: MP3, WAV, M4A, FLAC, OGG

### RAG Pipeline Configuration
The Agentic RAG notebook (`agentic_rag.ipynb`) is configured to use:
```python
AUDIO_PATH = "./data/tester.mp3"
```

To use different audio files, update the `AUDIO_PATH` variable in the notebook.

### Logs
Pipeline logs are stored in the `../logs/` directory relative to this audio library.

## File Management
- Keep audio files organized by purpose or source
- Use descriptive filenames
- Update the index file when adding/removing files
- Consider file size for transcription performance

## Notes
- The workstation directory structure keeps all RAG pipeline assets organized
- Paths in the notebook are relative to the workstation root
- Audio files should be accessible for both local and containerized environments
