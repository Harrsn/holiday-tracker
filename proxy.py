from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import base64

app = Flask(__name__)
CORS(app)

TRACCAR_URL = "https://tracker.wvinternet.com/api/positions"
USERNAME = "EMAIL"
PASSWORD = "PASSWORD"

@app.route('/proxy', methods=['GET'])
def proxy():
    auth_header = base64.b64encode(f"{USERNAME}:{PASSWORD}".encode()).decode()
    headers = {"Authorization": f"Basic {auth_header}"}
    response = requests.get(TRACCAR_URL, headers=headers)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
