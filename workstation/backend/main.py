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
    - graphene: GraphQL framework for Python
    - flask-graphql: GraphQL integration for Flask

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

# Import the enhanced audio analyzer
try:
    from audio_analyzer import EnhancedAudioAnalyzer as AudioAnalyzer
    print("Successfully imported EnhancedAudioAnalyzer")
except ImportError as e:
    print(f"Error importing EnhancedAudioAnalyzer: {e}")
    # Try to import from the basic audio_analysis module
    try:
        from audio_analysis import AudioAnalyzer
        print("Using basic AudioAnalyzer as fallback")
    except ImportError as e2:
        print(f"Error importing basic AudioAnalyzer: {e2}")
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

# Register GraphQL Blueprint
try:
    import sys
    import os
    # Add project root directory to path for proper imports
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    
    # Use local import with renamed directory
    from graphql_api.views import graphql_blueprint
    app.register_blueprint(graphql_blueprint, url_prefix='/api')
    print("GraphQL API registered at /api/graphql")
except ImportError as e:
    print(f"Failed to load GraphQL API: {e}")
    print("GraphQL API not available - install graphene and flask-graphql to enable")

@app.route('/')
def hello_world():
    return jsonify({"status": "ok", "message": "Orpheus Engine Backend is running"})

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/api/info')
def api_info():
    """Get information about available API endpoints and features"""
    return jsonify({
        "api_version": "2.0",
        "service": "Orpheus Engine Enhanced Audio Analysis Backend",
        "endpoints": {
            "/": "Basic status check",
            "/health": "Health check endpoint",
            "/api/info": "This endpoint - API documentation",
            "/analyze": "Enhanced audio analysis with multiple analysis types",
            "/analyze/similarity": "Compare two audio files for similarity",
            "/analyze/batch": "Batch analysis of multiple audio files",
            "/analyze/realtime": "Real-time audio analysis for streaming",
            "/analyze/fingerprint": "Generate audio fingerprint for similarity matching",
            "/analyze/visualize": "Generate visualization data (spectrogram, waveform, chromagram)",
            "/exports/<filename>": "Download analysis export files"
        },
        "analysis_types": {
            "spectral": "MFCC, spectral centroid, rolloff, bandwidth, contrast, zero crossing rate",
            "rhythm": "Tempo detection, beat tracking, onset detection, rhythm stability",
            "harmonic": "Chroma features, harmonic/percussive separation, tonnetz",
            "dynamics": "RMS energy, dynamic range, peak analysis, loudness estimation",
            "quality": "SNR estimation, clipping detection, frequency response analysis",
            "fingerprint": "Audio fingerprinting for similarity analysis"
        },
        "export_formats": ["json", "txt", "html", "csv"],
        "visualization_types": ["spectrogram", "waveform", "chromagram"],
        "features": [
            "Enhanced spectral analysis with MFCC features",
            "Advanced rhythm and tempo detection",
            "Harmonic content analysis",
            "Audio quality assessment",
            "Similarity comparison between audio files",
            "Batch processing capabilities",
            "Real-time analysis support",
            "Multiple export formats",
            "Audio visualization data generation",
            "Audio fingerprinting for matching"
        ]
    })

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        # Get analysis types from request (enhanced options)
        analysis_types = request.form.get('analysis_types', 'spectral,rhythm,harmonic,dynamics').split(',')
        
        # Get export formats
        export_formats = request.form.get('export_formats', 'json,txt').split(',')
        
        # Save uploaded file temporarily
        temp_path = os.path.join(EXPORT_DIR, 'temp_' + file.filename)
        file.save(temp_path)
        
        try:
            # Load and analyze audio
            audio_data, sr = librosa.load(temp_path)
            analyzer = AudioAnalyzer(sample_rate=sr)
            
            # Run enhanced analysis
            results = analyzer.analyze_audio(
                audio_data=audio_data,
                analysis_types=analysis_types
            )
            
            # Export in requested formats
            filename_prefix = os.path.splitext(file.filename)[0]
            exports = {}
            
            for format in export_formats:
                if format in ['txt', 'json', 'html', 'csv']:
                    try:
                        path = analyzer.export_analysis(format=format, filename_prefix=filename_prefix)
                        exports[format] = os.path.basename(path)
                    except Exception as e:
                        exports[format] = f"Error: {str(e)}"
            
            # Generate fingerprint for future similarity comparisons
            fingerprint = None
            try:
                fingerprint = analyzer.generate_fingerprint(audio_data, sr)
                fingerprint_filename = f"{filename_prefix}_fingerprint.json"
                fingerprint_path = os.path.join(EXPORT_DIR, fingerprint_filename)
                
                with open(fingerprint_path, 'w') as f:
                    json.dump(fingerprint, f, cls=NumpyEncoder, indent=2)
                exports['fingerprint'] = fingerprint_filename
            except Exception as e:
                print(f"Warning: Could not generate fingerprint: {e}")
            
            return jsonify({
                "status": "success",
                "message": "Enhanced analysis completed successfully",
                "results": results,
                "exports": exports,
                "analysis_types": analysis_types,
                "features_extracted": len(results.keys()) if isinstance(results, dict) else 0
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

@app.route('/analyze/similarity', methods=['POST'])
def analyze_similarity():
    """Compare two audio files for similarity"""
    try:
        # Check if both files were uploaded
        if 'file1' not in request.files or 'file2' not in request.files:
            return jsonify({"error": "Two files must be provided (file1 and file2)"}), 400
        
        file1 = request.files['file1']
        file2 = request.files['file2']
        
        if file1.filename == '' or file2.filename == '':
            return jsonify({"error": "Both files must be selected"}), 400
        
        # Save uploaded files temporarily
        temp_path1 = os.path.join(EXPORT_DIR, 'temp1_' + file1.filename)
        temp_path2 = os.path.join(EXPORT_DIR, 'temp2_' + file2.filename)
        file1.save(temp_path1)
        file2.save(temp_path2)
        
        try:
            # Load and analyze both audio files
            audio1, sr1 = librosa.load(temp_path1)
            audio2, sr2 = librosa.load(temp_path2)
            
            analyzer = AudioAnalyzer()
            
            # Generate fingerprints for both files
            fingerprint1 = analyzer.generate_fingerprint(audio1, sr1)
            fingerprint2 = analyzer.generate_fingerprint(audio2, sr2)
            
            # Calculate similarity
            similarity = analyzer.compare_fingerprints(fingerprint1, fingerprint2)
            
            return jsonify({
                "status": "success",
                "similarity": float(similarity),
                "file1": file1.filename,
                "file2": file2.filename,
                "message": f"Similarity analysis completed. Files are {similarity*100:.1f}% similar."
            })
            
        finally:
            # Clean up temp files
            for temp_path in [temp_path1, temp_path2]:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/analyze/batch', methods=['POST'])
def analyze_batch():
    """Analyze multiple audio files in batch"""
    try:
        # Check if files were uploaded
        if 'files' not in request.files:
            return jsonify({"error": "No files provided"}), 400
        
        files = request.files.getlist('files')
        if not files or all(f.filename == '' for f in files):
            return jsonify({"error": "No files selected"}), 400
        
        # Get analysis types from request
        analysis_types = request.form.get('analysis_types', 'spectral,rhythm,harmonic').split(',')
        
        results = []
        
        for file in files:
            if file.filename == '':
                continue
                
            # Save uploaded file temporarily
            temp_path = os.path.join(EXPORT_DIR, 'temp_batch_' + file.filename)
            file.save(temp_path)
            
            try:
                # Load and analyze audio
                audio_data, sr = librosa.load(temp_path)
                analyzer = AudioAnalyzer(sample_rate=sr)
                
                # Run analysis
                analysis = analyzer.analyze_audio(
                    audio_data=audio_data,
                    analysis_types=analysis_types
                )
                
                results.append({
                    "filename": file.filename,
                    "status": "success",
                    "analysis": analysis
                })
                
            except Exception as e:
                results.append({
                    "filename": file.filename,
                    "status": "error",
                    "error": str(e)
                })
                
            finally:
                # Clean up temp file
                if os.path.exists(temp_path):
                    os.remove(temp_path)
        
        return jsonify({
            "status": "success",
            "message": f"Batch analysis completed for {len(results)} files",
            "results": results
        })
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@app.route('/analyze/realtime', methods=['POST'])
def analyze_realtime():
    """Analyze audio data in real-time (for streaming applications)"""
    try:
        # Get analysis parameters
        chunk_size = int(request.form.get('chunk_size', 1024))
        sample_rate = int(request.form.get('sample_rate', 44100))
        analysis_types = request.form.get('analysis_types', 'spectral,dynamics').split(',')
        
        # Check if audio data was provided
        if 'audio_data' not in request.files:
            return jsonify({"error": "No audio data provided"}), 400
        
        file = request.files['audio_data']
        
        # Save and load audio data
        temp_path = os.path.join(EXPORT_DIR, 'temp_realtime.wav')
        file.save(temp_path)
        
        try:
            audio_data, sr = librosa.load(temp_path, sr=sample_rate)
            analyzer = AudioAnalyzer(sample_rate=sr)
            
            # Perform lightweight analysis suitable for real-time
            results = {}
            
            if 'spectral' in analysis_types:
                spectral_centroid = librosa.feature.spectral_centroid(y=audio_data, sr=sr)[0]
                results['spectral_centroid'] = float(np.mean(spectral_centroid))
                
            if 'dynamics' in analysis_types:
                rms = librosa.feature.rms(y=audio_data)[0]
                results['rms_energy'] = float(np.mean(rms))
                results['peak_amplitude'] = float(np.max(np.abs(audio_data)))
            
            if 'rhythm' in analysis_types:
                tempo, _ = librosa.beat.beat_track(y=audio_data, sr=sr)
                results['tempo'] = float(tempo)
            
            return jsonify({
                "status": "success",
                "message": "Real-time analysis completed",
                "results": results,
                "chunk_size": chunk_size,
                "sample_rate": sample_rate
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

@app.route('/analyze/fingerprint', methods=['POST'])
def generate_fingerprint():
    """Generate audio fingerprint for similarity matching"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save uploaded file temporarily
        temp_path = os.path.join(EXPORT_DIR, 'temp_fingerprint_' + file.filename)
        file.save(temp_path)
        
        try:
            # Load and analyze audio
            audio_data, sr = librosa.load(temp_path)
            analyzer = AudioAnalyzer(sample_rate=sr)
            
            # Generate fingerprint
            fingerprint = analyzer.generate_fingerprint(audio_data, sr)
            
            # Save fingerprint for future comparisons
            fingerprint_filename = f"{os.path.splitext(file.filename)[0]}_fingerprint.json"
            fingerprint_path = os.path.join(EXPORT_DIR, fingerprint_filename)
            
            with open(fingerprint_path, 'w') as f:
                json.dump(fingerprint, f, cls=NumpyEncoder, indent=2)
            
            return jsonify({
                "status": "success",
                "message": "Fingerprint generated successfully",
                "filename": file.filename,
                "fingerprint": fingerprint,
                "fingerprint_file": fingerprint_filename
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

@app.route('/analyze/visualize', methods=['POST'])
def generate_visualization():
    """Generate audio visualization data (spectrogram, waveform, etc.)"""
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Get visualization type
        viz_type = request.form.get('type', 'spectrogram')
        
        # Save uploaded file temporarily
        temp_path = os.path.join(EXPORT_DIR, 'temp_viz_' + file.filename)
        file.save(temp_path)
        
        try:
            # Load audio
            audio_data, sr = librosa.load(temp_path)
            
            results = {}
            
            if viz_type == 'spectrogram':
                # Generate spectrogram
                stft = librosa.stft(audio_data)
                spectrogram = np.abs(stft)
                results['spectrogram'] = spectrogram.tolist()
                results['frequencies'] = librosa.fft_frequencies(sr=sr).tolist()
                results['times'] = librosa.frames_to_time(np.arange(spectrogram.shape[1]), sr=sr).tolist()
                
            elif viz_type == 'waveform':
                # Generate waveform data
                results['waveform'] = audio_data.tolist()
                results['time'] = np.linspace(0, len(audio_data)/sr, len(audio_data)).tolist()
                
            elif viz_type == 'chromagram':
                # Generate chromagram
                chroma = librosa.feature.chroma_stft(y=audio_data, sr=sr)
                results['chromagram'] = chroma.tolist()
                results['pitch_classes'] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
                results['times'] = librosa.frames_to_time(np.arange(chroma.shape[1]), sr=sr).tolist()
            
            return jsonify({
                "status": "success",
                "message": f"{viz_type.title()} generated successfully",
                "visualization_type": viz_type,
                "data": results
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

if __name__ == '__main__':
    import os
    
    # Get port configuration from environment
    port = int(os.environ.get('BACKEND_PORT', 5001))
    debug = os.environ.get('DEVELOPMENT', 'false').lower() == 'true'
    
    # Initialize plugin system
    try:
        from graphql_api.plugins import plugin_manager
        print(f"✓ Plugin system initialized. Next available port: {plugin_manager.next_port}")
    except ImportError:
        print("⚠ Plugin system not available")
    
    # Add plugin status endpoint
    @app.route('/api/system/status')
    def system_status():
        """Get system and plugin status"""
        try:
            from graphql_api.plugins import plugin_manager
            plugins = plugin_manager.list_plugins()
            
            return jsonify({
                "status": "running",
                "backend_port": port,
                "plugin_count": len(plugins),
                "next_plugin_port": plugin_manager.next_port,
                "plugins": [
                    {
                        "id": p.get('id'),
                        "name": p.get('name'),
                        "status": p.get('status'),
                        "port": p.get('backend_port')
                    } for p in plugins
                ]
            })
        except Exception as e:
            return jsonify({
                "status": "running",
                "backend_port": port,
                "plugin_system": "unavailable",
                "error": str(e)
            })
    
    print(f"🚀 Starting Orpheus Engine Backend on port {port}")
    if debug:
        print("🔧 Debug mode enabled")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
