# 🎙️ Professional Audio Equipment Integration Guide

## 🎯 **For Audio Professionals & Sound Engineers**

Orpheus Engine Workstation is specifically designed for audio professionals who need comprehensive sound analysis visualizations and seamless integration with professional recording equipment. This guide covers setup for industry-standard audio interfaces, microphones, and analysis workflows.

---

## 🔊 **Supported Professional Audio Equipment**

### **Audio Interfaces**
- **Focusrite Scarlett Series** (Solo, 2i2, 4i4, 8i6, 18i8, 18i20)
- **PreSonus AudioBox Series** (USB 96, Studio, 1818VSL)
- **RME Babyface Pro FS, UCX II, Fireface Series**
- **Universal Audio Apollo Twin, Apollo 8, Apollo x6**
- **MOTU UltraLite-mk5, 8M, 16A, 828es**
- **Zoom PodTrak P4, P8** (Podcast-specific interfaces)
- **Behringer U-Phoria Series, X32 Digital Mixers**

### **Professional Microphones**
- **Condenser**: Neumann U87, Audio-Technica AT4040, Rode NT1-A
- **Dynamic**: Shure SM57/SM58, Electro-Voice RE20, Heil PR40
- **Ribbon**: Royer R-121, AEA R84, Coles 4038
- **Shotgun**: Sennheiser MKH416, Rode NTG3, Audio-Technica AT875R
- **Lavalier**: DPA 4060, Countryman B6, Sanken COS-11D

### **Monitoring Equipment**
- **Studio Monitors**: Yamaha HS8, KRK Rokit G4, Adam Audio A7X
- **Reference Headphones**: Sony MDR-7506, Audio-Technica ATH-M50x, Sennheiser HD650
- **Acoustic Treatment**: Primacoustic, Auralex, GIK Acoustics panels

---

## 🎚️ **Professional Recording Setup**

### **Multi-Device Recording Workflow**

```bash
# 1. Audio Interface Setup (ASIO/Core Audio)
# Windows: Install ASIO drivers for your interface
# macOS: Interfaces are typically class-compliant
# Linux: Use JACK for professional audio routing

# 2. Start Orpheus with Professional Audio Settings
npm run dev:professional  # Optimized for low-latency professional audio

# 3. Configure Audio Settings in Orpheus
# - Sample Rate: 48kHz/96kHz for professional work
# - Buffer Size: 128-256 samples for live monitoring
# - Bit Depth: 24-bit minimum for professional recording
```

### **Device-Specific Configuration**

#### **RME Audio Interfaces**
```javascript
// Orpheus Engine RME TotalMix Integration
const rmeSettings = {
  sampleRate: 96000,        // Professional sample rate
  bufferSize: 128,          // Low latency for live monitoring
  clockSource: 'internal',  // Use RME's superior clocking
  channels: {
    input: [1, 2, 3, 4, 5, 6, 7, 8],  // All analog inputs
    adat: [9, 10, 11, 12, 13, 14, 15, 16], // ADAT inputs
    spdif: [17, 18]         // S/PDIF digital inputs
  }
};
```

#### **Universal Audio Apollo Integration**
```javascript
// UAD Plugin Integration (via HP AI Studio ML Pipeline)
const apolloSettings = {
  uadPlugins: true,         // Enable UAD plugin processing
  consoleApp: 'integrate',  // Integrate with UA Console
  unison: {
    channel1: 'Neve 1073',  // Unison preamp modeling
    channel2: 'API Vision'   // Different preamp per channel
  },
  realtime: true           // Real-time UAD processing
};
```

---

## 📊 **Advanced Sound Analysis Features**

### **Real-Time Spectral Analysis**

Our HP AI Studio integration provides professional-grade analysis:

