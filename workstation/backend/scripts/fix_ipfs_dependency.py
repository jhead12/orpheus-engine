#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path
import re

def find_requirement_files():
    """Find all requirements files in the project directory"""
    root_dir = Path('/workspaces/orpheus-engine')
    requirement_files = []
    
    for file_path in root_dir.glob('**/*'):
        if file_path.is_file() and ('requirements' in file_path.name.lower() and file_path.suffix == '.txt'):
            requirement_files.append(file_path)
        elif file_path.is_file() and file_path.name == 'setup.py':
            requirement_files.append(file_path)
            
    return requirement_files

def modify_file(file_path):
    """Modify the file to fix ipfshttpclient dependency"""
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Check if the problematic dependency exists in this file
    if 'ipfshttpclient>=0.8.0' in content:
        # Replace with a compatible version
        modified_content = content.replace('ipfshttpclient>=0.8.0', 'ipfshttpclient==0.7.0')
        
        with open(file_path, 'w') as file:
            file.write(modified_content)
        
        print(f"Fixed dependency in {file_path}")
        return True
    
    return False

def main():
    print("Searching for requirements files with ipfshttpclient>=0.8.0 dependency...")
    found = False
    
    for file_path in find_requirement_files():
        if modify_file(file_path):
            found = True
    
    if found:
        print("\nDependency has been updated to ipfshttpclient==0.7.0")
        print("Please try installing your requirements again.")
    else:
        print("\nCouldn't find the problematic dependency in requirements files.")
        print("If you know which package requires ipfshttpclient>=0.8.0, you may need to:")
        print("1. Install ipfshttpclient manually: pip install ipfshttpclient==0.7.0")
        print("2. Modify the package that requires it")
        print("3. Try installing with the --pre flag to include pre-releases: pip install --pre <package>")

if __name__ == "__main__":
    main()
