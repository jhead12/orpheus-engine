#!/usr/bin/env python3
"""
Test script for judge evaluation requirements
This ensures all dependencies for the Professional Audio Analysis notebook are working
"""

import sys
import subprocess
import importlib

def test_import(package_name, display_name=None):
    """Test if a package can be imported"""
    if display_name is None:
        display_name = package_name
    
    try:
        module = importlib.import_module(package_name)
        version = getattr(module, '__version__', 'Unknown')
        print(f"✅ {display_name}: {version}")
        return True
    except ImportError as e:
        print(f"❌ {display_name}: Failed to import - {e}")
        return False

def main():
    print("🎚️ Orpheus Engine - Judge Evaluation Requirements Test")
    print("=" * 60)
    
    required_packages = [
        ('numpy', 'NumPy'),
        ('pandas', 'Pandas'),
        ('matplotlib', 'Matplotlib'),
        ('librosa', 'Librosa'),
        ('seaborn', 'Seaborn'),
        ('scipy', 'SciPy'),
        ('sklearn', 'Scikit-learn'),
        ('mlflow', 'MLFlow'),
        ('plotly', 'Plotly'),
        ('pyloudnorm', 'PyLoudnorm'),
    ]
    
    optional_packages = [
        ('ipywidgets', 'IPython Widgets'),
        ('jupyter', 'Jupyter'),
    ]
    
    print("\n📦 Testing Required Packages:")
    all_required = True
    for package, name in required_packages:
        if not test_import(package, name):
            all_required = False
    
    print("\n📦 Testing Optional Packages:")
    for package, name in optional_packages:
        test_import(package, name)
    
    print("\n" + "=" * 60)
    if all_required:
        print("🎉 All required packages are available!")
        print("📊 Judge evaluation notebook is ready to run.")
        
        # Test a simple audio analysis operation
        try:
            import librosa
            import numpy as np
            
            # Generate a test signal
            sample_rate = 22050
            duration = 1.0
            frequency = 440.0  # A4 note
            
            t = np.linspace(0, duration, int(sample_rate * duration))
            test_signal = 0.5 * np.sin(2 * np.pi * frequency * t)
            
            # Test basic librosa functionality
            mfcc = librosa.feature.mfcc(y=test_signal, sr=sample_rate, n_mfcc=13)
            spectral_centroids = librosa.feature.spectral_centroid(y=test_signal, sr=sample_rate)
            
            print(f"🔊 Test Audio Analysis:")
            print(f"   - Signal length: {len(test_signal)} samples")
            print(f"   - MFCC shape: {mfcc.shape}")
            print(f"   - Spectral centroid mean: {spectral_centroids.mean():.2f} Hz")
            
        except Exception as e:
            print(f"⚠️  Audio analysis test failed: {e}")
            
    else:
        print("❌ Some required packages are missing!")
        print("   Run: pip install -r requirements.txt")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
