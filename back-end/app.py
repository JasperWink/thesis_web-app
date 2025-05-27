from flask import Flask, request, jsonify
import cv2
import numpy as np
from ultralytics import YOLO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
model = YOLO("models/yolov11l_640px.pt")
model.to("cuda")


# Nutri-score convertion
# A = 0
# B = 1
# C = 2
# D = 3
# E = 4
NUTRISCORE_DICT = {
    # Haverdrink
    "haverdrink oatly": 2,          # C
    "haverdrink ah terra": 2,       # C
    "haverdrink alpro": 0,          # A
    "haverdrink ekoplaza": 4,       # E
    "haverdrink rude health": 2,    # C
    "haverdrink natrue": 2,         # C

    # Pastasaus
    "pastasaus jumbo": 0,           # A
    "pastasaus heinz": 0,           # A
    "pastasaus spagheroni": 2,      # C
    "pastasaus ah bio": 0,          # A
    "pastasaus fertilia": 1,        # B Self assigned
    "pastasaus ekoplaza": 1,        # B

    # Koffie
    "koffie douwe egberts": 1,      # B
    "koffie cafe gondoliere": 1,    # B
    "koffie kanis gunnink": 1,      # B
    "koffie perla bio": 1,          # B
    "koffie fairtrade original": 1, # B
    "koffie ekoplaza": 0,           # A Self assigned

    # Pasta
    "pasta de cecco": 0,            # A
    "pasta rummo": 0,               # A
    "pasta ah bio": 1,              # B
    "pasta la bio idea": 1,         # B Self assigned
    "pasta la molisana": 0,         # A
    "pasta grand italia": 0,        # A

    # Pindakaas
    "pindakaas ah bio": 0,          # A
    "pindakaas whole earth": 0,     # A
    "pindakaas luna e terra": 1,    # B Self assigned
    "pindakaas calve": 0,           # A
    "pindakaas jumbo": 0,           # A
    "pindakaas skippy": 2,          # C
}


@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    # Read image
    file = request.files['image'].read()
    npimg = np.frombuffer(file, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # Run object detection model
    results = model(img) #, verbose=False)

    # Process results
    detections = []
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls)
            class_name = model.names[class_id]
            confidence = float(box.conf)
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

            detections.append({
                "class": class_name,
                "confidence": confidence,
                "nutri_score": NUTRISCORE_DICT.get(class_name, "Unknown"),
                "bbox": [x1, y1, x2 - x1, y2 - y1]  # x, y, width, height
            })

    return jsonify(detections)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8094)
