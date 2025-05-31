#!/usr/bin/env python3
# Simple Flask server for development
"""
Orpheus Engine Workstation Backend

This module provides audio analysis services for the Orpheus Engine Workstation.

Dependencies:
    - flask: Web framework for the API
    - flask-cors: Cross-Origin Resource Sharing support
    - librosa: Audio analysis library
    - numpy: Numerical computing library

Installation:
    pip install -r requirements.txt
"""

import sys
import os
import json
import subprocess
import importlib.util

# Configure Python path for modules
def ensure_dependencies():
    """Ensure required packages are installed and properly configured in Python path"""
    required_packages = ["flask", "flask_cors", "librosa", "numpy"]
    missing_packages = []
    
    # Check if packages are available
    for package in required_packages:
        if importlib.util.find_spec(package) is None:
            missing_packages.append(package)
    
    # Install missing packages if running in development mode
    if missing_packages and os.environ.get('DEVELOPMENT', 'false').lower() == 'true':
        print(f"Missing packages: {', '.join(missing_packages)}")
        print("Attempting to install missing packages...")
        
        requirements_path = os.path.join(os.path.dirname(__file__), "requirements.txt")
        if os.path.exists(requirements_path):
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", requirements_path])
                print("Successfully installed required packages")
            except subprocess.CalledProcessError:
                print("Failed to install packages. Please run 'pip install -r requirements.txt' manually")
                sys.exit(1)
        else:
            print(f"Requirements file not found at: {requirements_path}")
            print("Please install the required packages manually")
            sys.exit(1)
    elif missing_packages:
        print(f"Missing packages: {', '.join(missing_packages)}")
        print("Please install these packages using: pip install -r requirements.txt")
        sys.exit(1)

# Try to find and add site-packages to path if needed
try:
    import site
    site_packages = site.getsitepackages()
    for site_pkg in site_packages:
        if site_pkg not in sys.path:
            sys.path.append(site_pkg)
    print("Site packages directories added to Python path")
except Exception as e:
    print(f"Warning: Could not add site-packages directories: {e}")

# Ensure dependencies are installed and available
ensure_dependencies()

# Now import dependencies
try:
    from flask import Flask, jsonify, request, send_file
    from flask_cors import CORS
    import librosa
    import numpy as np
except ImportError as e:
    print(f"ERROR: Failed to import required packages: {e}")
    print("Please make sure all dependencies are installed: pip install -r requirements.txt")
    sys.exit(1)

# Configure the Python path to find the audio_analysis module
python_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'python')
if os.path.exists(python_dir):
    sys.path.append(python_dir)
    print(f"Added Python directory to path: {python_dir}")

# Create the audio_analysis module if it doesn't exist
audio_analysis_file = os.path.join(python_dir, 'audio_analysis.py')
if not os.path.exists(audio_analysis_file):
    # Create the directory first if needed
    os.makedirs(os.path.dirname(audio_analysis_file), exist_ok=True)
    
    print(f"Creating audio_analysis.py module at: {audio_analysis_file}")
    with open(audio_analysis_file, 'w') as f:
        f.write("""#!/usr/bin/env python3
\"\"\"
Audio Analysis Module for Orpheus Engine

This module provides audio analysis functionality for the Orpheus Engine Workstation.
\"\"\"

import os
import json
import sys
import numpy as np
import librosa
import librosa.display

class AudioAnalyzer:
    \"\"\"
    Analyzes audio data and extracts features and characteristics.
    \"\"\"
    
    def __init__(self, sample_rate=44100):
        \"\"\"
        Initialize the AudioAnalyzer.
        
        Args:
            sample_rate (int): The sample rate of the audio to analyze.
        \"\"\"
        self.sample_rate = sample_rate
        self.last_analysis = None
        self.export_dir = None
    
    def analyze_audio(self, audio_data, analysis_types=None):
        \"\"\"
        Analyze the provided audio data.
        
        Args:
            audio_data (np.ndarray): The audio data to analyze.
            analysis_types (list): Types of analysis to perform.
            
        Returns:
            dict: The analysis results.
        \"\"\"
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
        \"\"\"
        Export the analysis results in the specified format.
        
        Args:
            format (str): The format to export to (json, txt, html).
            filename_prefix (str): The prefix for the exported file.
            
        Returns:
            str: The path to the exported file.
        \"\"\"
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
                f.write("Audio Analysis Results\\n")
                f.write("=====================\\n\\n")
                
                for section, data in self.last_analysis.items():
                    f.write(f"{section.upper()}\\n")
                    f.write("-" * len(section) + "\\n")
                    
                    if isinstance(data, dict):
                        for key, value in data.items():
                            f.write(f"{key}: {value}\\n")
                    else:
                        f.write(f"{data}\\n")
                    f.write("\\n")
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
""")

