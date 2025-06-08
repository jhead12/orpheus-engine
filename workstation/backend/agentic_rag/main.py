from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    # Add a build user stats interface
    if 'build_user_stats' in app.config:
        return jsonify(app.config['build_user_stats'])
    # Default response if no user stats are configured
    return "Welcome to the Agentic RAG backend!"
    
    return "Agentic RAG backend is running."

@app.route('/api/component')
def component():
    # Example: return a config for a Message component
    return jsonify({
        'type': 'Message',
        'props': {
            'text': 'Hello from the Orpheus Engine backend!'
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