```python
# Professional Spectral Analysis Pipeline
import mlflow
import librosa
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal
import plotly.graph_objects as go

class ProfessionalAudioAnalyzer:
    def __init__(self, sample_rate=48000):
        """Initialize professional audio analyzer"""
        self.sample_rate = sample_rate
        self.window_size = 2048
        self.hop_length = 512
        self.mel_filters = 128
        
        # Start MLFlow experiment tracking
        mlflow.set_experiment("orpheus-professional-analysis")
    
    def comprehensive_analysis(self, audio_file_path):
        """Perform comprehensive professional audio analysis"""
        with mlflow.start_run():
            # Load audio with professional settings
            y, sr = librosa.load(audio_file_path, sr=self.sample_rate, mono=False)
            
            # Log session parameters
            mlflow.log_param("sample_rate", sr)
            mlflow.log_param("channels", y.shape[0] if y.ndim > 1 else 1)
            mlflow.log_param("duration", len(y) / sr)
            
            results = {}
            
            # 1. FREQUENCY DOMAIN ANALYSIS
            results['spectral'] = self.spectral_analysis(y, sr)
            
            # 2. TIME DOMAIN ANALYSIS  
            results['temporal'] = self.temporal_analysis(y, sr)
            
            # 3. PSYCHOACOUSTIC ANALYSIS
            results['psychoacoustic'] = self.psychoacoustic_analysis(y, sr)
            
            # 4. BROADCAST STANDARDS COMPLIANCE
            results['broadcast'] = self.broadcast_compliance(y, sr)
            
            # 5. PROFESSIONAL METERING
            results['metering'] = self.professional_metering(y, sr)
            
            # Log all metrics to MLFlow
            self._log_metrics_to_mlflow(results)
            
            return results
    
    def spectral_analysis(self, y, sr):
        """Advanced spectral analysis for professionals"""
        # Convert to mono for analysis if stereo
        if y.ndim > 1:
            y_mono = librosa.to_mono(y)
        else:
            y_mono = y
            
        # Professional FFT settings
        stft = librosa.stft(y_mono, 
                           n_fft=self.window_size * 4,  # Higher resolution
                           hop_length=self.hop_length,
                           window='blackmanharris')     # Professional window
        
        magnitude = np.abs(stft)
        power = magnitude ** 2
        
        # Spectral features
        spectral_centroid = librosa.feature.spectral_centroid(y=y_mono, sr=sr)[0]
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y_mono, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y_mono, sr=sr)[0]
        spectral_flatness = librosa.feature.spectral_flatness(y=y_mono)[0]
        
        # Professional frequency analysis
        freq_bins = librosa.fft_frequencies(sr=sr, n_fft=self.window_size * 4)
        
        return {
            'stft_magnitude': magnitude,
            'stft_power': power,
            'frequency_bins': freq_bins,
            'spectral_centroid': spectral_centroid,
            'spectral_bandwidth': spectral_bandwidth, 
            'spectral_rolloff': spectral_rolloff,
            'spectral_flatness': spectral_flatness
        }
    
    def temporal_analysis(self, y, sr):
        """Time domain analysis for audio professionals"""
        if y.ndim > 1:
            y_mono = librosa.to_mono(y)
        else:
            y_mono = y
            
        # Professional tempo and beat tracking
        tempo, beats = librosa.beat.beat_track(y=y_mono, sr=sr, 
                                             hop_length=self.hop_length)
        
        # Onset detection for transient analysis
        onset_frames = librosa.onset.onset_detect(y=y_mono, sr=sr,
                                                hop_length=self.hop_length)
        onset_times = librosa.frames_to_time(onset_frames, sr=sr,
                                           hop_length=self.hop_length)
        
        # Zero crossing rate (useful for speech/music differentiation)
        zcr = librosa.feature.zero_crossing_rate(y_mono,
                                               frame_length=self.window_size,
                                               hop_length=self.hop_length)[0]
        
        # RMS energy
        rms = librosa.feature.rms(y=y_mono, 
                                frame_length=self.window_size,
                                hop_length=self.hop_length)[0]
        
        return {
            'tempo': tempo,
            'beat_times': librosa.frames_to_time(beats, sr=sr),
            'onset_times': onset_times,
            'zero_crossing_rate': zcr,
            'rms_energy': rms
        }
    
    def psychoacoustic_analysis(self, y, sr):
        """Psychoacoustic analysis for professional audio"""
        if y.ndim > 1:
            y_mono = librosa.to_mono(y)
        else:
            y_mono = y
            
        # Mel-frequency cepstral coefficients (crucial for audio analysis)
        mfccs = librosa.feature.mfcc(y=y_mono, sr=sr, n_mfcc=13,
                                   n_fft=self.window_size,
                                   hop_length=self.hop_length)
        
        # Chroma features (harmonic content)
        chroma = librosa.feature.chroma_stft(y=y_mono, sr=sr,
                                           n_fft=self.window_size,
                                           hop_length=self.hop_length)
        
        # Spectral contrast (timbral texture)
        contrast = librosa.feature.spectral_contrast(y=y_mono, sr=sr,
                                                   hop_length=self.hop_length)
        
        # Tonnetz (harmonic network features)
        tonnetz = librosa.feature.tonnetz(y=y_mono, sr=sr)
        
        return {
            'mfcc': mfccs,
            'chroma': chroma,
            'spectral_contrast': contrast,
            'tonnetz': tonnetz
        }
    
    def broadcast_compliance(self, y, sr):
        """Check broadcast standards compliance (EBU R128, ATSC A/85)"""
        try:
            import pyloudnorm as pyln
            
            # Initialize loudness meter for broadcast standards
            meter = pyln.Meter(sr)  # EBU R128 compliant meter
            
            if y.ndim > 1:
                # For stereo, measure both channels
                loudness_lufs = meter.integrated_loudness(y.T)
                peak_dbfs = 20 * np.log10(np.max(np.abs(y)))
            else:
                loudness_lufs = meter.integrated_loudness(y)
                peak_dbfs = 20 * np.log10(np.max(np.abs(y)))
            
            # Check compliance with broadcast standards
            ebu_r128_compliant = -23.5 <= loudness_lufs <= -22.5  # EBU R128 target
            peak_compliant = peak_dbfs <= -1.0  # True peak limit
            
            return {
                'loudness_lufs': loudness_lufs,
                'peak_dbfs': peak_dbfs,
                'ebu_r128_compliant': ebu_r128_compliant,
                'peak_compliant': peak_compliant
            }
        except ImportError:
            return {'error': 'pyloudnorm not installed for broadcast compliance'}
    
    def professional_metering(self, y, sr):
        """Professional audio metering and analysis"""
        if y.ndim > 1:
            # Stereo analysis
            left_channel = y[0] if y.shape[0] == 2 else y[:, 0]
            right_channel = y[1] if y.shape[0] == 2 else y[:, 1]
            
            # Peak levels
            left_peak = 20 * np.log10(np.max(np.abs(left_channel)) + 1e-10)
            right_peak = 20 * np.log10(np.max(np.abs(right_channel)) + 1e-10)
            
            # RMS levels  
            left_rms = 20 * np.log10(np.sqrt(np.mean(left_channel**2)) + 1e-10)
            right_rms = 20 * np.log10(np.sqrt(np.mean(right_channel**2)) + 1e-10)
            
            # Stereo width analysis
            mid = (left_channel + right_channel) / 2
            side = (left_channel - right_channel) / 2
            stereo_width = np.std(side) / (np.std(mid) + 1e-10)
            
            return {
                'left_peak_db': left_peak,
                'right_peak_db': right_peak,
                'left_rms_db': left_rms,
                'right_rms_db': right_rms,
                'stereo_width': stereo_width,
                'phase_correlation': np.corrcoef(left_channel, right_channel)[0, 1]
            }
        else:
            # Mono analysis
            peak_db = 20 * np.log10(np.max(np.abs(y)) + 1e-10)
            rms_db = 20 * np.log10(np.sqrt(np.mean(y**2)) + 1e-10)
            
            return {
                'peak_db': peak_db,
                'rms_db': rms_db,
                'dynamic_range': peak_db - rms_db
            }
    
    def _log_metrics_to_mlflow(self, results):
        """Log analysis results to MLFlow for experiment tracking"""
        # Log spectral metrics
        if 'spectral' in results:
            mlflow.log_metric("spectral_centroid_mean", 
                            np.mean(results['spectral']['spectral_centroid']))
            mlflow.log_metric("spectral_bandwidth_mean",
                            np.mean(results['spectral']['spectral_bandwidth']))
            mlflow.log_metric("spectral_rolloff_mean",
                            np.mean(results['spectral']['spectral_rolloff']))
        
        # Log temporal metrics
        if 'temporal' in results:
            mlflow.log_metric("tempo_bpm", results['temporal']['tempo'])
            mlflow.log_metric("onset_density", 
                            len(results['temporal']['onset_times']))
        
        # Log broadcast compliance
        if 'broadcast' in results and 'loudness_lufs' in results['broadcast']:
            mlflow.log_metric("loudness_lufs", results['broadcast']['loudness_lufs'])
            mlflow.log_metric("peak_dbfs", results['broadcast']['peak_dbfs'])
            mlflow.log_metric("ebu_r128_compliant", 
                            int(results['broadcast']['ebu_r128_compliant']))
        
        # Log professional metering
        if 'metering' in results:
            for key, value in results['metering'].items():
                if isinstance(value, (int, float)) and not np.isnan(value):
                    mlflow.log_metric(f"metering_{key}", value)

# Usage example for professionals
if __name__ == "__main__":
    analyzer = ProfessionalAudioAnalyzer(sample_rate=48000)
    
    # Analyze professional audio file
    results = analyzer.comprehensive_analysis("professional_recording.wav")
    
    print("Professional Audio Analysis Complete!")
    print(f"Tempo: {results['temporal']['tempo']:.1f} BPM")
    print(f"Loudness: {results['broadcast']['loudness_lufs']:.1f} LUFS")
    print(f"Peak Level: {results['broadcast']['peak_dbfs']:.1f} dBFS")
```

