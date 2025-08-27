# server.py
from flask import Flask, send_from_directory, request, jsonify, send_file
from flask_cors import CORS
import requests
import os
import json

app = Flask(__name__, static_folder='app')
CORS(app)

IMAGE_DIR = 'data/pictures'
CACHE_FILE = 'data/cache.json'
in_memory_cache = {}

def load_cache():
    global in_memory_cache
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r') as f:
            try:
                in_memory_cache = json.load(f)
            except json.JSONDecodeError:
                in_memory_cache = {} # Start fresh if file is corrupt
    else:
        # If the cache file doesn't exist, create the data directory
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        in_memory_cache = {}


def save_cache():
    with open(CACHE_FILE, 'w') as f:
        json.dump(in_memory_cache, f, indent=2)

# Load the cache when the application starts
load_cache()

@app.route('/')
def index():
    return send_from_directory('app', 'index.html')

@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_DIR, filename)

@app.route('/api/images')
def list_images():
    images = []
    # Scan recursively in IMAGE_DIR
    for root, _, files in os.walk(IMAGE_DIR):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                # Get the relative path from IMAGE_DIR to the file
                relative_path = os.path.relpath(os.path.join(root, file), IMAGE_DIR)
                images.append(relative_path.replace(os.path.sep, '/')) # Use forward slashes for URLs
    return jsonify(images)

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('app', path)

# Proxy for Ollama to avoid CORS
@app.route('/ollama/<path:path>', methods=['POST'])
def ollama_proxy(path):
    resp = requests.post(f'http://localhost:11434/{path}',
                        json=request.json)
    return jsonify(resp.json())

# cache endpoints
@app.route('/cache/<image_hash>', methods=['GET'])
def get_cache(image_hash):
    if image_hash in in_memory_cache:
        return jsonify(in_memory_cache[image_hash])
    else:
        return jsonify({'error': 'not found'}), 404

@app.route('/cache/<image_hash>', methods=['POST'])
def set_cache(image_hash):
    in_memory_cache[image_hash] = request.json
    save_cache() # Save the cache every time a new item is added
    return jsonify({'success': True})


if __name__ == '__main__':
    app.run(debug=True, port=3000)