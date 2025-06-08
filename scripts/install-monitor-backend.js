import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_DIR = path.join(__dirname, '../workstation/backend');

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m"
};

console.log(`${colors.blue}Setting up Monitor API backend...${colors.reset}`);

// Check if monitor_api.py exists, create if not
const monitorApiPath = path.join(BACKEND_DIR, 'monitor_api.py');
if (!fs.existsSync(monitorApiPath)) {
  console.log(`${colors.yellow}Creating monitor_api.py file...${colors.reset}`);
  const monitorApiContent = `#!/usr/bin/env python3
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
`;
  fs.writeFileSync(monitorApiPath, monitorApiContent);
  console.log(`${colors.green}✅ Created monitor_api.py${colors.reset}`);
}

// Check if requirements.txt exists
const requirementsPath = path.join(BACKEND_DIR, 'requirements.txt');
if (!fs.existsSync(requirementsPath)) {
  console.log(`${colors.yellow}Requirements file doesn't exist. Creating...${colors.reset}`);
  
  // Create a requirements.txt file with the necessary dependencies
  const requirementsContent = `Flask>=2.0.1
Flask-Cors>=3.0.10
psutil>=5.9.0
`;
  fs.writeFileSync(requirementsPath, requirementsContent);
}

// Create the setup script if it doesn't exist
const setupScriptPath = path.join(BACKEND_DIR, 'setup_venv.sh');
if (!fs.existsSync(setupScriptPath)) {
  console.log(`${colors.yellow}Creating setup script...${colors.reset}`);
  const setupScriptContent = `#!/bin/bash
set -e

echo "🔧 Setting up Python environment for Orpheus Engine monitor..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Ensure pip is up to date
echo "🔄 Upgrading pip..."
pip install --upgrade pip setuptools wheel

# Install requirements
echo "📚 Installing dependencies..."
pip install -r requirements.txt

echo "✅ Setup complete! Virtual environment is ready."
echo "🚀 To activate the environment run: source venv/bin/activate"
`;
  fs.writeFileSync(setupScriptPath, setupScriptContent);
  
  // Make the script executable
  try {
    execSync(`chmod +x "${setupScriptPath}"`);
  } catch (error) {
    console.log(`${colors.yellow}Warning: Could not make setup script executable${colors.reset}`);
  }
}

// Install the dependencies
try {
  console.log(`${colors.blue}Setting up Python virtual environment...${colors.reset}`);
  
  // Change to the backend directory and run the setup script
  process.chdir(BACKEND_DIR);
  
  // Run the setup script
  execSync(`bash setup_venv.sh`);
  
  console.log(`${colors.green}✅ Monitor API setup completed successfully${colors.reset}`);
  console.log(`\n${colors.blue}You can now run the monitor API with:${colors.reset}`);
  console.log(`${colors.yellow}cd "${BACKEND_DIR}" && source venv/bin/activate && FLASK_APP=monitor_api.py flask run --port 8000${colors.reset}`);
  console.log(`\n${colors.blue}Or using the npm script:${colors.reset}`);
  console.log(`${colors.yellow}npm run start:monitor-backend${colors.reset}`);
  
} catch (error) {
  console.error(`${colors.red}❌ Error setting up Monitor API:${colors.reset}`);
  console.error(error.message);
  process.exit(1);
}
