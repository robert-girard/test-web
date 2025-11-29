from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../dist', static_url_path='')
CORS(app)

@app.route('/api/process', methods=['POST'])
def process_csv():
    data = request.json

    csv_file = data.get('filename', 'No file selected')
    multiplexing = data.get('multiplexing', 'none')
    protocol = data.get('protocol', 'none')

    response = {
        'message': f"CSV File: {csv_file}\nMultiplexing: {multiplexing}\nProtocol: {protocol}"
    }

    return jsonify(response)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
