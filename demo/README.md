# 🎵 Orpheus Audio Analysis Demo

**Real-time Audio Recording, AI-Powered Analysis & Professional DAW Pipeline System**  
*HP AI Studio Competition Entry*

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ 
- **Python** 3.8+
- **Modern Web Browser** with microphone support

### 1. Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install demo frontend dependencies
cd audio-analysis-demo
npm install
cd ..
```

### 2. Start the Demo

```bash
# Run the integrated demo launcher
python start_demo.py
```

This will automatically:
- 🏃‍♂️ Start MLflow tracking server on port 5000
- 📊 Start TensorBoard monitoring server on port 6006
- 🎵 Launch the audio analysis demo on port 3001
- 🌐 Open both applications in your browser

### 3. Alternative Manual Start

```bash
# Terminal 1: Start MLflow
mlflow ui --host 0.0.0.0 --port 5000

# Terminal 2: Start TensorBoard  
tensorboard --logdir=./tensorboard_logs --port=6006

# Terminal 3: Start Demo Frontend
cd audio-analysis-demo
npm run dev
```

## 📊 Unified Monitoring Platform

### MLflow Integration
- **Experiment Tracking**: Complete audit trail of all analyses
- **Model Registry**: Version control for audio analysis models
- **Metrics Comparison**: Side-by-side performance evaluation
- **HP AI Studio Compatible**: Phoenix MLflow server integration

### TensorBoard Integration  
- **Real-time Monitoring**: Live metrics during audio processing
- **Audio Visualizations**: Waveforms, spectrograms, and frequency analysis
- **Performance Tracking**: Processing times and efficiency metrics
- **Quality Monitoring**: LUFS compliance and professional standards

### Dual Platform Benefits
- **MLflow**: Long-term experiment management and model deployment
- **TensorBoard**: Real-time monitoring and visual debugging
- **Combined**: Complete ML workflow visibility for audio processing

## 🎯 Demo Features

### 🎙️ **Real-time Audio Recording**
- WebRTC-based high-quality audio capture (48kHz, stereo)
- Live audio level monitoring and visualization
- Pause/resume functionality
- Professional recording standards

### 🎛️ **Professional DAW Audio Processing Pipeline**
- **Speech Detection**: Agentic RAG speech detection and content analysis
- **Audio Editing**: Noise reduction, EQ, compression, LUFS normalization
- **Speaker Identification**: Multi-speaker conversation processing and diarization
- **Transcription**: Speech-to-text with confidence scoring and sentiment analysis
- **Batch Processing**: Automated conversation clip editing with metadata tracking
- **Professional Standards**: EBU R128 broadcast compliance and quality metrics
- Live audio level monitoring and visualization
- Pause/resume functionality
- Professional recording standards

### 🤖 **AI-Powered Audio Analysis**
- **Spectral Analysis**: FFT processing, frequency spectrum, spectrogram
- **Feature Extraction**: Tempo, genre, energy, danceability, valence
- **Quality Assessment**: Peak levels, clipping detection, dynamic range
- **Professional Standards**: EBU R128 loudness compliance

### 📊 **MLflow Integration**
- Automatic experiment tracking
- Metrics logging (tempo, energy, quality scores)
- Artifact storage (audio files, analysis reports)
- Professional ML workflow documentation

### 🎨 **Interactive Visualizations**
- Real-time waveform display
- Frequency spectrum analysis
- Spectrogram heat maps
- Live recording level meters

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Frontend  │────│  Audio Services  │────│ MLflow Backend  │
│   (React + TS)  │    │ (Analysis + Rec) │    │  (Experiments)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                       │                        │
        ▼                       ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Browser WebRTC  │    │   AI Processing  │    │   Artifact      │
│   Microphone    │    │  FFT + Features  │    │    Storage      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🎯 Competition Highlights

### **HP AI Studio Integration**
- ✅ **MLflow Tracking**: Professional ML experiment management
- ✅ **Model Artifacts**: Comprehensive logging and versioning  
- ✅ **Scalable Architecture**: Cloud-ready deployment patterns
- ✅ **Real-world Application**: Music production industry use case

### **Technical Innovation**
- 🔬 **Advanced Signal Processing**: Real-time FFT and spectral analysis
- 🤖 **AI Classification**: Genre detection and mood analysis
- 📊 **Quality Standards**: Professional audio compliance checking
- 🎨 **Interactive UI**: Modern React-based visualization system

### **Professional Standards**
- 🎚️ **EBU R128 Compliance**: Broadcast loudness standards
- 🔊 **High-Quality Audio**: 48kHz sample rate, stereo recording
- ⚡ **Real-time Processing**: Sub-100ms analysis latency
- 🛡️ **Error Handling**: Robust audio device management

## 📁 Project Structure

```
demo/
├── audio-analysis-demo/          # React demo application
│   ├── src/
│   │   ├── services/            # Audio analysis & recording
│   │   ├── components/          # UI components
│   │   └── types/               # TypeScript definitions
│   └── package.json
├── HP_AI_Studio_Judge_Evaluation_Demo.ipynb  # DAW Audio Processing Pipeline Demo
├── start_demo.py               # Integrated demo launcher
├── requirements.txt            # Python dependencies
└── README.md                  # This file
```

## 🔧 Technical Details

### Audio Analysis Engine
- **FFT Processing**: 2048-point Fast Fourier Transform
- **Windowing**: Hamming window for spectral analysis
- **Feature Extraction**: Spectral centroid, RMS, zero-crossing rate
- **Tempo Detection**: Autocorrelation-based beat tracking
- **Genre Classification**: Rule-based AI classification system

### Recording System
- **WebRTC Audio API**: Native browser audio capture
- **Professional Settings**: 48kHz sample rate, stereo channels
- **Real-time Monitoring**: Live audio level visualization
- **Format Support**: WebM, MP4, MPEG audio formats

### MLflow Integration
- **Experiment Tracking**: Automatic run creation and management
- **Metrics Logging**: Audio features and quality scores
- **Artifact Storage**: Audio files and analysis reports
- **Reproducibility**: Complete parameter and environment tracking

## 🎵 Usage Examples

### 1. DAW Audio Processing Pipeline (Jupyter Notebook)
1. Open `HP_AI_Studio_Judge_Evaluation_Demo.ipynb` in Jupyter
2. Run the notebook to experience the complete DAW workflow:
   - Generate realistic conversation audio with multiple speakers
   - Perform professional audio editing (noise reduction, EQ, compression)
   - Apply LUFS normalization for broadcast standards
   - Analyze speaker patterns and generate transcriptions
   - Track experiments with MLflow integration
3. View comprehensive visualizations and quality metrics

### 2. Record and Analyze (Web Demo)
1. Click "Start Recording" to capture audio
2. Speak, sing, or play music into your microphone
3. Click "Stop & Analyze" to process the recording
4. View real-time analysis results and visualizations

### 2. Upload and Process (Web Demo)
1. Click the upload area to select an audio file
2. Choose any supported audio format (MP3, WAV, etc.)
3. Automatic analysis begins immediately
4. Review comprehensive audio insights

### 3. MLflow Tracking
1. All analyses are automatically tracked in MLflow
2. Visit http://localhost:5000 to view experiment history
3. Compare different recordings and their characteristics
4. Download artifacts and analysis reports

## 🏆 Competition Value

This demo showcases **HP AI Studio's capabilities** for:

- **Real-world AI Applications**: Music production, audio analysis, and professional DAW workflows
- **Professional ML Workflows**: MLflow integration and experiment tracking
- **Scalable Architecture**: Cloud-ready deployment patterns
- **Industry Standards**: Professional audio compliance and quality
- **Interactive Innovation**: Modern web-based AI demonstration + Jupyter notebook workflows
- **Conversation Processing**: Advanced speech detection, editing, and transcription capabilities

Perfect for judges to evaluate:
- ✅ Technical sophistication
- ✅ Real-world applicability  
- ✅ Professional implementation
- ✅ User experience design
- ✅ MLflow integration quality

## 🛠️ Development

### Local Development
```bash
cd audio-analysis-demo
npm run dev  # Start development server
```

### Build for Production
```bash
cd audio-analysis-demo
npm run build  # Build optimized version
npm run preview  # Preview production build
```

## 🎯 Next Steps

- 🔄 **Model Training**: Integrate custom ML models for genre classification
- 🌐 **Cloud Deployment**: Deploy to HP AI Studio cloud infrastructure
- 📱 **Mobile Support**: Extend to mobile web applications
- 🎛️ **Advanced Features**: Multi-track analysis, MIDI integration
- 🎙️ **DAW Enhancement**: Real-time conversation processing and live broadcast integration

---

**Built with ❤️ for the HP AI Studio Competition**  
*Demonstrating the future of AI-powered audio analysis and professional DAW workflows*
