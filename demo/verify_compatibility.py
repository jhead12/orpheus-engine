#!/usr/bin/env python3
"""
Verify HP AI Studio Project Manager Compatibility
Run this script to check if all Jupyter notebooks can sync properly
"""

import sys
import os
from pathlib import Path

def verify_notebook_compatibility():
    """Verify that notebooks can sync with HP AI Studio Project Manager"""
    
    print("🔍 HP AI Studio Project Manager Compatibility Check")
    print("=" * 55)
    
    # Check MLflow version (critical for sync)
    try:
        import mlflow
        mlflow_version = mlflow.__version__
        
        if mlflow_version == "2.15.0":
            print(f"✅ MLflow {mlflow_version} - Project Manager compatible")
            mlflow_compatible = True
        else:
            print(f"❌ MLflow {mlflow_version} - Project Manager requires 2.15.0")
            mlflow_compatible = False
            
    except ImportError:
        print("❌ MLflow not installed")
        mlflow_compatible = False
    
    # Check notebook dependencies
    notebook_deps = {
        "jupyter": "Jupyter environment",
        "numpy": "Scientific computing",
        "pandas": "Data analysis", 
        "matplotlib": "Plotting",
        "plotly": "Interactive visualizations",
        "librosa": "Audio analysis",
        "pyloudnorm": "Professional audio standards",
        "sklearn": "Machine learning",
        "soundfile": "Audio I/O"
    }
    
    print("\n📚 Checking notebook dependencies:")
    deps_available = 0
    total_deps = len(notebook_deps)
    
    for package, description in notebook_deps.items():
        try:
            if package == "sklearn":
                import sklearn
            else:
                __import__(package)
            print(f"✅ {package}: {description}")
            deps_available += 1
        except ImportError:
            print(f"❌ {package}: {description} - NOT AVAILABLE")
    
    # Check MLflow schema support (required for HP AI Studio)
    print("\n🏗️ Checking MLflow schema support:")
    try:
        from mlflow.types.schema import Schema, ColSpec
        from mlflow.types import ParamSchema, ParamSpec  
        from mlflow.models import ModelSignature
        print("✅ MLflow model signatures supported")
        schema_support = True
    except ImportError as e:
        print(f"❌ MLflow schema support missing: {e}")
        schema_support = False
    
    # Check notebook files
    print("\n📔 Checking notebook files:")
    demo_dir = Path(__file__).parent
    notebooks = [
        "HP_AI_Studio_Judge_Evaluation_Demo.ipynb",
        "Orpheus_MLflow_Demo.ipynb", 
        "HP_AI_Blueprints_BERT_QA_Reference.ipynb"
    ]
    
    notebooks_found = 0
    for notebook in notebooks:
        notebook_path = demo_dir / notebook
        if notebook_path.exists():
            print(f"✅ {notebook}")
            notebooks_found += 1
        else:
            print(f"❌ {notebook} - NOT FOUND")
    
    # Generate compatibility report
    print("\n📊 COMPATIBILITY REPORT")
    print("=" * 55)
    
    if mlflow_compatible:
        print("✅ MLflow 2.15.0: Project Manager sync ready")
    else:
        print("❌ MLflow: Incompatible version - sync will fail")
        print("   Fix: pip install mlflow==2.15.0")
    
    dep_percentage = (deps_available / total_deps) * 100
    print(f"📦 Dependencies: {deps_available}/{total_deps} ({dep_percentage:.0f}%)")
    
    if schema_support:
        print("✅ Model signatures: HP AI Studio compatible")
    else:
        print("❌ Model signatures: Not supported")
    
    print(f"📔 Notebooks: {notebooks_found}/{len(notebooks)} found")
    
    # Overall status
    overall_compatible = (
        mlflow_compatible and 
        deps_available >= (total_deps * 0.8) and  # 80% of deps
        schema_support and 
        notebooks_found >= 2  # At least 2 notebooks
    )
    
    print(f"\n🎯 OVERALL STATUS: {'✅ READY' if overall_compatible else '❌ NEEDS SETUP'}")
    
    if overall_compatible:
        print("\n🚀 HP AI Studio Project Manager Integration:")
        print("   • Notebooks will sync properly")
        print("   • MLflow experiments will track correctly") 
        print("   • Model registry integration available")
        print("   • Professional audio analysis ready")
        print("\n💡 To start:")
        print("   jupyter lab")
        print("   # Open any notebook and run cells")
        
    else:
        print("\n🔧 Setup required:")
        print("   python setup_hp_ai_studio.py")
        print("   # This will install all compatible dependencies")
    
    return overall_compatible

if __name__ == "__main__":
    compatible = verify_notebook_compatibility()
    sys.exit(0 if compatible else 1)
