from flask import Blueprint, request, jsonify
import json
import os
import sys

# Add current directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Try to import the proper schema based on environment
schema = None
graphql_enabled = True

try:
    # First try the full graphene-based schema
    from .schema import schema
    print("✓ Successfully imported graphene-based schema")
except ImportError as e:
    print(f"⚠ Warning: Could not import graphene schema: {e}")
    try:
        # Fall back to flexible schema
        from .flexible_schema import get_flexible_schema
        schema = get_flexible_schema()
        print("✓ Successfully imported flexible schema")
    except ImportError as e2:
        print(f"✗ Error: Could not import any schema: {e2}")
        graphql_enabled = False

# Create a Blueprint for GraphQL
graphql_blueprint = Blueprint('graphql', __name__)

@graphql_blueprint.route('/graphql', methods=['POST', 'GET'])
def graphql_endpoint():
    """
    Simple GraphQL endpoint that works around flask-graphql compatibility issues
    """
    if not graphql_enabled:
        return jsonify({
            'error': 'GraphQL is not available due to missing dependencies',
            'message': 'Please install graphene or check Python version compatibility'
        }), 500
    
    try:
        if request.method == 'POST':
            # Handle POST requests with JSON body
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No JSON body provided'}), 400
            
            query = data.get('query')
            variables = data.get('variables', {})
            
        elif request.method == 'GET':
            # Handle GET requests with query parameters
            query = request.args.get('query')
            variables = {}
            
        if not query:
            return jsonify({'error': 'No query provided'}), 400
        
        # Check if this is a flexible schema (dict-based) or graphene schema
        if hasattr(schema, 'execute'):
            # This is a graphene schema
            result = schema.execute(query, variable_values=variables)
            
            # Format the response
            response_data = {'data': result.data}
            
            if result.errors:
                response_data['errors'] = [str(error) for error in result.errors]
                
        else:
            # This is a flexible schema (dict-based)
            response_data = schema.execute_query(query, variables)
            
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': f'GraphQL execution error: {str(e)}'}), 500

@graphql_blueprint.route('/graphiql', methods=['GET'])
def graphiql():
    """
    Simple GraphiQL interface for testing
    """
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>GraphiQL</title>
        <style>
            body { margin: 0; font-family: Arial, sans-serif; }
            #graphiql { height: 100vh; }
        </style>
        <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
        <script src="https://unpkg.com/graphiql@3/graphiql.min.js"></script>
        <link href="https://unpkg.com/graphiql@3/graphiql.min.css" rel="stylesheet" />
    </head>
    <body>
        <div id="graphiql">Loading...</div>
        <script>
            const fetcher = (graphQLParams) => {
                return fetch('/api/graphql', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(graphQLParams),
                }).then(response => response.json());
            };
            
            ReactDOM.render(
                React.createElement(GraphiQL, { fetcher: fetcher }),
                document.getElementById('graphiql')
            );
        </script>
    </body>
    </html>
    '''
