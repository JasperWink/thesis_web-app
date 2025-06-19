from flask import Flask
from flask_socketio import SocketIO, emit
import socketio as client_sio

app = Flask(__name__)
app.config['SECRET_KEY'] = 'super_secret_key'

# Client
server_sio = SocketIO(app, cors_allowed_origins="*")

# Backend
client_sio = client_sio.Client()
client_sio.connect('http://145.100.134.25:8094')

@server_sio.on('connect')
def handle_connect():
    emit('status', {'msg': 'Client connected to detection server'})

@server_sio.on('disconnect')
def handle_disconnect():
    emit('status', {'msg': 'Client disconnected from detection server'})

@server_sio.on('detect_frame')
def handle_client_message(data):
    client_sio.emit('detect_frame', data)

@client_sio.on('detection_result')
def handle_client_message(data):
    server_sio.emit('detection_result', data)

@client_sio.on('detection_error')
def handle_client_message(error):
    server_sio.emit('detection_error', error)


if __name__ == '__main__':
    server_sio.run(app, host='0.0.0.0', port=8094)
