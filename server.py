# server.py
from flask import Flask, send_from_directory, request, jsonify, send_file
from flask_cors import CORS
import requests
import os
import json

app = Flask(__name__, static_folder='app')
CORS(app)

CACHE_DIR = 'data/cache'

@app.route('/')
def index():
    return send_from_directory('app', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('app', path)

# Proxy for Ollama to avoid CORS
@app.route('/ollama/<path:path>', methods=['POST'])
def ollama_proxy(path):
    resp = requests.post(f'http://localhost:11434/{path}',
                        json=request.json)
    return jsonify(resp.json())

@app.route('/cache/<image_hash>', methods=['GET'])
def get_cache(image_hash):
    cache_file = os.path.join(CACHE_DIR, f'{image_hash}.json')
    if os.path.exists(cache_file):
        return send_file(cache_file)
    else:
        return jsonify({'error': 'not found'}), 404

@app.route('/cache/<image_hash>', methods=['POST'])
def set_cache(image_hash):
    cache_file = os.path.join(CACHE_DIR, f'{image_hash}.json')
    with open(cache_file, 'w') as f:
        json.dump(request.json, f)
    return jsonify({'success': True})


if __name__ == '__main__':
    app.run(debug=True, port=3000)