---

## 🎛️ **Multi-Channel Recording Setup**

### **8-Channel Interface Setup (e.g., PreSonus 1818VSL)**

```javascript
// Orpheus Engine Multi-Channel Configuration
const multiChannelSetup = {
  // Input routing for different recording sources
  inputs: {
    channel1: { type: 'vocal', preamp: 'tube', phantom: true },
    channel2: { type: 'vocal_harmony', preamp: 'solid_state', phantom: true },
    channel3: { type: 'acoustic_guitar_direct', preamp: 'vintage', phantom: false },
    channel4: { type: 'acoustic_guitar_mic', preamp: 'modern', phantom: true },
    channel5: { type: 'electric_guitar_amp', preamp: 'tube', phantom: false },
    channel6: { type: 'bass_direct', preamp: 'solid_state', phantom: false },
    channel7: { type: 'kick_drum', preamp: 'punch', phantom: false },
    channel8: { type: 'snare_drum', preamp: 'crisp', phantom: false }
  },
  
  // Professional monitoring setup
  monitoring: {
    headphone1: { mix: 'artist_cue', level: -12 },  // Artist monitor
    headphone2: { mix: 'engineer_cue', level: -8 }, // Engineer monitor  
    mainOut: { monitors: 'nearfield', level: -18 }   // Control room
  },
  
  // Real-time processing
  realTimeEffects: {
    channel1: ['compressor', 'eq', 'reverb'],
    channel2: ['compressor', 'eq', 'delay'],
    // ... etc for each channel
  }
};
```

