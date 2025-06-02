#!/usr/bin/env python3
"""
Audio Analysis Module for Orpheus Engine

This module provides audio analysis functionality for the Orpheus Engine Workstation.
"""

import os
import json
import sys
import numpy as np
import librosa
import librosa.display

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
            analysis_types (list): Types of analysis to perform.
            
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
            spectral["centroid_mean"] = float(np.mean(spectral_centroid))
            
            results["spectral"] = spectral
            
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
            
        # Find the export directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.join(os.path.dirname(script_dir), 'workstation', 'backend')
        self.export_dir = os.path.join(backend_dir, 'analysis_exports')
        os.makedirs(self.export_dir, exist_ok=True)
        
        # Generate file path
        export_path = os.path.join(self.export_dir, f"{filename_prefix}_analysis.{format}")
        
        if format == 'json':
            with open(export_path, 'w') as f:
                json.dump(self.last_analysis, f, indent=2, default=lambda x: float(x) if isinstance(x, np.number) else x)
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
                f.write("<html><head><title>Audio Analysis Results</title></head><body>")
                f.write("<h1>Audio Analysis Results</h1>")
                
                for section, data in self.last_analysis.items():
                    f.write(f"<h2>{section.title()}</h2>")
                    
                    if isinstance(data, dict):
                        f.write("<table border='1'>")
                        for key, value in data.items():
                            f.write(f"<tr><td>{key}</td><td>{value}</td></tr>")
                        f.write("</table>")
                    else:
                        f.write(f"<p>{data}</p>")
                
                f.write("</body></html>")
        else:
            raise ValueError(f"Unsupported export format: {format}")
            
        return export_path
