#!/usr/bin/env python3
# Simple Flask server for development
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return jsonify({"status": "ok", "message": "Orpheus Engine Backend is running"})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('BACKEND_PORT', 5001))
    debug = os.environ.get('DEVELOPMENT', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
