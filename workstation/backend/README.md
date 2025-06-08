# Backend Documentation

## Overview
The backend of the Orpheus Engine Workstation is designed to implement the Agentic Retrieval-Augmented Generation (RAG) pipeline. This pipeline integrates audio processing, transcription, and intelligent question-answering functionalities.

## Directory Structure
- **agentic_rag/**: Contains the core components of the RAG pipeline.
  - **`__init__.py`**: Initializes the agentic_rag package.
  - **`rag_pipeline.py`**: Main logic for the RAG pipeline, handling audio processing and transcription.
  - **`audio_utils.py`**: Utility functions for audio file handling, including loading and saving audio segments.
  - **`chroma_utils.py`**: Functions for interacting with ChromaDB, managing embeddings, and storing/retrieving transcription data.
  - **`requirements.txt`**: Lists the Python dependencies required for the backend.

- **main.py**: Entry point for the backend application, orchestrating the execution of the RAG pipeline and handling incoming requests.

## Setup Instructions
1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd orpheus-engine-workstation
   ```

2. **Install Dependencies**
   Navigate to the `agentic_rag` directory and install the required Python packages:
   ```bash
   cd backend/agentic_rag
   pip install -r requirements.txt
   ```

3. **Run the Application**
   Execute the main application script:
   ```bash
   python ../main.py
   ```

## Usage
The backend processes audio data, transcribes it, and allows for intelligent querying through the RAG pipeline. Ensure that the audio files are placed in the appropriate directory as specified in the code.

## Monitoring and Future Integrations
This backend uses Flask for API endpoints and psutil for system metrics. Future plans include integrating Helia and Ceramic for enhanced capabilities.

To run the monitoring API:
```bash
FLASK_APP=monitor_api.py FLASK_ENV=development python -m flask run --port 8000
```

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.