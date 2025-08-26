from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__, static_folder='app')
CORS(app)

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

if __name__ == '__main__':
    app.run(debug=True, port=3000)