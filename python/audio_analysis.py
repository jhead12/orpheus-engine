#!/usr/bin/env python3
"""
Audio Analysis Module for Orpheus Engine

This module provides audio analysis functionality for the Orpheus Engine Workstation.
"""

import os
import json
import sys
from pathlib import Path

# Import dependencies with error handling
try:
    import numpy as np
except ImportError:
    print("ERROR: numpy package not found. Please install it with:")
    print("pip install numpy")
    print("or run: pip install -r requirements.txt")
    sys.exit(1)

try:
    import librosa
    import librosa.display
except ImportError:
    print("ERROR: librosa package not found. Please install it with:")
    print("pip install librosa")
    print("or run: pip install -r requirements.txt")
    sys.exit(1)

try:
    import matplotlib.pyplot as plt
except ImportError:
    print("ERROR: matplotlib package not found. Please install it with:")
    print("pip install matplotlib")
    print("or run: pip install -r requirements.txt")
    sys.exit(1)

class AudioAnalyzer:
    """
    Analyzes audio data and extracts features and characteristics.
    """
    
    def __init__(self, sample_rate=44100):
        """
        Initialize the AudioAnalyzer.
        
        Args:
            sample_rate (int): The sample rate of the audio to analyze.
        """
        self.sample_rate = sample_rate
        self.last_analysis = None
        self.export_dir = None
    
    def analyze_audio(self, audio_data, analysis_types=None):
        """
        Analyze the provided audio data.
        
        Args:
            audio_data (np.ndarray): The audio data to analyze.
            analysis_types (list): Types of analysis to perform (spectral, dynamics, musical, technical, recording).
            
        Returns:
            dict: The analysis results.
        """
        if analysis_types is None:
            analysis_types = ['spectral', 'dynamics', 'musical', 'technical', 'recording']
        
        results = {
            "audio_info": {
                "length_samples": len(audio_data),
                "length_seconds": len(audio_data) / self.sample_rate,
                "sample_rate": self.sample_rate
            }
        }
        
        # Spectral analysis
        if 'spectral' in analysis_types:
            spectral = {}
            
            # Calculate spectrum
            spectrum = np.abs(librosa.stft(audio_data))
            spectral["spectrum_shape"] = spectrum.shape
            
            # Calculate spectral centroid
            spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=self.sample_rate)[0]
            spectral["centroid_mean"] = np.mean(spectral_centroid)
            
            # Calculate spectral bandwidth
            spectral_bandwidth = librosa.feature.spectral_bandwidth(y=audio_data, sr=self.sample_rate)[0]
            spectral["bandwidth_mean"] = np.mean(spectral_bandwidth)
            
            # Calculate spectral rolloff
            spectral_rolloff = librosa.feature.spectral_rolloff(y=audio_data, sr=self.sample_rate)[0]
            spectral["rolloff_mean"] = np.mean(spectral_rolloff)
            
            results["spectral"] = spectral
        
        # Dynamics analysis
        if 'dynamics' in analysis_types:
            dynamics = {}
            
            # Calculate RMS energy
            rms = librosa.feature.rms(y=audio_data)[0]
            dynamics["rms_mean"] = np.mean(rms)
            dynamics["rms_std"] = np.std(rms)
            
            # Calculate peak levels
            dynamics["peak_amplitude"] = np.max(np.abs(audio_data))
            dynamics["peak_db"] = 20 * np.log10(dynamics["peak_amplitude"]) if dynamics["peak_amplitude"] > 0 else -np.inf
            
            # Calculate crest factor
            crest_factor = dynamics["peak_amplitude"] / dynamics["rms_mean"] if dynamics["rms_mean"] > 0 else 0
            dynamics["crest_factor"] = crest_factor
            
            results["dynamics"] = dynamics
        
        # Musical analysis
        if 'musical' in analysis_types:
            musical = {}
            
            # Calculate pitch
            pitches, magnitudes = librosa.piptrack(y=audio_data, sr=self.sample_rate)
            musical["pitch_mean"] = np.mean(pitches[magnitudes > 0.1]) if np.any(magnitudes > 0.1) else 0
            
            # Calculate tempo
            onset_env = librosa.onset.onset_strength(y=audio_data, sr=self.sample_rate)
            tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=self.sample_rate)[0]
            musical["tempo"] = tempo
            
            # Calculate chroma features
            chroma = librosa.feature.chroma_stft(y=audio_data, sr=self.sample_rate)
            musical["chroma_mean"] = np.mean(chroma, axis=1)
            
            results["musical"] = musical
            
        # Save the analysis results
        self.last_analysis = results
        return results
    
    def export_analysis(self, format='json', filename_prefix='analysis'):
        """
        Export the analysis results in the specified format.
        
        Args:
            format (str): The format to export to (json, txt, html).
            filename_prefix (str): The prefix for the exported file.
            
        Returns:
            str: The path to the exported file.
        """
        if self.last_analysis is None:
            raise ValueError("No analysis results to export. Run analyze_audio first.")
        
        # Get the export directory from the environment
        if not self.export_dir:
            # Try to find the export directory - can be overridden or use default
            script_dir = os.path.dirname(os.path.abspath(__file__))
            backend_dir = os.path.join(os.path.dirname(script_dir), 'workstation', 'backend')
            default_export_dir = os.path.join(backend_dir, 'analysis_exports')
            self.export_dir = os.environ.get('ANALYSIS_EXPORT_DIR', default_export_dir)
            os.makedirs(self.export_dir, exist_ok=True)
        
        # Generate file path
        export_path = os.path.join(self.export_dir, f"{filename_prefix}_analysis.{format}")
        
        if format == 'json':
            with open(export_path, 'w') as f:
                json.dump(self.last_analysis, f, indent=2)
                
        elif format == 'txt':
            with open(export_path, 'w') as f:
                f.write("Audio Analysis Results\n")
                f.write("=====================\n\n")
                
                for section, data in self.last_analysis.items():
                    f.write(f"{section.upper()}\n")
                    f.write("-" * len(section) + "\n")
                    
                    if isinstance(data, dict):
                        for key, value in data.items():
                            f.write(f"{key}: {value}\n")
                    else:
                        f.write(f"{data}\n")
                    f.write("\n")
                    
        elif format == 'html':
            with open(export_path, 'w') as f:
                f.write("<html><head><title>Audio Analysis Results</title>")
                f.write("<style>body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:20px}")
                f.write("h1{color:#333}h2{color:#555}.section{margin-bottom:20px;padding:10px;background:#f8f8f8;border-radius:5px}")
                f.write("table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:8px;border-bottom:1px solid #ddd}")
                f.write("</style></head><body>")
                f.write("<h1>Audio Analysis Results</h1>")
                
                for section, data in self.last_analysis.items():
                    f.write(f"<div class='section'><h2>{section.title()}</h2>")
                    
                    if isinstance(data, dict):
                        f.write("<table>")
                        for key, value in data.items():
                            f.write(f"<tr><td>{key}</td><td>{value}</td></tr>")
                        f.write("</table>")
                    else:
                        f.write(f"<p>{data}</p>")
                    
                    f.write("</div>")
                
                f.write("</body></html>")
        
        else:
            raise ValueError(f"Unsupported export format: {format}")
            
        return export_path

if __name__ == "__main__":
    print("Audio Analysis Module for Orpheus Engine")
    print("Use this module by importing the AudioAnalyzer class")