# Import the audio_analysis module
try:
    from audio_analysis import AudioAnalyzer
except ImportError as e:
    print(f"Error importing AudioAnalyzer: {e}")
    # Define a simple AudioAnalyzer class as fallback
    class AudioAnalyzer:
        def __init__(self, sample_rate=44100):
            self.sample_rate = sample_rate
            
        def analyze_audio(self, audio_data, analysis_types=None):
            return {
                "message": "AudioAnalyzer could not be imported.",
                "analysis_types": analysis_types,
                "audio_length": len(audio_data),
                "sample_rate": self.sample_rate
            }
            
        def export_analysis(self, format='json', filename_prefix='analysis'):
            # Define export directory
            export_dir = os.path.join(os.path.dirname(__file__), 'analysis_exports')
            os.makedirs(export_dir, exist_ok=True)
            export_path = os.path.join(export_dir, f"{filename_prefix}.{format}")
            with open(export_path, 'w') as f:
                f.write("Placeholder analysis output")
            return export_path

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.float32):
            return float(obj)
        if isinstance(obj, np.float64):
            return float(obj)
        return super(NumpyEncoder, self).default(obj)

app = Flask(__name__)
CORS(app)
app.json_encoder = NumpyEncoder

# Create exports directory if it doesn't exist
EXPORT_DIR = os.path.join(os.path.dirname(__file__), 'analysis_exports')
if not os.path.exists(EXPORT_DIR):
    os.makedirs(EXPORT_DIR)

@app.route('/')
def hello_world():
    return jsonify({"status": "ok", "message": "Orpheus Engine Backend is running"})

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        # Get analysis types from request
        analysis_types = request.form.get('analysis_types', 'spectral,dynamics,musical,technical,recording').split(',')
        
        # Save uploaded file temporarily
        temp_path = os.path.join(EXPORT_DIR, 'temp_' + file.filename)
        file.save(temp_path)
        
        try:
            # Load and analyze audio
            audio_data, sr = librosa.load(temp_path)
            analyzer = AudioAnalyzer(sample_rate=sr)
            
            # Run analysis
            results = analyzer.analyze_audio(
                audio_data=audio_data,
                analysis_types=analysis_types
            )
            
            # Export in all formats
            filename_prefix = os.path.splitext(file.filename)[0]
            exports = {}
            for format in ['txt', 'json', 'html']:
                path = analyzer.export_analysis(format=format, filename_prefix=filename_prefix)
                exports[format] = os.path.basename(path)
            
            return jsonify({
                "status": "success",
                "message": "Analysis completed successfully",
                "results": results,
                "exports": exports
            })
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/exports/<filename>')
def get_export(filename):
    try:
        return send_file(
            os.path.join(EXPORT_DIR, filename),
            as_attachment=True
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 404

if __name__ == '__main__':
    import os
    port = int(os.environ.get('BACKEND_PORT', 5001))
    debug = os.environ.get('DEVELOPMENT', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
