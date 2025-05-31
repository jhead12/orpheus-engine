import os
from flask import Flask, jsonify
import psutil

app = Flask(__name__)

@app.route('/api/usage')
def usage():
    # System resource usage
    cpu_percent = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    return jsonify({
        'cpu_percent': cpu_percent,
        'ram_total': ram.total,
        'ram_used': ram.used,
        'ram_percent': ram.percent,
        'disk_total': disk.total,
        'disk_used': disk.used,
        'disk_percent': disk.percent
    })

@app.route('/api/k8s')
def k8s():
    # Kubernetes info (basic, via env or kubectl)
    k8s_namespace = os.environ.get('KUBERNETES_NAMESPACE', 'unknown')
    k8s_pod = os.environ.get('HOSTNAME', 'unknown')
    return jsonify({
        'namespace': k8s_namespace,
        'pod': k8s_pod
    })

@app.route('/api/component')
def component():
    # Example: return a config for a Message component
    return jsonify({
        'type': 'Message',
        'props': {
            'text': 'Hello from the backend!'
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
