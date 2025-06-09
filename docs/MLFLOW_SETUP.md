# MLFlow & HP AI Studio Integration Setup

This document provides detailed instructions for setting up MLFlow experiment tracking with Jupyter Books running in HP AI Studio Framework for advanced audio ML workflows with Orpheus Engine.

## Prerequisites for AI Features
- **Python** 3.8+ with pip
- **MLFlow** 2.0+ for experiment tracking
- **Jupyter Lab/Books** for interactive development
- **HP AI Studio Framework** (if available)

## 1. Setup MLFlow Integration

### Install MLFlow and Dependencies
```bash
# Install MLFlow and related packages
pip install mlflow>=2.0.0 jupyter jupyterlab

# Install audio processing dependencies for ML workflows
pip install librosa soundfile numpy pandas scikit-learn

# Install HP AI Studio Framework dependencies (if available)
pip install hpai-studio-framework  # or specific HP AI packages
```

### Configure MLFlow Tracking
```bash
# Start MLFlow tracking server
mlflow server --host 0.0.0.0 --port 5002 --backend-store-uri sqlite:///mlflow.db

# Set environment variables for Orpheus integration
export MLFLOW_TRACKING_URI=http://localhost:5002
export MLFLOW_EXPERIMENT_NAME=orpheus-audio-analysis
```

### Setup Jupyter Books for Audio ML
```bash
# Create Jupyter Book structure for audio analysis
jupyter-book create audio-ml-workbook/

# Install additional packages for audio ML
pip install jupyter-book matplotlib seaborn plotly
```

## 2. HP AI Studio Framework Setup

### Framework Integration
```bash
# Setup HP AI Studio workspace (if framework is available)
hpai init orpheus-workspace

# Configure AI Studio for audio processing
hpai config set --project-type audio-daw
hpai config set --ml-backend mlflow
hpai config set --tracking-uri $MLFLOW_TRACKING_URI
```

### Jupyter Books Configuration
Create `audio-ml-workbook/_config.yml`:
```yaml
title: Orpheus Engine Audio ML Workbook
author: Orpheus Engine Team
logo: assets/orpheus-logo.png

execute:
  execute_notebooks: force
  timeout: 300

html:
  use_repository_button: true
  use_issues_button: true
  
sphinx:
  config:
    nb_execution_mode: "force"
    
repository:
  url: https://github.com/jhead12/orpheus-engine
  branch: main
```

## 3. Run AI-Enhanced Workstation
```bash
# Start the full AI-enhanced stack
npm run dev:ai  # Custom script that starts both frontend and ML backend

# Or manually start components
mlflow server --host 0.0.0.0 --port 5002 &
jupyter lab --port 8888 --no-browser &
npm run dev
```

### Available ML Endpoints
- **MLFlow UI**: http://localhost:5002 (experiment tracking)
- **Jupyter Lab**: http://localhost:8888 (interactive ML development)
- **Main App**: http://localhost:5173 (Orpheus workstation)
- **Audio Analysis API**: http://localhost:5001 (Python backend)

## MLFlow Integration Features

### Audio Analysis Tracking
- **Experiment Logging**: Track audio processing experiments
- **Model Versioning**: Version control for AI models
- **Metrics Tracking**: Audio quality metrics, processing times
- **Artifact Storage**: Store trained models, audio samples, analysis results

### HP AI Studio Integration
- **Automated Pipelines**: Audio processing workflows
- **Model Deployment**: Deploy models to production
- **Resource Management**: GPU/CPU resource allocation
- **Collaboration**: Team-based ML development

## Example Jupyter Book Usage

```python
# Example: Audio feature extraction with MLFlow tracking
import mlflow
import librosa
import numpy as np

mlflow.set_experiment("orpheus-audio-analysis")

with mlflow.start_run():
    # Load audio file
    audio, sr = librosa.load("sample.wav")
    
    # Extract features
    mfccs = librosa.feature.mfcc(y=audio, sr=sr)
    
    # Log metrics and artifacts
    mlflow.log_metric("sample_rate", sr)
    mlflow.log_metric("duration", len(audio) / sr)
    mlflow.log_artifact("sample.wav")
    
    # Log feature data
    np.save("mfccs.npy", mfccs)
    mlflow.log_artifact("mfccs.npy")
```

## Advanced Workflows

### 1. Audio Feature Pipeline
Create a notebook for extracting and tracking audio features:

