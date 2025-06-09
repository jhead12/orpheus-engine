#!/usr/bin/env python3
"""
Orpheus Engine Demo Launcher
HP AI Studio Compatible Judge Evaluation Platform

This script provides an interactive launcher for the Orpheus Engine demo notebooks
and supporting services, designed for competition judges and HP AI Studio integration.
"""

import os
import sys
import subprocess
import time
import webbrowser
import json
from pathlib import Path
from datetime import datetime

def check_hp_ai_studio_compatibility():
    """Check if the environment is compatible with HP AI Studio Project Manager."""
    print("🔍 HP AI Studio Compatibility Check")
    print("=" * 40)
    
    compatible = True
    
    # Check Python version
    python_version = sys.version_info
    if python_version >= (3, 8):
        print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    else:
        print(f"❌ Python {python_version.major}.{python_version.minor} (requires 3.8+)")
        compatible = False
    
    # Check critical packages
    try:
        import mlflow
        if mlflow.__version__ == "2.15.0":
            print(f"✅ MLflow {mlflow.__version__} (Project Manager Compatible)")
        else:
            print(f"⚠️ MLflow {mlflow.__version__} (Project Manager requires 2.15.0)")
            compatible = False
    except ImportError:
        print("❌ MLflow not installed")
        compatible = False
    
    # Check audio processing libraries
    audio_libs = []
    try:
        import librosa
        audio_libs.append(f"librosa {librosa.__version__}")
    except ImportError:
        audio_libs.append("librosa (missing)")
        compatible = False
    
    try:
        import pyloudnorm
        audio_libs.append("pyloudnorm")
    except ImportError:
        audio_libs.append("pyloudnorm (missing)")
        compatible = False
    
    try:
        import soundfile
        audio_libs.append("soundfile")
    except ImportError:
        audio_libs.append("soundfile (missing)")
        compatible = False
    
    try:
        import plotly
        audio_libs.append(f"plotly {plotly.__version__}")
    except ImportError:
        audio_libs.append("plotly (missing)")
        compatible = False
    
    if audio_libs:
        print(f"🎵 Audio Libraries: {', '.join(audio_libs)}")
    
    print(f"\n🏢 HP AI Studio Compatible: {'✅' if compatible else '❌'}")
    
    if not compatible:
        print("\n💡 To fix compatibility issues:")
        print("   pip install -r requirements.txt")
        print("   This ensures MLflow 2.15.0 and all dependencies")
    
    return compatible

def setup_demo_environment():
    """Set up the demo environment and directories."""
    demo_dir = Path(__file__).parent
    mlflow_runs_dir = demo_dir / "mlflow_runs"
    artifacts_dir = demo_dir / "artifacts"
    tensorboard_logs_dir = demo_dir / "tensorboard_logs"
    
    # Create directories
    mlflow_runs_dir.mkdir(exist_ok=True)
    artifacts_dir.mkdir(exist_ok=True)
    tensorboard_logs_dir.mkdir(exist_ok=True)
    
    # Set environment variables for HP AI Studio compatibility
    os.environ["MLFLOW_TRACKING_URI"] = f"file://{mlflow_runs_dir}"
    os.environ["MLFLOW_DEFAULT_ARTIFACT_ROOT"] = f"file://{artifacts_dir}"
    os.environ["TENSORBOARD_LOG_DIR"] = f"{tensorboard_logs_dir}"
    
    print(f"📁 Demo Directory: {demo_dir}")
    print(f"📁 MLflow Tracking: {mlflow_runs_dir}")
    print(f"📁 Artifacts: {artifacts_dir}")
    
    return demo_dir, mlflow_runs_dir, artifacts_dir

