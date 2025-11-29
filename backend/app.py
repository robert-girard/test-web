from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import csv
import io
from collections import defaultdict

app = Flask(__name__, static_folder='../dist', static_url_path='')
CORS(app)

def parse_can_data(csv_content):
    """Parse CAN data from CSV content."""
    messages = []
    reader = csv.DictReader(io.StringIO(csv_content))

    for row in reader:
        try:
            message = {
                'timestamp': float(row['timestamp']),
                'arbitration_id': row['arbitration_id'],
                'payload': row['payload_hex']
            }
            messages.append(message)
        except (KeyError, ValueError) as e:
            continue

    return messages

def process_isotp(messages):
    """
    Process ISO-TP multi-frame messages and collapse them into single messages.
    ISO-TP uses first byte as Protocol Control Information (PCI):
    - 0x0X: Single Frame (SF)
    - 0x1X: First Frame (FF)
    - 0x2X: Consecutive Frame (CF)
    - 0x3X: Flow Control (FC)
    """
    processed = []
    pending_multiframes = {}

    for msg in messages:
        payload_hex = msg['payload']
        arbid = msg['arbitration_id']

        if len(payload_hex) < 2:
            processed.append(msg)
            continue

        # Get first byte (PCI)
        pci = int(payload_hex[:2], 16)
        frame_type = (pci & 0xF0) >> 4

        if frame_type == 0:  # Single Frame
            # Single frame, pass through
            processed.append(msg)

        elif frame_type == 1:  # First Frame
            # Start of multi-frame message
            length = ((pci & 0x0F) << 8) | int(payload_hex[2:4], 16)
            data = payload_hex[4:]
            pending_multiframes[arbid] = {
                'timestamp': msg['timestamp'],
                'arbitration_id': arbid,
                'data': data,
                'expected_length': length,
                'sequence': 1
            }

        elif frame_type == 2:  # Consecutive Frame
            # Continuation of multi-frame message
            if arbid in pending_multiframes:
                sequence = pci & 0x0F
                data = payload_hex[2:]
                pending_multiframes[arbid]['data'] += data
                pending_multiframes[arbid]['sequence'] += 1

                # Check if complete (rough estimate based on data length)
                current_len = len(pending_multiframes[arbid]['data']) // 2
                if current_len >= pending_multiframes[arbid]['expected_length']:
                    # Multi-frame complete, add to processed
                    processed.append({
                        'timestamp': pending_multiframes[arbid]['timestamp'],
                        'arbitration_id': arbid,
                        'payload': pending_multiframes[arbid]['data']
                    })
                    del pending_multiframes[arbid]

        elif frame_type == 3:  # Flow Control
            # Flow control frame, skip
            continue

        else:
            # Unknown frame type, pass through
            processed.append(msg)

    return processed

@app.route('/api/process', methods=['POST'])
def process_csv():
    try:
        data = request.json

        filename = data.get('filename', 'No file selected')
        content = data.get('content', '')
        multiplexing = data.get('multiplexing', 'none')
        protocol = data.get('protocol', 'none')

        if not content:
            return jsonify({'error': 'No file content provided'}), 400

        # Parse CAN data from CSV
        messages = parse_can_data(content)

        if not messages:
            return jsonify({'error': 'No valid CAN messages found in CSV'}), 400

        # Process based on protocol
        if protocol == 'isotp':
            messages = process_isotp(messages)
        # Add J1939 processing here in the future

        # Gather statistics
        unique_arbids = len(set(msg['arbitration_id'] for msg in messages))

        # Add payload length to each message
        for msg in messages:
            msg['length'] = len(msg['payload']) // 2  # Convert hex string length to byte count

        response = {
            'message': f"Successfully processed {filename}",
            'total_messages': len(messages),
            'unique_arbids': unique_arbids,
            'protocol': protocol,
            'multiplexing': multiplexing,
            'messages': messages  # Include the actual processed messages
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