```python
import mlflow
import mlflow.sklearn
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import librosa
import pandas as pd

# Set up experiment
mlflow.set_experiment("orpheus-audio-classification")

def extract_features(audio_file):
    """Extract audio features for ML processing"""
    y, sr = librosa.load(audio_file)
    
    # Extract various features
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    zero_crossing_rate = librosa.feature.zero_crossing_rate(y)
    
    # Compute statistics
    features = {
        'mfcc_mean': np.mean(mfccs, axis=1),
        'mfcc_std': np.std(mfccs, axis=1),
        'spectral_centroid_mean': np.mean(spectral_centroids),
        'spectral_rolloff_mean': np.mean(spectral_rolloff),
        'zcr_mean': np.mean(zero_crossing_rate)
    }
    
    return features

# Training pipeline with MLFlow tracking
with mlflow.start_run():
    # Log parameters
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 10)
    
    # Train model (example)
    # X, y = load_audio_dataset()  # Your audio dataset
    # X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    # model = RandomForestClassifier(n_estimators=100, max_depth=10)
    # model.fit(X_train, y_train)
    
    # Log metrics
    # accuracy = model.score(X_test, y_test)
    # mlflow.log_metric("accuracy", accuracy)
    
    # Log model
    # mlflow.sklearn.log_model(model, "audio_classifier")
```

### 2. Real-time Audio Analysis
Set up real-time analysis with MLFlow tracking:

```python
import mlflow
import numpy as np
from datetime import datetime

class AudioAnalyzer:
    def __init__(self):
        mlflow.set_experiment("orpheus-realtime-analysis")
        self.run_id = None
    
    def start_analysis_session(self):
        """Start a new MLFlow run for real-time analysis"""
        self.run = mlflow.start_run()
        self.run_id = self.run.info.run_id
        mlflow.log_param("session_start", datetime.now().isoformat())
    
    def analyze_clip(self, audio_data, clip_metadata):
        """Analyze a single audio clip"""
        if self.run_id:
            with mlflow.start_run(run_id=self.run_id):
                # Perform analysis
                features = self.extract_features(audio_data)
                
                # Log metrics
                for feature_name, value in features.items():
                    mlflow.log_metric(f"clip_{feature_name}", value)
                
                # Log clip metadata
                mlflow.log_params(clip_metadata)
                
                return features
    
    def end_analysis_session(self):
        """End the current MLFlow run"""
        if self.run_id:
            with mlflow.start_run(run_id=self.run_id):
                mlflow.log_param("session_end", datetime.now().isoformat())
            mlflow.end_run()
            self.run_id = None
```

## Troubleshooting

### Common Issues

1. **MLFlow Server Issues**:
   ```bash
   # Check if MLFlow server is running
   ps aux | grep mlflow
   
   # Restart MLFlow server
   pkill -f mlflow
   mlflow server --host 0.0.0.0 --port 5002 --backend-store-uri sqlite:///mlflow.db
   ```

2. **Jupyter Books Build Issues**:
   ```bash
   # Clean and rebuild Jupyter Book
   jupyter-book clean audio-ml-workbook/
   jupyter-book build audio-ml-workbook/
   ```

3. **HP AI Studio Framework Issues**:
   ```bash
   # Check HP AI Studio status
   hpai status
   
   # Restart HP AI Studio workspace
   hpai restart orpheus-workspace
   ```

4. **Python Dependencies**:
   ```bash
   # Update all ML dependencies
   pip install --upgrade mlflow jupyter jupyterlab librosa soundfile numpy pandas scikit-learn
   ```

### Environment Variables

Add these to your shell profile (`.bashrc`, `.zshrc`, etc.):

```bash
# MLFlow Configuration
export MLFLOW_TRACKING_URI=http://localhost:5002
export MLFLOW_EXPERIMENT_NAME=orpheus-audio-analysis
export MLFLOW_DEFAULT_ARTIFACT_ROOT=./mlruns

# HP AI Studio Configuration (if available)
export HPAI_WORKSPACE=orpheus-workspace
export HPAI_PROJECT_TYPE=audio-daw
export HPAI_ML_BACKEND=mlflow

# Jupyter Configuration
export JUPYTER_CONFIG_DIR=./jupyter-config
export JUPYTER_DATA_DIR=./jupyter-data
```

## Integration with Orpheus Engine

The MLFlow setup integrates with the main Orpheus Engine workstation through:

1. **Experiment Tracking**: All audio processing operations can be tracked
2. **Model Storage**: Trained models are versioned and stored in MLFlow
3. **Metrics Dashboard**: Real-time performance metrics in MLFlow UI
4. **Jupyter Integration**: Interactive development and analysis workflows
5. **HP AI Studio**: Enterprise-grade ML pipeline management (if available)

For more information on integrating with the main Orpheus Engine backend, see the main repository documentation.
