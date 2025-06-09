#!/usr/bin/env python3
"""
Monitor API for the Orpheus Engine Workstation.
Provides endpoints to monitor system resources and background processes.
"""

from flask import Flask, jsonify, request
import psutil
import os
import logging
import threading
import time
from datetime import datetime

app = Flask(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger('monitor_api')

# Global state for background tasks and processing stats
processing_stats = {
    'cpu_usage': 0.0,
    'memory_usage': 0.0,
    'disk_usage': 0.0,
    'active_tasks': [],
    'last_updated': None
}

def update_system_stats():
    """Background thread to update system statistics"""
    while True:
        try:
            # Update CPU usage
            processing_stats['cpu_usage'] = psutil.cpu_percent(interval=1)
            
            # Update memory usage
            memory = psutil.virtual_memory()
            processing_stats['memory_usage'] = memory.percent
            
            # Update disk usage for the current directory
            disk = psutil.disk_usage(os.getcwd())
            processing_stats['disk_usage'] = disk.percent
            
            # Update timestamp
            processing_stats['last_updated'] = datetime.now().isoformat()
            
            # Cleanup finished tasks
            processing_stats['active_tasks'] = [task for task in processing_stats['active_tasks'] 
                                             if task['status'] != 'completed']
            
            time.sleep(5)  # Update every 5 seconds
        except Exception as e:
            logger.error(f"Error updating system stats: {e}")
            time.sleep(10)  # Wait a bit longer before retrying

# Start the system stats updater thread
stats_thread = threading.Thread(target=update_system_stats, daemon=True)
stats_thread.start()

@app.route('/')
def index():
    """Root endpoint returning basic API information"""
    return jsonify({
        'name': 'Orpheus Engine Monitor API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': [
            '/stats',
            '/tasks',
            '/health'
        ]
    })

@app.route('/stats')
def stats():
    """Return current system statistics"""
    return jsonify({
        'cpu_usage': processing_stats['cpu_usage'],
        'memory_usage': processing_stats['memory_usage'],
        'disk_usage': processing_stats['disk_usage'],
        'task_count': len(processing_stats['active_tasks']),
        'last_updated': processing_stats['last_updated']
    })

@app.route('/tasks')
def tasks():
    """Return information about active background tasks"""
    return jsonify({
        'active_tasks': processing_stats['active_tasks'],
        'count': len(processing_stats['active_tasks'])
    })

@app.route('/tasks', methods=['POST'])
def create_task():
    """Register a new background task"""
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    data = request.get_json()
    if 'name' not in data:
        return jsonify({'error': 'Task must have a name'}), 400
    
    task_id = str(len(processing_stats['active_tasks']) + 1)
    new_task = {
        'id': task_id,
        'name': data['name'],
        'description': data.get('description', ''),
        'status': 'running',
        'progress': 0,
        'created_at': datetime.now().isoformat()
    }
    
    processing_stats['active_tasks'].append(new_task)
    return jsonify(new_task), 201

@app.route('/tasks/<task_id>', methods=['PATCH'])
def update_task(task_id):
    """Update a background task's status or progress"""
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400
    
    data = request.get_json()
    task = next((t for t in processing_stats['active_tasks'] if t['id'] == task_id), None)
    
    if task is None:
        return jsonify({'error': 'Task not found'}), 404
    
    if 'status' in data:
        task['status'] = data['status']
    
    if 'progress' in data:
        task['progress'] = data['progress']
    
    return jsonify(task)

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'uptime': time.time() - psutil.boot_time()
    })

if __name__ == '__main__':
    port = int(os.environ.get('MONITOR_PORT', 8000))
    debug = os.environ.get('DEVELOPMENT', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
