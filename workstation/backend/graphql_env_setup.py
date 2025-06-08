#!/usr/bin/env python3
"""
Environment-agnostic GraphQL setup for Orpheus Engine

This script detects the current environment and sets up GraphQL accordingly,
handling different dependency versions and Python environments.
"""

import sys
import os
import importlib
import subprocess
from typing import Optional, Dict, Any

class GraphQLEnvironmentSetup:
    def __init__(self):
        self.python_version = f"{sys.version_info.major}.{sys.version_info.minor}"
        self.environment_info = self._detect_environment()
        
    def _detect_environment(self) -> Dict[str, Any]:
        """Detect the current Python environment and available packages"""
        env_info = {
            'python_version': self.python_version,
            'virtual_env': os.environ.get('VIRTUAL_ENV'),
            'conda_env': os.environ.get('CONDA_DEFAULT_ENV'),
            'available_packages': {},
            'graphql_backend': None
        }
        
        # Check for available GraphQL packages
        packages_to_check = [
            'graphene',
            'flask_graphql',
            'graphql_core',
            'graphql_relay',
            'strawberry_graphql',
            'ariadne'
        ]
        
        for package in packages_to_check:
            try:
                spec = importlib.util.find_spec(package)
                if spec:
                    module = importlib.import_module(package)
                    version = getattr(module, '__version__', 'unknown')
                    env_info['available_packages'][package] = version
            except ImportError:
                env_info['available_packages'][package] = None
                
        return env_info
    
    def get_compatible_graphql_backend(self) -> Optional[str]:
        """Determine the best GraphQL backend for the current environment"""
        available = self.environment_info['available_packages']
        
        # Try Graphene first (most common)
        if available.get('graphene') and available.get('graphql_core'):
            try:
                import graphene
                from graphql import execute
                return 'graphene'
            except ImportError as e:
                print(f"Graphene import failed: {e}")
        
        # Try Strawberry GraphQL (modern alternative)
        if available.get('strawberry_graphql'):
            try:
                import strawberry
                return 'strawberry'
            except ImportError:
                pass
        
        # Try Ariadne (schema-first approach)
        if available.get('ariadne'):
            try:
                import ariadne
                return 'ariadne'
            except ImportError:
                pass
                
        return None
    
    def create_fallback_schema(self):
        """Create a simple fallback schema that works without external GraphQL libraries"""
        return {
            'query': {
                'audioLibrary': {
                    'description': 'Audio file library for Orpheus Engine Agentic RAG pipeline',
                    'files': [
                        {
                            'id': '0',
                            'filename': 'tester.mp3',
                            'type': 'MP3',
                            'description': 'Test audio file for RAG pipeline transcription',
                            'usage': 'Primary test file for agentic_rag.ipynb'
                        }
                    ]
                }
            }
        }
    
    def install_minimal_dependencies(self):
        """Install minimal dependencies for GraphQL functionality"""
        try:
            # Try to install graphene with specific compatible versions
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install',
                'graphene>=3.0,<4.0',
                'graphql-core>=3.2.0,<3.3.0',
                '--no-deps'  # Avoid dependency conflicts
            ])
            return True
        except subprocess.CalledProcessError:
            print("Failed to install GraphQL dependencies")
            return False

def setup_graphql_for_environment():
    """Main setup function"""
    setup = GraphQLEnvironmentSetup()
    
    print(f"Setting up GraphQL for Python {setup.python_version}")
    print(f"Environment: {setup.environment_info.get('virtual_env', 'system')}")
    
    backend = setup.get_compatible_graphql_backend()
    
    if backend:
        print(f"Using GraphQL backend: {backend}")
        return backend
    else:
        print("No compatible GraphQL backend found, using fallback")
        return 'fallback'

if __name__ == "__main__":
    setup_graphql_for_environment()
