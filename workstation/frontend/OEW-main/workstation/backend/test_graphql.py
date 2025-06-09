#!/usr/bin/env python3
"""
GraphQL API Test Script for Audio Library

This script tests the GraphQL API for the audio library.
It sends a simple query to retrieve all audio files.

Usage:
    python test_graphql.py
"""

import requests
import json

def test_graphql_api():
    """Test the GraphQL API by querying for all audio files"""
    
    # Define the GraphQL query
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
    
    # GraphQL endpoint URL
    url = "http://localhost:7008/api/graphql"
    
    # Send the request
    response = requests.post(
        url,
        json={"query": query}
    )
    
    # Check the response
    if response.status_code == 200:
        print("GraphQL API is working!")
        print("\nAPI Response:")
        print(json.dumps(response.json(), indent=2))
        return True
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return False

if __name__ == "__main__":
    print("Testing GraphQL API for Audio Library...")
    test_graphql_api()
