from flask import Flask, jsonify
from flask_cors import CORS
import psutil
import docker
import time
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend

client = docker.from_env()
boot_time = psutil.boot_time()

@app.route('/api/metrics')
def metrics():
    """Retorna métricas reais do servidor"""
    # CPU, RAM, Disco, Rede
    cpu_percent = psutil.cpu_percent(interval=0.5)
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    net = psutil.net_io_counters()
    
    # Uptime
    uptime_seconds = time.time() - boot_time
    days = int(uptime_seconds // 86400)
    hours = int((uptime_seconds % 86400) // 3600)
    minutes = int((uptime_seconds % 3600) // 60)
    uptime_str = f"{days}d {hours}h {minutes}m"
    
    # Containers Docker
    try:
        containers = client.containers.list(all=True)
        running = [c for c in containers if c.status == 'running']
    except Exception as e:
        print(f"Erro ao acessar Docker: {e}")
        containers = []
        running = []
    
    return jsonify({
        'cpu': round(cpu_percent, 1),
        'ram': round(mem.percent, 1),
        'disk': round(disk.percent, 1),
        'network': round(net.bytes_sent / 1024 / 1024, 1),  # MB
        'uptime': uptime_str,
        'containers': len(containers),
        'containersRunning': len(running),
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
