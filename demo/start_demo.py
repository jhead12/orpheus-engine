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
    required_libs = ["mlflow", "tensorflow", "notebook", "jupyterlab", "librosa"]
    missing_libs = []
    
    print("🔍 Checking HP AI Studio compatibility...")
    
    for lib in required_libs:
        try:
            __import__(lib)
            print(f"  ✅ {lib}")
        except ImportError:
            missing_libs.append(lib)
            print(f"  ❌ {lib}")
    
    if missing_libs:
        print(f"\n❌ Environment not compatible with HP AI Studio Project Manager")
        print(f"  Missing libraries: {', '.join(missing_libs)}")
        print(f"  Run: pip install {' '.join(missing_libs)}")
        return False
        
    # Check MLflow version
    import mlflow
    mlflow_version = mlflow.__version__
    if not mlflow_version.startswith("2."):
        print(f"\n⚠️ MLflow version {mlflow_version} may not be compatible with HP AI Studio Project Manager")
        print(f"  Recommended version: 2.x")
        print(f"  Run: pip install --upgrade mlflow>=2.0.0")
    else:
        print(f"  ✅ MLflow {mlflow_version}")
    
    print(f"\n✅ Environment is HP AI Studio compatible")
    return True

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
    print(f"🚀 Starting MLflow server on port {port}...")
    
    try:
        # Build command with proper directories
        cmd = [
            "mlflow", "server",
            "--host", "0.0.0.0",
            "--port", str(port),
            "--backend-store-uri", f"file://{mlflow_runs_dir}",
            "--default-artifact-root", f"file://{mlflow_runs_dir}"
        ]
        
        # Start the MLflow server
        mlflow_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # Give it a moment to start up
        time.sleep(2)
        
        # Check if process is still running
        if mlflow_process.poll() is not None:
            raise RuntimeError("MLflow server failed to start")
        
        print(f"✅ MLflow server running on http://localhost:{port}")
        print(f"   HP AI Studio Project Manager compatible tracking URL: file://{mlflow_runs_dir}")
        
        return mlflow_process
        
    except Exception as e:
        print(f"❌ Failed to start MLflow server: {e}")
        return None

def start_tensorboard_server(tensorboard_logs_dir, port=6006):
    """Start TensorBoard server for real-time monitoring."""
    print(f"🚀 Starting TensorBoard server on port {port}...")
    
    try:
        # Build command
        cmd = [
            "tensorboard", "--logdir", str(tensorboard_logs_dir),
            "--host", "0.0.0.0", "--port", str(port)
        ]
        
        # Start the TensorBoard server
        tensorboard_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # Give it a moment to start up
        time.sleep(2)
        
        # Check if process is still running
        if tensorboard_process.poll() is not None:
            raise RuntimeError("TensorBoard server failed to start")
        
        print(f"✅ TensorBoard server running on http://localhost:{port}")
        
        return tensorboard_process
        
    except Exception as e:
        print(f"❌ Failed to start TensorBoard server: {e}")
        return None

def start_jupyter_lab(demo_dir, port=8888):
    """Start Jupyter Lab for the demo notebooks."""
    print(f"🚀 Starting Jupyter Lab on port {port}...")
    
    try:
        # Build command
        cmd = [
            "jupyter", "lab",
            "--notebook-dir", str(demo_dir),
            "--port", str(port),
            "--ip", "0.0.0.0",
            "--no-browser"
        ]
        
        # Start Jupyter Lab
        jupyter_process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # Give it a moment to start up
        time.sleep(3)
        
        # Check if process is still running
        if jupyter_process.poll() is not None:
            raise RuntimeError("Jupyter Lab failed to start")
        
        print(f"✅ Jupyter Lab running on http://localhost:{port}")
        
        # Try to open the web browser
        try:
            webbrowser.open(f"http://localhost:{port}/lab")
        except:
            print("  Note: Could not automatically open browser")
        
        return jupyter_process
        
    except Exception as e:
        print(f"❌ Failed to start Jupyter Lab: {e}")
        return None

def create_sample_experiment():
    """Create a sample MLflow experiment for demonstration."""
    try:
        import mlflow
        import mlflow.sklearn
        import numpy as np
        from sklearn.datasets import load_iris
        from sklearn.model_selection import train_test_split
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.metrics import accuracy_score
        
        print("🧪 Creating sample experiment for judges...")
        
        # Set experiment
        mlflow.set_experiment("HP_AI_Studio_Demo")
        
        # Load data
        iris = load_iris()
        X = iris.data
        y = iris.target
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
        
        # Train model and log metrics
        with mlflow.start_run(run_name="sample_model_for_judges"):
            # Train model
            model = RandomForestClassifier(n_estimators=100)
            model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Log parameters and metrics
            mlflow.log_param("n_estimators", 100)
            mlflow.log_param("random_state", 42)
            mlflow.log_metric("accuracy", accuracy)
            
            # Log model
            mlflow.sklearn.log_model(model, "model", registered_model_name="iris_classifier_demo")
            
            print(f"  ✅ Created sample model: iris_classifier_demo")
            print(f"  📊 Accuracy: {accuracy:.4f}")
    
    except Exception as e:
        print(f"❌ Failed to create sample experiment: {e}")

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
            "tensorboard_ui": "http://localhost:6006", 
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

def handle_shutdown(processes):
    """Handle graceful shutdown of all processes."""
    print("\n🛑 Shutting down demo services...")
    
    for name, process in processes.items():
        if process and process.poll() is None:
            print(f"  Stopping {name}...")
            process.terminate()
            try:
                process.wait(timeout=5)
                print(f"  ✅ {name} stopped")
            except subprocess.TimeoutExpired:
                print(f"  ⚠️ Force killing {name}...")
                process.kill()
            except Exception as e:
                print(f"  ❌ Error stopping {name}: {e}")

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
    print()
    print("🔧 Unified Monitoring Platform:")
    print("  • MLflow: Experiment tracking and model management")
    print("  • TensorBoard: Real-time metrics and audio visualization")
    print("  • HP AI Studio: Enterprise-compatible dual platform monitoring")

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
    
    processes = {
        "MLflow Server": mlflow_process,
        "TensorBoard Server": tensorboard_process,
        "Jupyter Lab": jupyter_process
    }
    
    # Display demo options for judges
    display_demo_options()
    
    print("\n🎬 Demo is ready for judges! Press Ctrl+C to exit.")
    
    try:
        # Keep the script running until interrupted
        while True:
            time.sleep(1)
            
            # Check if any process has exited
            for name, process in processes.items():
                if process and process.poll() is not None:
                    print(f"\n⚠️ {name} has exited unexpectedly. Exit code: {process.poll()}")
                    # Handle graceful shutdown
                    handle_shutdown(processes)
                    sys.exit(1)
    
    except KeyboardInterrupt:
        print("\n🎬 Demo shutdown requested.")
        handle_shutdown(processes)
        print("👋 Goodbye!")

if __name__ == "__main__":
    main()