### **Professional Workflow Examples**

#### **Podcast Production Setup**
```bash
# Multi-host podcast with remote guests
# Hardware: Zoom PodTrak P8 + Shure SM7B microphones

# 1. Local Setup (4 hosts)
Input 1-4: Shure SM7B mics (hosts)
Input 5-6: Stereo return from remote recording software
Input 7-8: Sound effects / music playback

# 2. Orpheus Engine Configuration  
Recording Tracks:
- Track 1-4: Individual host recordings (for post-editing flexibility)
- Track 5: Mixed remote guests
- Track 6: Sound effects/music
- Track 7: Mix-minus for remote guests (prevents echo)

# 3. Real-time Analysis
- Speech intelligibility analysis
- Background noise detection
- Dynamic range optimization
- Automatic gain control monitoring
```

#### **Music Production Setup**
```bash
# Full band recording with overdubs
# Hardware: RME Fireface UCX II + professional microphones

# 1. Drum Kit (8 channels)
Input 1: Kick (AKG D112)
Input 2: Snare Top (Shure SM57)  
Input 3: Snare Bottom (Shure SM57)
Input 4: Hi-Hat (AKG C451)
Input 5-6: Overhead L/R (Neumann KM184 pair)
Input 7-8: Room mics L/R (Coles 4038 pair)

# 2. Additional Instruments
Input 9: Bass DI (Countryman Type 85)
Input 10: Bass Amp (Neumann U47)
Input 11-12: Guitar Amp L/R (Royer R-121 + Shure SM57)

# 3. Orpheus Analysis Features
- Real-time phase correlation between drum mics
- Frequency conflict detection between instruments  
- Dynamic range monitoring per track
- Stereo width analysis for overhead mics
- Automatic gain staging recommendations
```

---

## 📈 **Professional Visualization Features**

