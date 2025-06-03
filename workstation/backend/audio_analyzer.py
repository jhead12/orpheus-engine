#!/usr/bin/env python3
"""
Enhanced Audio Analysis Module for Orpheus Engine Backend

This module provides comprehensive audio analysis functionality including:
- Spectral analysis (MFCC, spectral centroid, rolloff, zero crossing rate)
- Rhythm analysis (tempo detection, beat tracking, onset detection)
- Harmonic analysis (chroma features, harmonic/percussive separation)
- Dynamic analysis (RMS energy, loudness, dynamic range)
- Audio quality analysis (SNR, THD, frequency response)
- Audio fingerprinting and similarity analysis
"""

import os
import json
import sys
import numpy as np
import librosa
import librosa.display
import scipy.signal
from typing import Dict, List, Optional, Tuple, Any
import warnings
warnings.filterwarnings('ignore')

class EnhancedAudioAnalyzer:
    """
    Comprehensive audio analyzer with advanced features for music production.
    """
    
    def __init__(self, sample_rate: int = 44100, hop_length: int = 512, n_fft: int = 2048):
        """
        Initialize the Enhanced Audio Analyzer.
        
        Args:
            sample_rate (int): The sample rate of the audio to analyze
            hop_length (int): Number of samples between successive frames
            n_fft (int): Length of the FFT window
        """
        self.sample_rate = sample_rate
        self.hop_length = hop_length
        self.n_fft = n_fft
        self.last_analysis = None
        self.export_dir = None
        
    def analyze_spectral_features(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """
        Analyze spectral features of the audio.
        
        Args:
            audio_data (np.ndarray): Audio time series
            
        Returns:
            Dict containing spectral analysis results
        """
        results = {}
        
        # MFCC features
        mfccs = librosa.feature.mfcc(y=audio_data, sr=self.sample_rate, n_mfcc=13)
        results['mfcc'] = {
            'mean': np.mean(mfccs, axis=1).tolist(),
            'std': np.std(mfccs, axis=1).tolist(),
            'shape': mfccs.shape
        }
        
        # Spectral centroid
        spectral_centroids = librosa.feature.spectral_centroid(y=audio_data, sr=self.sample_rate)[0]
        results['spectral_centroid'] = {
            'mean': float(np.mean(spectral_centroids)),
            'std': float(np.std(spectral_centroids)),
            'min': float(np.min(spectral_centroids)),
            'max': float(np.max(spectral_centroids))
        }
        
        # Spectral rolloff
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio_data, sr=self.sample_rate)[0]
        results['spectral_rolloff'] = {
            'mean': float(np.mean(spectral_rolloff)),
            'std': float(np.std(spectral_rolloff))
        }
        
        # Zero crossing rate
        zcr = librosa.feature.zero_crossing_rate(audio_data)[0]
        results['zero_crossing_rate'] = {
            'mean': float(np.mean(zcr)),
            'std': float(np.std(zcr))
        }
        
        # Spectral bandwidth
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=audio_data, sr=self.sample_rate)[0]
        results['spectral_bandwidth'] = {
            'mean': float(np.mean(spectral_bandwidth)),
            'std': float(np.std(spectral_bandwidth))
        }
        
        # Spectral contrast
        spectral_contrast = librosa.feature.spectral_contrast(y=audio_data, sr=self.sample_rate)
        results['spectral_contrast'] = {
            'mean': np.mean(spectral_contrast, axis=1).tolist(),
            'std': np.std(spectral_contrast, axis=1).tolist()
        }
        
        return results
    
    def analyze_rhythm_features(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """
        Analyze rhythmic features of the audio.
        
        Args:
            audio_data (np.ndarray): Audio time series
            
        Returns:
            Dict containing rhythm analysis results
        """
        results = {}
        
        # Tempo and beat tracking
        tempo, beats = librosa.beat.beat_track(y=audio_data, sr=self.sample_rate)
        results['tempo'] = {
            'bpm': float(tempo),
            'beat_times': librosa.frames_to_time(beats, sr=self.sample_rate).tolist(),
            'num_beats': len(beats)
        }
        
        # Onset detection
        onset_frames = librosa.onset.onset_detect(y=audio_data, sr=self.sample_rate)
        onset_times = librosa.frames_to_time(onset_frames, sr=self.sample_rate)
        results['onsets'] = {
            'times': onset_times.tolist(),
            'count': len(onset_times)
        }
        
        # Rhythmic pattern analysis
        if len(beats) > 1:
            beat_intervals = np.diff(librosa.frames_to_time(beats, sr=self.sample_rate))
            results['rhythm_stability'] = {
                'beat_interval_mean': float(np.mean(beat_intervals)),
                'beat_interval_std': float(np.std(beat_intervals)),
                'tempo_stability': float(1.0 / (1.0 + np.std(beat_intervals)))
            }
        
        return results
    
    def analyze_harmonic_features(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """
        Analyze harmonic and tonal features of the audio.
        
        Args:
            audio_data (np.ndarray): Audio time series
            
        Returns:
            Dict containing harmonic analysis results
        """
        results = {}
        
        # Chroma features
        chroma = librosa.feature.chroma_stft(y=audio_data, sr=self.sample_rate)
        results['chroma'] = {
            'mean': np.mean(chroma, axis=1).tolist(),
            'std': np.std(chroma, axis=1).tolist()
        }
        
        # Harmonic-percussive separation
        y_harmonic, y_percussive = librosa.effects.hpss(audio_data)
        
        # Analyze harmonic content
        harmonic_energy = np.sum(y_harmonic ** 2)
        percussive_energy = np.sum(y_percussive ** 2)
        total_energy = harmonic_energy + percussive_energy
        
        results['harmonic_percussive'] = {
            'harmonic_ratio': float(harmonic_energy / total_energy) if total_energy > 0 else 0.0,
            'percussive_ratio': float(percussive_energy / total_energy) if total_energy > 0 else 0.0
        }
        
        # Tonnetz (tonal centroid features)
        tonnetz = librosa.feature.tonnetz(y=librosa.effects.harmonic(audio_data), sr=self.sample_rate)
        results['tonnetz'] = {
            'mean': np.mean(tonnetz, axis=1).tolist(),
            'std': np.std(tonnetz, axis=1).tolist()
        }
        
        return results
    
    def analyze_dynamic_features(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """
        Analyze dynamic features of the audio.
        
        Args:
            audio_data (np.ndarray): Audio time series
            
        Returns:
            Dict containing dynamic analysis results
        """
        results = {}
        
        # RMS energy
        rms = librosa.feature.rms(y=audio_data)[0]
        results['rms_energy'] = {
            'mean': float(np.mean(rms)),
            'std': float(np.std(rms)),
            'min': float(np.min(rms)),
            'max': float(np.max(rms))
        }
        
        # Dynamic range
        db_rms = librosa.amplitude_to_db(rms)
        results['dynamic_range'] = {
            'range_db': float(np.max(db_rms) - np.min(db_rms)),
            'mean_db': float(np.mean(db_rms)),
            'std_db': float(np.std(db_rms))
        }
        
        # Peak analysis
        peaks, _ = scipy.signal.find_peaks(np.abs(audio_data), height=0.1 * np.max(np.abs(audio_data)))
        results['peaks'] = {
            'count': len(peaks),
            'peak_times': (peaks / self.sample_rate).tolist()[:100]  # Limit to first 100 peaks
        }
        
        # Loudness estimation (simplified)
        # Using RMS as a proxy for loudness
        loudness_lufs = -0.691 + 10 * np.log10(np.mean(audio_data ** 2) + 1e-10)
        results['loudness'] = {
            'lufs_estimate': float(loudness_lufs),
            'peak_amplitude': float(np.max(np.abs(audio_data)))
        }
        
        return results
    
    def analyze_audio_quality(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """
        Analyze audio quality metrics.
        
        Args:
            audio_data (np.ndarray): Audio time series
            
        Returns:
            Dict containing audio quality analysis results
        """
        results = {}
        
        # Signal-to-noise ratio estimation
        # Simple approach: compare high-energy frames to low-energy frames
        rms = librosa.feature.rms(y=audio_data)[0]
        high_energy_threshold = np.percentile(rms, 90)
        low_energy_threshold = np.percentile(rms, 10)
        
        signal_power = np.mean(rms[rms > high_energy_threshold] ** 2)
        noise_power = np.mean(rms[rms < low_energy_threshold] ** 2)
        
        if noise_power > 0:
            snr_db = 10 * np.log10(signal_power / noise_power)
        else:
            snr_db = float('inf')
            
        results['signal_to_noise'] = {
            'snr_db_estimate': float(snr_db) if snr_db != float('inf') else 100.0
        }
        
        # Clipping detection
        max_amplitude = np.max(np.abs(audio_data))
        clipping_threshold = 0.99
        clipped_samples = np.sum(np.abs(audio_data) > clipping_threshold)
        
        results['clipping_analysis'] = {
            'max_amplitude': float(max_amplitude),
            'clipped_samples': int(clipped_samples),
            'clipping_percentage': float(clipped_samples / len(audio_data) * 100)
        }
        
        # Frequency response analysis
        freqs, psd = scipy.signal.welch(audio_data, fs=self.sample_rate, nperseg=1024)
        
        # Find dominant frequencies
        peak_indices = scipy.signal.find_peaks(psd, height=np.max(psd) * 0.1)[0]
        dominant_freqs = freqs[peak_indices]
        
        results['frequency_response'] = {
            'dominant_frequencies': dominant_freqs[:10].tolist(),  # Top 10 dominant frequencies
            'frequency_range': {
                'low': float(np.min(freqs[psd > np.max(psd) * 0.01])),
                'high': float(np.max(freqs[psd > np.max(psd) * 0.01]))
            }
        }
        
        return results
    
    def generate_audio_fingerprint(self, audio_data: np.ndarray) -> Dict[str, Any]:
        """
        Generate a fingerprint for the audio that can be used for similarity analysis.
        
        Args:
            audio_data (np.ndarray): Audio time series
            
        Returns:
            Dict containing fingerprint data
        """
        # Generate a compact representation using chroma and MFCC features
        chroma = librosa.feature.chroma_stft(y=audio_data, sr=self.sample_rate)
        mfcc = librosa.feature.mfcc(y=audio_data, sr=self.sample_rate, n_mfcc=13)
        
        # Create fingerprint as concatenation of mean features
        fingerprint = np.concatenate([
            np.mean(chroma, axis=1),
            np.mean(mfcc, axis=1)
        ])
        
        return {
            'fingerprint': fingerprint.tolist(),
            'fingerprint_size': len(fingerprint),
            'method': 'chroma_mfcc_mean'
        }
    
    def analyze_comprehensive(self, audio_data: np.ndarray, analysis_types: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Perform comprehensive audio analysis.
        
        Args:
            audio_data (np.ndarray): Audio time series
            analysis_types (List[str], optional): Types of analysis to perform
            
        Returns:
            Dict containing comprehensive analysis results
        """
        if analysis_types is None:
            analysis_types = ['spectral', 'rhythm', 'harmonic', 'dynamic', 'quality', 'fingerprint']
            
        results = {
            "audio_info": {
                "length_samples": len(audio_data),
                "length_seconds": len(audio_data) / self.sample_rate,
                "sample_rate": self.sample_rate,
                "channels": 1,  # Assuming mono audio
                "bit_depth": "float32"
            },
            "analysis_timestamp": str(np.datetime64('now')),
            "analyzer_config": {
                "hop_length": self.hop_length,
                "n_fft": self.n_fft
            }
        }
        
        # Perform requested analyses
        if 'spectral' in analysis_types:
            results['spectral'] = self.analyze_spectral_features(audio_data)
            
        if 'rhythm' in analysis_types:
            results['rhythm'] = self.analyze_rhythm_features(audio_data)
            
        if 'harmonic' in analysis_types:
            results['harmonic'] = self.analyze_harmonic_features(audio_data)
            
        if 'dynamic' in analysis_types:
            results['dynamic'] = self.analyze_dynamic_features(audio_data)
            
        if 'quality' in analysis_types:
            results['quality'] = self.analyze_audio_quality(audio_data)
            
        if 'fingerprint' in analysis_types:
            results['fingerprint'] = self.generate_audio_fingerprint(audio_data)
        
        # Store results for export
        self.last_analysis = results
        return results
    
    def compare_audio_similarity(self, audio1: np.ndarray, audio2: np.ndarray) -> Dict[str, Any]:
        """
        Compare similarity between two audio files.
        
        Args:
            audio1 (np.ndarray): First audio time series
            audio2 (np.ndarray): Second audio time series
            
        Returns:
            Dict containing similarity analysis
        """
        # Generate fingerprints for both audio files
        fp1 = self.generate_audio_fingerprint(audio1)
        fp2 = self.generate_audio_fingerprint(audio2)
        
        # Calculate cosine similarity
        fp1_array = np.array(fp1['fingerprint'])
        fp2_array = np.array(fp2['fingerprint'])
        
        # Normalize fingerprints
        fp1_norm = fp1_array / np.linalg.norm(fp1_array)
        fp2_norm = fp2_array / np.linalg.norm(fp2_array)
        
        # Calculate similarity
        similarity = np.dot(fp1_norm, fp2_norm)
        
        return {
            'similarity_score': float(similarity),
            'similarity_percentage': float(similarity * 100),
            'method': 'cosine_similarity_fingerprint'
        }
    
    def export_analysis(self, format: str = 'json', filename_prefix: str = 'analysis') -> str:
        """
        Export the analysis results in the specified format.
        
        Args:
            format (str): The format to export to (json, txt, html, csv)
            filename_prefix (str): The prefix for the exported file
            
        Returns:
            str: The path to the exported file
        """
        if self.last_analysis is None:
            raise ValueError("No analysis results to export. Run analyze_comprehensive first.")
            
        # Find the export directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.export_dir = os.path.join(script_dir, 'analysis_exports')
        os.makedirs(self.export_dir, exist_ok=True)
        
        # Generate file path
        export_path = os.path.join(self.export_dir, f"{filename_prefix}_analysis.{format}")
        
        if format == 'json':
            with open(export_path, 'w') as f:
                json.dump(self.last_analysis, f, indent=2, default=self._json_serializer)
                
        elif format == 'txt':
            self._export_txt(export_path)
            
        elif format == 'html':
            self._export_html(export_path)
            
        elif format == 'csv':
            self._export_csv(export_path)
            
        else:
            raise ValueError(f"Unsupported export format: {format}")
            
        return export_path
    
    def _json_serializer(self, obj):
        """JSON serializer for numpy types."""
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, (np.float32, np.float64)):
            return float(obj)
        if isinstance(obj, (np.int32, np.int64)):
            return int(obj)
        return str(obj)
    
    def _export_txt(self, export_path: str):
        """Export analysis results to text format."""
        with open(export_path, 'w') as f:
            f.write("ENHANCED AUDIO ANALYSIS RESULTS\n")
            f.write("=" * 40 + "\n\n")
            
            for section, data in self.last_analysis.items():
                f.write(f"{section.upper().replace('_', ' ')}\n")
                f.write("-" * len(section) + "\n")
                
                if isinstance(data, dict):
                    self._write_dict_to_txt(f, data, indent=0)
                else:
                    f.write(f"{data}\n")
                f.write("\n")
    
    def _write_dict_to_txt(self, f, data: dict, indent: int = 0):
        """Helper method to write nested dictionaries to text file."""
        indent_str = "  " * indent
        for key, value in data.items():
            if isinstance(value, dict):
                f.write(f"{indent_str}{key}:\n")
                self._write_dict_to_txt(f, value, indent + 1)
            elif isinstance(value, list):
                if len(value) <= 10:  # Show small lists
                    f.write(f"{indent_str}{key}: {value}\n")
                else:  # Summarize large lists
                    f.write(f"{indent_str}{key}: [{len(value)} items] {value[:3]}...\n")
            else:
                f.write(f"{indent_str}{key}: {value}\n")
    
    def _export_html(self, export_path: str):
        """Export analysis results to HTML format."""
        with open(export_path, 'w') as f:
            f.write("""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Enhanced Audio Analysis Results</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; border-bottom: 2px solid #333; }
                    h2 { color: #666; border-bottom: 1px solid #666; }
                    table { border-collapse: collapse; width: 100%; margin: 10px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .nested { margin-left: 20px; }
                </style>
            </head>
            <body>
            """)
            
            f.write("<h1>Enhanced Audio Analysis Results</h1>")
            
            for section, data in self.last_analysis.items():
                f.write(f"<h2>{section.title().replace('_', ' ')}</h2>")
                
                if isinstance(data, dict):
                    f.write("<table>")
                    self._write_dict_to_html(f, data)
                    f.write("</table>")
                else:
                    f.write(f"<p>{data}</p>")
            
            f.write("</body></html>")
    
    def _write_dict_to_html(self, f, data: dict, nested: bool = False):
        """Helper method to write nested dictionaries to HTML table."""
        for key, value in data.items():
            if isinstance(value, dict):
                f.write(f"<tr><td colspan='2'><strong>{key.replace('_', ' ').title()}</strong></td></tr>")
                self._write_dict_to_html(f, value, True)
            elif isinstance(value, list):
                if len(value) <= 10:
                    f.write(f"<tr><td>{key.replace('_', ' ').title()}</td><td>{value}</td></tr>")
                else:
                    f.write(f"<tr><td>{key.replace('_', ' ').title()}</td><td>[{len(value)} items] {value[:3]}...</td></tr>")
            else:
                f.write(f"<tr><td>{key.replace('_', ' ').title()}</td><td>{value}</td></tr>")
    
    def _export_csv(self, export_path: str):
        """Export analysis results to CSV format."""
        import csv
        
        with open(export_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Section', 'Feature', 'Value'])
            
            for section, data in self.last_analysis.items():
                if isinstance(data, dict):
                    self._write_dict_to_csv(writer, data, section)
                else:
                    writer.writerow([section, '', str(data)])
    
    def _write_dict_to_csv(self, writer, data: dict, section: str, prefix: str = ''):
        """Helper method to write nested dictionaries to CSV."""
        for key, value in data.items():
            full_key = f"{prefix}.{key}" if prefix else key
            if isinstance(value, dict):
                self._write_dict_to_csv(writer, value, section, full_key)
            elif isinstance(value, list):
                if len(value) <= 5:  # Only show small lists in CSV
                    writer.writerow([section, full_key, str(value)])
                else:
                    writer.writerow([section, full_key, f"[{len(value)} items]"])
            else:
                writer.writerow([section, full_key, str(value)])
