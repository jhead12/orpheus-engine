#!/usr/bin/env python3
"""
Direct GraphQL Test for Audio Library

This script tests the GraphQL schema directly without needing the Flask server.
It's useful for debugging schema issues before integrating with the API.

Usage:
    python direct_graphql_test.py
"""

import os
import json
import sys

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    # Try to import the GraphQL schema using local imports
    sys.path.insert(0, os.path.join(current_dir, 'graphql_api'))
    from schema import schema
    
    # Execute a query against the schema
    query = """
    query {
        audioLibrary {
            description
            files {
                id
                filename
                type
                description
                usage
            }
        }
    }
    """
    
    # Execute the query
    result = schema.execute(query)
    
    # Check for errors
    if result.errors:
        print("GraphQL Query Errors:")
        for error in result.errors:
            print(f"- {error}")
        sys.exit(1)
    
    # Print the result
    print("GraphQL Schema Test Successful!")
    print("\nQuery Result:")
    print(json.dumps(result.data, indent=2))
    
except ImportError as e:
    print(f"Failed to import GraphQL schema: {e}")
    print("Make sure the GraphQL schema is properly set up and graphene is installed.")
    sys.exit(1)
except Exception as e:
    print(f"Error testing GraphQL schema: {e}")
    sys.exit(1)
