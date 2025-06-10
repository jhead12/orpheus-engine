#!/usr/bin/env python3
"""
Orpheus Engine Demo Validation Script
Validates that the clean demo structure is ready for judges
"""

import os
import sys
from pathlib import Path

def validate_demo_structure():
    """Validate that all essential files are present and accessible."""
    demo_dir = Path(__file__).parent
    
    print("🔍 Validating Orpheus Engine Judge Demo Structure")
    print("=" * 50)
    
    # Essential notebooks for judges
    essential_notebooks = [
        "OrpheusWebDemo.ipynb",
        "HP_AI_Studio_Judge_Evaluation_Demo.ipynb", 
        "Orpheus_MLflow_Demo.ipynb"
    ]
    
    # Essential files
    essential_files = [
        "README.md",
        "JUDGES_README.md",
        "requirements.txt",
        "start_demo.py",
        "demo.sh"
    ]
    
    # Check notebooks
    print("📚 Judge Evaluation Notebooks:")
    for notebook in essential_notebooks:
        notebook_path = demo_dir / notebook
        if notebook_path.exists():
            size_kb = notebook_path.stat().st_size / 1024
            print(f"  ✅ {notebook} ({size_kb:.1f} KB)")
        else:
            print(f"  ❌ {notebook} (missing)")
            return False
    
    # Check essential files
    print("\n📋 Essential Demo Files:")
    for file_name in essential_files:
        file_path = demo_dir / file_name
        if file_path.exists():
            print(f"  ✅ {file_name}")
        else:
            print(f"  ❌ {file_name} (missing)")
            return False
    
    # Check that development files are hidden
    print("\n🙈 Development Files (Should be hidden):")
    dev_patterns = [
        ".ipynb_checkpoints",
        "mlflow_runs", 
        "mlruns",
        "artifacts",
        "dev-files",
        "archive"
    ]
    
    for pattern in dev_patterns:
        pattern_path = demo_dir / pattern
        if pattern_path.exists():
            print(f"  📁 {pattern} (present but hidden by .gitignore)")
        else:
            print(f"  ⚪ {pattern} (not present)")
    
    # Check .gitignore
    gitignore_path = demo_dir / ".gitignore"
    if gitignore_path.exists():
        print(f"\n✅ .gitignore present - development artifacts will be hidden")
        
        # Check if key patterns are in gitignore
        with open(gitignore_path, 'r') as f:
            gitignore_content = f.read()
            
        key_patterns = [".ipynb_checkpoints/", "mlflow_runs/", "artifacts/", "dev-files/"]
        missing_patterns = []
        
        for pattern in key_patterns:
            if pattern not in gitignore_content:
                missing_patterns.append(pattern)
        
        if missing_patterns:
            print(f"  ⚠️ Missing patterns in .gitignore: {', '.join(missing_patterns)}")
        else:
            print("  ✅ All key development patterns are ignored")
    else:
        print(f"\n❌ .gitignore missing - development files may be visible to judges")
        return False
    
    print(f"\n🎯 Demo Structure Validation: ✅ PASSED")
    print("   Ready for judge evaluation!")
    return True

def check_hp_ai_studio_readiness():
    """Check if the demo is ready for HP AI Studio."""
    print("\n🔍 Checking HP AI Studio Compatibility")
    print("=" * 50)
    
    # Check for required libraries
    required_libs = [
        "mlflow", "tensorflow", "librosa", "numpy", "pandas", 
        "matplotlib", "jupyterlab", "notebook", "soundfile"
    ]
    
    missing_libs = []
    
    for lib in required_libs:
        try:
            __import__(lib)
            print(f"  ✅ {lib} installed")
        except ImportError:
            missing_libs.append(lib)
            print(f"  ❌ {lib} missing")
    
    if missing_libs:
        print(f"  💡 Install missing libraries: pip install {' '.join(missing_libs)}")
        return False
    
    print(f"  🎵 All audio processing libraries available")
    return True

def main():
    """Main validation function."""
    # Validate demo structure
    structure_valid = validate_demo_structure()
    
    # Check HP AI Studio readiness
    hp_ready = check_hp_ai_studio_readiness()
    
    # Overall status
    print("\n" + "=" * 50)
    print("🏁 VALIDATION RESULTS:")
    print(f"  Demo Structure: {'✅ READY' if structure_valid else '❌ NOT READY'}")
    print(f"  HP AI Studio: {'✅ COMPATIBLE' if hp_ready else '❌ NOT COMPATIBLE'}")
    
    if structure_valid and hp_ready:
        print("\n✅ DEMO READY FOR JUDGES!")
        print("  Run ./start_demo.py to launch the demo")
        sys.exit(0)
    else:
        print("\n❌ DEMO NOT READY YET")
        print("  Please fix the issues above before submitting")
        sys.exit(1)

if __name__ == "__main__":
    main()
