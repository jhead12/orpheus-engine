#!/usr/bin/env python3
"""
Dependency Conflict Resolution Script for Orpheus Engine
Resolves conflicts between pydantic-ai-slim, open-webui, and MCP packages
"""

import subprocess
import sys
import pkg_resources
from typing import List, Dict

def run_command(command: List[str], description: str) -> bool:
    """Run a command and return success status"""
    print(f"\n📦 {description}...")
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_conflicts() -> Dict[str, str]:
    """Check for dependency conflicts"""
    conflicts = {}
    
    try:
        # Check current versions
        installed_packages = {pkg.project_name: pkg.version for pkg in pkg_resources.working_set}
        
        # Known conflicts
        conflict_checks = {
            'opentelemetry-api': ('1.28.0', 'pydantic-ai-slim requires >=1.28.0'),
            'pydantic': ('2.9.2', 'open-webui requires ==2.9.2'),
            'python-socketio': ('5.11.3', 'open-webui requires ==5.11.3')
        }
        
        for package, (required_version, reason) in conflict_checks.items():
            if package in installed_packages:
                current_version = installed_packages[package]
                print(f"📋 {package}: current={current_version}, required={required_version}")
                if current_version != required_version:
                    conflicts[package] = f"{reason} (current: {current_version})"
        
        return conflicts
    
    except Exception as e:
        print(f"⚠️ Error checking conflicts: {e}")
        return {}

def fix_dependencies():
    """Fix dependency conflicts"""
    print("🔧 Orpheus Engine Dependency Conflict Resolution")
    print("=" * 50)
    
    # Check current conflicts
    conflicts = check_conflicts()
    if conflicts:
        print("\n🚨 Detected conflicts:")
        for package, issue in conflicts.items():
            print(f"  - {package}: {issue}")
    else:
        print("✅ No conflicts detected")
        return
    
    # Step 1: Uninstall conflicting packages
    conflicting_packages = [
        'pydantic-ai-slim', 'pydantic-ai', 'open-webui',
        'opentelemetry-api', 'python-socketio'
    ]
    
    print(f"\n🗑️ Uninstalling conflicting packages...")
    uninstall_cmd = [sys.executable, '-m', 'pip', 'uninstall', '-y'] + conflicting_packages
    run_command(uninstall_cmd, "Uninstalling conflicting packages")
    
    # Step 2: Install compatible versions in specific order
    installation_steps = [
        # Core dependencies first
        ([sys.executable, '-m', 'pip', 'install', 'opentelemetry-api>=1.28.0'], 
         "Installing compatible opentelemetry-api"),
        
        ([sys.executable, '-m', 'pip', 'install', 'python-socketio==5.11.3'], 
         "Installing compatible python-socketio"),
        
        ([sys.executable, '-m', 'pip', 'install', 'pydantic==2.9.2'], 
         "Installing compatible pydantic"),
        
        # MCP package
        ([sys.executable, '-m', 'pip', 'install', 'mcp'], 
         "Installing MCP package"),
        
        # Optional: Reinstall other packages if needed
        ([sys.executable, '-m', 'pip', 'install', 'open-webui==0.5.7'], 
         "Reinstalling open-webui with compatible dependencies"),
    ]
    
    for command, description in installation_steps:
        if not run_command(command, description):
            print(f"⚠️ Failed to complete: {description}")
            print("You may need to resolve this manually")
    
    # Step 3: Verify installation
    print("\n🔍 Verifying installation...")
    verify_cmd = [sys.executable, '-m', 'pip', 'check']
    if run_command(verify_cmd, "Checking for dependency conflicts"):
        print("\n🎉 All dependency conflicts resolved!")
    else:
        print("\n⚠️ Some conflicts may remain. Check the output above.")
    
    # Step 4: List MCP related packages
    print("\n📦 MCP-related packages installed:")
    list_cmd = [sys.executable, '-m', 'pip', 'list']
    try:
        result = subprocess.run(list_cmd, capture_output=True, text=True, check=True)
        mcp_packages = [line for line in result.stdout.split('\n') if 'mcp' in line.lower()]
        for package in mcp_packages:
            if package.strip():
                print(f"  ✅ {package}")
    except Exception as e:
        print(f"⚠️ Error listing packages: {e}")

if __name__ == "__main__":
    fix_dependencies()