### **Real-Time Spectrum Analysis**
- **1/3 Octave RTA**: Industry-standard real-time analyzer
- **Waterfall Display**: Time-frequency visualization for transient analysis
- **Phase Correlation Meter**: Critical for stereo recording
- **Vectorscope**: Visual representation of stereo field
- **Goniometer**: Professional stereo width analysis

### **Broadcast Compliance Monitoring**
- **EBU R128 Loudness Metering**: European broadcast standard
- **ATSC A/85 Compliance**: North American broadcast standard
- **True Peak Limiting**: Prevents digital overs
- **Dialogue Intelligence**: Automatic speech level optimization

### **Advanced Metering**
- **PPM (Peak Programme Meter)**: Professional peak metering
- **VU Meters**: Classic analog-style metering
- **LUFS Meters**: Loudness Units relative to Full Scale
- **Surround Sound Metering**: 5.1/7.1 surround analysis

---

## 🔧 **Professional Workflow Integration**

### **DAW Integration** 
Orpheus Engine works alongside:
- **Pro Tools** (via ReWire/Audio Units)
- **Logic Pro** (Audio Units integration)
- **Cubase/Nuendo** (VST3 integration)
- **Reaper** (Native plugin support)
- **Studio One** (PreSonus integration)

### **Professional File Formats**
- **Broadcast WAV (BWF)**: Industry-standard with metadata
- **AIFF**: Professional uncompressed audio
- **DSD**: Super Audio CD format support
- **REX Files**: Recycle loop format
- **AAF/OMF**: Pro Tools interchange

### **Metadata Support**
- **BEXT Chunk**: Broadcast extension metadata
- **iXML**: Industry-standard production metadata  
- **Timecode**: SMPTE timecode support
- **BWF Metadata**: Originator, timestamp, coding history

---

## 🎯 **HP AI Studio Competition Integration**

### **Professional Use Cases for Competition**

1. **Broadcast Audio Compliance**
   - Automated loudness compliance checking
   - Real-time broadcast standard monitoring
   - Intelligent audio enhancement for broadcast

2. **Music Production Intelligence**
   - AI-powered mix analysis and suggestions
   - Automatic instrument recognition and separation
   - Intelligent arrangement recommendations

3. **Post-Production Workflows**
   - Dialogue enhancement and noise reduction
   - Automatic ADR (dialogue replacement) sync
   - Sound design asset organization and search

4. **Live Sound Analysis**
   - Real-time acoustic analysis for live venues
   - Feedback detection and suppression
   - Automatic EQ suggestions for room acoustics

### **Competition Demonstration Scenarios**

```python
# Demo Script: Professional Audio Analysis Workflow
def demo_professional_workflow():
    """
    Demonstrates HP AI Studio integration for professional audio work
    """
    # 1. Load professional recording (multi-channel, 48kHz/24-bit)
    session = load_professional_session("multitrack_recording.wav")
    
    # 2. Run comprehensive analysis with MLFlow tracking
    with mlflow.start_run(run_name="professional_demo"):
        # Analyze each track individually
        for track in session.tracks:
            results = analyzer.comprehensive_analysis(track.audio_file)
            
            # Log professional metrics
            mlflow.log_metrics({
                f"track_{track.id}_loudness": results['broadcast']['loudness_lufs'],
                f"track_{track.id}_peak": results['broadcast']['peak_dbfs'],
                f"track_{track.id}_tempo": results['temporal']['tempo']
            })
        
        # 3. Generate professional visualizations
        create_professional_visualizations(session)
        
        # 4. Export analysis report for client
        export_professional_report(session, results)
    
    return "Professional analysis complete with MLFlow tracking"
```

---

## 📚 **Professional Resources**

### **Industry Standards Documentation**
- **EBU R128**: Loudness normalization and permitted maximum level
- **ITU-R BS.1770**: Algorithms to measure programme loudness and true peak
- **AES31**: File format for audio-for-video applications
- **SMPTE**: Timecode and synchronization standards

### **Training Materials**
- Professional audio analysis tutorials
- Broadcast compliance workflows
- Multi-channel recording best practices
- Advanced visualization interpretation

### **Support Resources**
- Professional user forum
- Direct technical support for audio professionals
- Custom workflow development services
- Integration consulting for post facilities

---

**🎵 Built by audio professionals, for audio professionals. Showcasing HP AI Studio's power in real-world professional audio environments.**
