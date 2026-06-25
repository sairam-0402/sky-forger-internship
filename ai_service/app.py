from flask import Flask, request, jsonify
import os
from nlp_parser import parse_resume
from matcher import calculate_match

app = Flask(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "placement-ai-service"}), 200

@app.route('/parse', methods=['POST'])
def parse():
    data = request.get_json()
    if not data or 'file_path' not in data:
        return jsonify({"error": "Missing 'file_path' in request body"}), 400
        
    file_path = data['file_path']
    if not os.path.exists(file_path):
        return jsonify({"error": f"File not found: {file_path}"}), 404
        
    try:
        result = parse_resume(file_path)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/match', methods=['POST'])
def match():
    data = request.get_json()
    if not data or 'student' not in data or 'job' not in data:
        return jsonify({"error": "Missing 'student' or 'job' in request body"}), 400
        
    student = data['student']
    job = data['job']
    
    try:
        result = calculate_match(student, job)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
