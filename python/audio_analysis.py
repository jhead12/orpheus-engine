import numpy as np
import librosa
import scipy.stats
from typing import Dict, Any

def analyze_audio(audio_data: np.ndarray, 
                 sample_rate: int, 
                 params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Perform advanced audio analysis using scientific computing libraries
    """
    # Convert to mono if needed
    if len(audio_data.shape) > 1:
        audio_data = np.mean(audio_data, axis=1)
    
    # Compute features
    mfcc = librosa.feature.mfcc(
        y=audio_data, 
        sr=sample_rate,
        n_mfcc=20,
        n_fft=params['windowSize'],
        hop_length=params['hopLength']
    )
    
    spectral_contrast = librosa.feature.spectral_contrast(
        y=audio_data,
        sr=sample_rate,
        n_fft=params['windowSize']
    )
    
    chromagram = librosa.feature.chroma_cqt(
        y=audio_data,
        sr=sample_rate,
        hop_length=params['hopLength']
    )
    
    # Compute statistics
    statistics = {
        'mfcc_stats': {
            'mean': np.mean(mfcc, axis=1),
            'std': np.std(mfcc, axis=1),
            'skew': scipy.stats.skew(mfcc, axis=1),
            'kurtosis': scipy.stats.kurtosis(mfcc, axis=1)
        },
        'spectral_flatness': librosa.feature.spectral_flatness(
            y=audio_data,
            n_fft=params['windowSize']
        ),
        'onset_strength': librosa.onset.onset_strength(
            y=audio_data,
            sr=sample_rate
        )
    }
    
    return {
        'features': {
            'mfcc': mfcc.tolist(),
            'spectral_contrast': spectral_contrast.tolist(),
            'chromagram': chromagram.tolist(),
        },
        'statistics': statistics,
        'raw_data': audio_data.tobytes(),
        'parameters': params
    }
