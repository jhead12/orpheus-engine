import sys
import json
import os
import base64
from io import BytesIO
import numpy as np
import librosa
import librosa.display
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend
import matplotlib.pyplot as plt
import pyloudnorm as pyln

def analyze_audio(file_path):
    # Load the audio file
    y, sr = librosa.load(file_path, sr=None)
    
    # Basic info
    duration = librosa.get_duration(y=y, sr=sr)
    
    # BPM analysis
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    
    # LUFS measurement (integrated loudness)
    meter = pyln.Meter(sr)
    loudness = meter.integrated_loudness(y)
    
    # RMS energy
    rms = librosa.feature.rms(y=y)[0]
    rms_db = 20 * np.log10(np.mean(rms) + 1e-10)
    
    # Peak levels
    peak = np.max(np.abs(y))
    peak_db = 20 * np.log10(peak + 1e-10)
    
    # Time signature estimation (simplified)
    # For accurate time signature detection, more complex algorithms are needed
    beats = librosa.frames_to_time(beat_frames, sr=sr)
    if len(beats) > 0:
        beat_diffs = np.diff(beats)
        median_beat_length = np.median(beat_diffs)
        # Simple heuristic, not accurate for complex music
        time_signature = {
            "numerator": 4,  # Default to 4/4
            "denominator": 4
        }
    else:
        time_signature = None

    # Generate waveform image
    plt.figure(figsize=(10, 4))
    plt.subplot(2, 1, 1)
    librosa.display.waveshow(y, sr=sr)
    plt.title('Waveform')
    
    # Generate spectrogram
    plt.subplot(2, 1, 2)
    D = librosa.amplitude_to_db(np.abs(librosa.stft(y)), ref=np.max)
    librosa.display.specshow(D, sr=sr, x_axis='time', y_axis='log')
    plt.colorbar(format='%+2.0f dB')
    plt.title('Spectrogram')
    
    plt.tight_layout()
    
    # Save figure to BytesIO buffer
    buf = BytesIO()
    plt.savefig(buf, format='png')
    plt.close()
    buf.seek(0)
    
    # Convert image to base64
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    
    # Return analysis results
    return {
        "tempo_bpm": float(tempo),
        "loudness_lufs": float(loudness),
        "peak_db": float(peak_db),
        "rms_db": float(rms_db),
        "waveform_image": f"data:image/png;base64,{img_str}",
        "spectrogram_image": f"data:image/png;base64,{img_str}",
        "time_signature": time_signature
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python analyze_audio.py <audio_file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({"error": f"File not found: {file_path}"}))
        sys.exit(1)
    
    try:
        result = analyze_audio(file_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)