def start_mlflow_server(mlflow_runs_dir, port=5000):
    """Start MLflow tracking server with HP AI Studio compatibility."""
    cmd = [
        sys.executable, "-m", "mlflow", "server",
        "--backend-store-uri", f"file://{mlflow_runs_dir}",
        "--default-artifact-root", f"file://{mlflow_runs_dir}/artifacts",
        "--host", "0.0.0.0",
        "--port", str(port)
    ]
    
    print(f"🚀 Starting MLflow server on port {port}...")
    print(f"   Command: {' '.join(cmd)}")
    
    try:
        process = subprocess.Popen(
            cmd, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Give the server time to start
        time.sleep(4)
        
        # Check if the process is still running
        if process.poll() is None:
            print(f"✅ MLflow server started successfully!")
            print(f"📊 MLflow UI: http://localhost:{port}")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Failed to start MLflow server")
            if stdout:
                print(f"STDOUT: {stdout}")
            if stderr:
                print(f"STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting MLflow server: {e}")
        return None

def start_tensorboard_server(tensorboard_logs_dir, port=6006):
    """Start TensorBoard server for real-time monitoring."""
    
    # Check if TensorBoard is available
    try:
        import tensorboard
        print(f"🔍 TensorBoard version: {tensorboard.__version__}")
    except ImportError:
        print("⚠️ TensorBoard not installed. Will attempt to install...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "tensorboard>=2.15.0"], 
                          check=True)
            print("✅ TensorBoard installed successfully!")
        except subprocess.CalledProcessError:
            print("❌ Failed to install TensorBoard")
            return None
    
    cmd = [
        sys.executable, "-m", "tensorboard.main", "serve",
        "--logdir", str(tensorboard_logs_dir),
        "--host", "0.0.0.0",
        "--port", str(port),
        "--reload_interval", "1"
    ]
    
    print(f"🚀 Starting TensorBoard server on port {port}...")
    print(f"   Log Directory: {tensorboard_logs_dir}")
    
    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Give TensorBoard time to start
        time.sleep(4)
        
        if process.poll() is None:
            print(f"✅ TensorBoard server started successfully!")
            print(f"📊 TensorBoard UI: http://localhost:{port}")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Failed to start TensorBoard server")
            if stderr:
                print(f"STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting TensorBoard server: {e}")
        return None

def start_jupyter_lab(demo_dir, port=8888):
    """Start Jupyter Lab for the demo notebooks."""
    
    # Check if Jupyter is available
    try:
        subprocess.run([sys.executable, "-m", "jupyter", "--version"], 
                      capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Jupyter not installed. Installing...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", "jupyterlab"], 
                          check=True)
            print("✅ Jupyter Lab installed successfully!")
        except subprocess.CalledProcessError:
            print("❌ Failed to install Jupyter Lab")
            return None
    
    cmd = [
        sys.executable, "-m", "jupyter", "lab",
        "--port", str(port),
        "--ip", "0.0.0.0",
        "--no-browser",
        "--allow-root"
    ]
    
    print(f"🚀 Starting Jupyter Lab on port {port}...")
    
    try:
        process = subprocess.Popen(
            cmd,
            cwd=demo_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Give Jupyter time to start
        time.sleep(5)
        
        if process.poll() is None:
            print(f"✅ Jupyter Lab started successfully!")
            print(f"📓 Jupyter Lab: http://localhost:{port}")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Failed to start Jupyter Lab")
            if stderr:
                print(f"STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error starting Jupyter Lab: {e}")
        return None

def create_demo_status_file(demo_dir):
    """Create a status file with demo information."""
    status = {
        "demo_name": "Orpheus Engine Judge Evaluation Platform",
        "hp_ai_studio_compatible": True,
        "started_at": datetime.now().isoformat(),
        "notebooks": [
            {
                "name": "OrpheusWebDemo.ipynb",
                "description": "Web interface and professional audio analysis",
                "focus": "Competition management and HP AI Studio integration"
            },
            {
                "name": "HP_AI_Studio_Judge_Evaluation_Demo.ipynb", 
                "description": "Complete judge evaluation workflow",
                "focus": "Professional judging and model registry"
            },
            {
                "name": "Orpheus_MLflow_Demo.ipynb",
                "description": "MLflow integration and experiment tracking",
                "focus": "HP AI Studio Project Manager compatibility"
            }
        ],
        "services": {
            "mlflow_ui": "http://localhost:5000",
            "jupyter_lab": "http://localhost:8888"
        },
        "hp_ai_studio": {
            "phoenix_mlflow_path": "/phoenix/mlflow",
            "project_manager_compatible": True,
            "mlflow_version_required": "2.15.0"
        }
    }
    
    status_file = demo_dir / "demo_status.json"
    with open(status_file, 'w') as f:
        json.dump(status, f, indent=2)
    
    print(f"📋 Demo status saved to: {status_file}")
    return status_file

def create_sample_experiment():
    """Create a sample MLflow experiment for demonstration."""
    try:
        import mlflow
        
        # Set up experiment
        experiment_name = "orpheus-judge-evaluation-demo"
        experiment = mlflow.set_experiment(experiment_name)
        
        with mlflow.start_run(run_name="Demo_Audio_Analysis"):
            # Log sample parameters
            mlflow.log_param("demo_mode", "true")
            mlflow.log_param("audio_format", "wav")
            mlflow.log_param("analysis_engine", "orpheus-ai")
            mlflow.log_param("competition", "HP AI Studio")
            mlflow.log_param("demo_type", "judge_evaluation")
            
            # Log sample metrics for demonstration
            mlflow.log_metric("quality_score", 95.5)
            mlflow.log_metric("tempo_bpm", 128.0)
            mlflow.log_metric("energy_level", 0.85)
            mlflow.log_metric("spectral_centroid", 2500.0)
            mlflow.log_metric("zero_crossing_rate", 0.15)
            
            # Create a sample artifact
            sample_report = f"""# Orpheus Judge Evaluation Demo Report

## Competition Information
- Platform: HP AI Studio Project Manager
- Event: Judge Evaluation Demo
- Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Capabilities Demonstrated
- Professional audio analysis and scoring
- Real-time audio quality assessment
- AI-powered genre and style classification
- MLflow experiment tracking and model registry
- HP AI Studio integration

## Technical Features
- Advanced signal processing and spectral analysis
- Machine learning inference pipeline
- Professional audio standards compliance
- Competition-grade evaluation metrics

## Demo Notebooks Available
1. **OrpheusWebDemo.ipynb** - Web interface and professional audio analysis
2. **HP_AI_Studio_Judge_Evaluation_Demo.ipynb** - Complete judge workflow
3. **Orpheus_MLflow_Demo.ipynb** - MLflow integration demonstration

Generated by Orpheus Engine Demo System for HP AI Studio
"""
            
            with open("judge_evaluation_demo_report.md", "w") as f:
                f.write(sample_report)
            
            mlflow.log_artifact("judge_evaluation_demo_report.md")
            os.remove("judge_evaluation_demo_report.md")
            
        print(f"✅ Sample experiment created: {experiment_name}")
        
    except ImportError:
        print("⚠️  MLflow not available for Python integration")
    except Exception as e:
        print(f"⚠️  Could not create sample experiment: {e}")

def display_demo_options():
    """Display available demo options for judges."""
    print("\n📚 Available Judge Evaluation Notebooks:")
    print("=" * 50)
    print("1. 🎵 OrpheusWebDemo.ipynb")
    print("   - Web interface and professional audio analysis")
    print("   - Competition management and HP AI Studio integration")
    print("   - Perfect for interactive judging sessions")
    print()
    print("2. 🏆 HP_AI_Studio_Judge_Evaluation_Demo.ipynb")
    print("   - Complete judge evaluation workflow")
    print("   - Professional judging and model registry")
    print("   - Designed specifically for competition judges")
    print()
    print("3. 📊 Orpheus_MLflow_Demo.ipynb")
    print("   - MLflow integration and experiment tracking")
    print("   - HP AI Studio Project Manager compatibility")
    print("   - Model versioning and evaluation tracking")
    print()
    print("🌐 Access all notebooks at: http://localhost:8888")
    print("📈 MLflow tracking at: http://localhost:5000")
    print("📊 TensorBoard monitoring at: http://localhost:6006")

def main():
    """Main demo startup function."""
    print("🎵 Orpheus Engine Judge Evaluation Platform")
    print("🏢 HP AI Studio Competition Demo")
    print("=" * 60)
    
    # Check HP AI Studio compatibility first
    if not check_hp_ai_studio_compatibility():
        print("\n❌ System not ready for HP AI Studio integration")
        print("💡 Please install requirements: pip install -r requirements.txt")
        sys.exit(1)
    
    print()
    
    # Setup demo environment
    demo_dir, mlruns_dir, artifacts_dir = setup_demo_environment()
    tensorboard_logs_dir = demo_dir / "tensorboard_logs"
    
    # Create demo status file
    create_demo_status_file(demo_dir)
    
    # Create sample experiment for demonstration
    create_sample_experiment()
    
    print()
    
    # Start services with dual platform monitoring
    print("🚀 Starting Unified Monitoring Platform...")
    print("=" * 40)
    
    mlflow_process = start_mlflow_server(mlruns_dir)
    tensorboard_process = start_tensorboard_server(tensorboard_logs_dir)
    jupyter_process = start_jupyter_lab(demo_dir)
    
    if mlflow_process and jupyter_process:
        print("\n🚀 Orpheus Judge Evaluation Platform Ready!")
        print("=" * 50)
        
        # Display demo options
        display_demo_options()
        
        print("\n🎯 Ready for Judge Evaluation!")
        print("Press Ctrl+C to stop all services...")
        
        # Auto-open browser for judges
        try:
            time.sleep(3)
            webbrowser.open("http://localhost:8888")
            time.sleep(2)
            webbrowser.open("http://localhost:5000")
        except:
            pass
        
        try:
            # Keep the script running and monitor services
            while True:
                time.sleep(1)
                
                # Check if processes are still running
                if mlflow_process.poll() is not None:
                    print("❌ MLflow server stopped unexpectedly")
                    break
                    
                if jupyter_process.poll() is not None:
                    print("❌ Jupyter Lab stopped unexpectedly")
                    break
                    
                if tensorboard_process and tensorboard_process.poll() is not None:
                    print("⚠️ TensorBoard server stopped unexpectedly")
                    # Don't break for TensorBoard - it's optional
                    
        except KeyboardInterrupt:
            print("\n🛑 Shutting down Judge Evaluation Platform...")
            
            if mlflow_process:
                mlflow_process.terminate()
                mlflow_process.wait()
                print("✅ MLflow server stopped")
                
            if tensorboard_process:
                tensorboard_process.terminate()
                tensorboard_process.wait()
                print("✅ TensorBoard server stopped")
                
            if jupyter_process:
                jupyter_process.terminate()
                jupyter_process.wait()
                print("✅ Jupyter Lab stopped")
                
            print("👋 Judge Evaluation Platform shutdown complete!")
    else:
        print("❌ Failed to start demo services")
        print("💡 Please check requirements and try again")
        sys.exit(1)

if __name__ == "__main__":
    main()
