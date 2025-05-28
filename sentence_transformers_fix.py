import subprocess
import sys

def fix_sentence_transformers():
    """Fix the sentence_transformers compatibility issue with huggingface_hub"""
    print("Installing compatible versions of the required packages...")
    
    # First, uninstall current versions
    subprocess.run([sys.executable, "-m", "pip", "uninstall", "-y", "sentence-transformers", "huggingface-hub"])
    
    # Install specific versions that are compatible
    subprocess.run([sys.executable, "-m", "pip", "install", "huggingface-hub==0.12.0", "sentence-transformers==2.2.2"])
    
    print("Installation completed. The packages should now work together.")

if __name__ == "__main__":
    fix_sentence_transformers()
