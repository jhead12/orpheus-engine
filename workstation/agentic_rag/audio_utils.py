"""
Audio processing utilities for the RAG pipeline
"""

import librosa
import numpy as np
from typing import Dict, List
import soundfile as sf

class AudioProcessor:
    def __init__(self):
        self.sample_rate = 44100
        
    async def extract_features(self, audio_path: str) -> Dict:
        """Extract audio features using librosa"""
        y, sr = librosa.load(audio_path, sr=self.sample_rate)
        
        # Extract features
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        spectral = librosa.feature.spectral_contrast(y=y, sr=sr)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        
        return {
            'mfcc': mfcc,
            'spectral': spectral,
            'chroma': chroma
        }
    
    async def analyze(self, audio_path: str) -> Dict:
        """Perform detailed audio analysis"""
        y, sr = librosa.load(audio_path, sr=self.sample_rate)
        
        return {
            'duration': librosa.get_duration(y=y, sr=sr),
            'tempo': librosa.beat.tempo(y=y, sr=sr)[0],
            'beats': librosa.beat.beat_track(y=y, sr=sr)[1].tolist(),
            'onset_env': librosa.onset.onset_strength(y=y, sr=sr).tolist()
        }
        
    def compute_embedding(self, features: Dict) -> np.ndarray:
        """Compute embedding from audio features"""
        # Combine features into a single embedding
        mfcc_mean = np.mean(features['mfcc'], axis=1)
        spectral_mean = np.mean(features['spectral'], axis=1)
        chroma_mean = np.mean(features['chroma'], axis=1)
        
        return np.concatenate([mfcc_mean, spectral_mean, chroma_mean])
