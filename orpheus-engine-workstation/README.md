# Orpheus Engine Workstation

## Overview
The Orpheus Engine Workstation (OEW) is a comprehensive project designed to implement an Agentic Retrieval-Augmented Generation (RAG) pipeline. This project integrates audio processing, transcription, and intelligent question-answering capabilities using a combination of Python and TypeScript technologies.

## Project Structure
The project is organized into three main directories: `backend`, `frontend`, and `shared`. Each directory serves a specific purpose:

- **backend**: Contains the Python components responsible for audio processing, transcription, and managing the RAG pipeline.
  - `agentic_rag`: This package includes modules for handling audio files, interacting with ChromaDB, and implementing the RAG logic.
  - `main.py`: The entry point for the backend application.

- **frontend**: Contains the TypeScript components for the user interface, built using React.
  - `src`: The source directory for the frontend application, including components and types.
  - `package.json`: Configuration for npm dependencies and scripts.
  - `tsconfig.json`: TypeScript configuration file.

- **shared**: Contains TypeScript type definitions that ensure consistent type usage across both the frontend and backend components.

## Getting Started

### Backend Setup
1. Navigate to the `backend` directory.
2. Install the required Python dependencies listed in `requirements.txt`:
   ```
   pip install -r agentic_rag/requirements.txt
   ```
3. Run the backend application:
   ```
   python main.py
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install the required npm packages:
   ```
   npm install
   ```
3. Start the frontend application:
   ```
   npm start
   ```

## Features
- **Audio Transcription**: Processes audio data and generates transcriptions using Whisper.
- **Dynamic Context Retrieval**: Enhances answer accuracy by retrieving relevant document content before generating responses.
- **User Interface**: Provides an intuitive interface for searching audio segments and displaying results.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.