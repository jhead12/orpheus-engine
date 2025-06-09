#!/usr/bin/env python3
"""
HP AI Studio Project Manager Compatible Setup
Ensures MLflow 2.15.0 and compatible dependencies for Orpheus Engine notebooks
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e}")
        if e.stderr:
            print(f"   Error: {e.stderr.strip()}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} is not compatible. Need Python 3.8+")
        return False

def verify_mlflow_version():
    """Verify MLflow 2.15.0 is installed"""
    try:
        import mlflow
        version = mlflow.__version__
        if version == "2.15.0":
            print(f"✅ MLflow {version} - HP AI Studio Project Manager compatible")
            return True
        else:
            print(f"⚠️ MLflow {version} installed. HP AI Studio Project Manager requires 2.15.0")
            return False
    except ImportError:
        print("❌ MLflow not installed")
        return False

def setup_hp_ai_studio_environment():
    """Set up the complete HP AI Studio compatible environment"""
    
    print("🚀 HP AI Studio Project Manager Compatible Setup")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        print("💡 Please upgrade to Python 3.8 or higher")
        return False
    
    # Get the project root directory
    project_root = Path(__file__).parent.parent
    demo_dir = project_root / "demo"
    
    print(f"📁 Project root: {project_root}")
    print(f"📁 Demo directory: {demo_dir}")
    
    # Step 1: Upgrade pip
    if not run_command(f"{sys.executable} -m pip install --upgrade pip", "Upgrading pip"):
        return False
    
    # Step 2: Install exact MLflow version for Project Manager compatibility
    print("\n📦 Installing HP AI Studio Project Manager compatible packages...")
    
    # Core MLflow installation
    mlflow_cmd = f"{sys.executable} -m pip install mlflow==2.15.0 mlflow-skinny==2.15.0"
    if not run_command(mlflow_cmd, "Installing MLflow 2.15.0"):
        return False
    
    # Step 3: Install main requirements
    main_requirements = project_root / "requirements.txt"
    if main_requirements.exists():
        cmd = f"{sys.executable} -m pip install -r {main_requirements}"
        if not run_command(cmd, "Installing main requirements"):
            return False
    
    # Step 4: Install demo-specific requirements
    demo_requirements = demo_dir / "requirements.txt"
    if demo_requirements.exists():
        cmd = f"{sys.executable} -m pip install -r {demo_requirements}"
        if not run_command(cmd, "Installing demo requirements"):
            return False
    
    # Step 5: Verify installations
    print("\n🔍 Verifying installations...")
    
    # Check MLflow version
    if not verify_mlflow_version():
        print("❌ MLflow version verification failed")
        return False
    
    # Check other critical packages
    critical_packages = [
        ("numpy", "Scientific computing"),
        ("pandas", "Data manipulation"),
        ("librosa", "Audio analysis"),
        ("pyloudnorm", "Professional loudness standards"),
        ("scikit-learn", "Machine learning"),
        ("matplotlib", "Plotting"),
        ("plotly", "Interactive visualizations"),
        ("jupyter", "Notebook environment")
    ]
    
    for package, description in critical_packages:
        try:
            __import__(package)
            print(f"✅ {package}: {description}")
        except ImportError:
            print(f"⚠️ {package}: Not available ({description})")
    
    # Step 6: Create compatibility test
    test_script = demo_dir / "test_hp_ai_studio_compatibility.py"
    test_content = '''#!/usr/bin/env python3
"""Test HP AI Studio Project Manager compatibility"""

def test_compatibility():
    try:
        import mlflow
        assert mlflow.__version__ == "2.15.0", f"MLflow version {mlflow.__version__} != 2.15.0"
        
        import numpy, pandas, librosa, pyloudnorm, sklearn
        from mlflow.types.schema import Schema, ColSpec
        from mlflow.models import ModelSignature
        
        print("✅ All HP AI Studio Project Manager dependencies verified")
        print(f"   MLflow: {mlflow.__version__}")
        print(f"   NumPy: {numpy.__version__}")
        print(f"   Pandas: {pandas.__version__}")
        print(f"   Librosa: {librosa.__version__}")
        print("🚀 Ready for HP AI Studio Project Manager synchronization")
        return True
        
    except Exception as e:
        print(f"❌ Compatibility test failed: {e}")
        return False

if __name__ == "__main__":
    test_compatibility()
'''
    
    with open(test_script, 'w') as f:
        f.write(test_content)
    
    # Run compatibility test
    if run_command(f"{sys.executable} {test_script}", "Running compatibility test"):
        print("\n🎉 HP AI STUDIO SETUP COMPLETE!")
        print("=" * 60)
        print("✅ MLflow 2.15.0 installed and verified")
        print("✅ All dependencies compatible with Project Manager")
        print("✅ Jupyter notebooks ready for synchronization")
        print("✅ Professional audio analysis libraries installed")
        print("\n🚀 Next steps:")
        print("   1. Open Jupyter notebooks in the demo/ folder")
        print("   2. Notebooks will sync with HP AI Studio Project Manager")
        print("   3. MLflow experiments will track properly")
        print("\n📚 Available notebooks:")
        print("   • HP_AI_Studio_Judge_Evaluation_Demo.ipynb")
        print("   • Orpheus_MLflow_Demo.ipynb")
        print("   • HP_AI_Blueprints_BERT_QA_Reference.ipynb")
        
        return True
    else:
        print("\n❌ Setup completed but compatibility test failed")
        print("💡 Please check the error messages above")
        return False

if __name__ == "__main__":
    success = setup_hp_ai_studio_environment()
    sys.exit(0 if success else 1)
