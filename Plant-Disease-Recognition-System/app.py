from flask import Flask, request, jsonify, send_from_directory
import numpy as np
import tensorflow as tf
import uuid
import os
import json
from flask_cors import CORS

app = Flask(__name__, static_folder='frontend/build', static_url_path='/')
CORS(app)

# Load model
model = tf.keras.models.load_model("models/plant_disease_recog_model_pwp.keras")

# Load disease mapping
with open("plant_disease.json", 'r') as file:
    plant_disease = json.load(file)

# Extract features from image
def extract_features(image_path):
    image = tf.keras.utils.load_img(image_path, target_size=(160, 160))
    image_array = tf.keras.utils.img_to_array(image)
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

# Predict disease
def model_predict(image_path):
    features = extract_features(image_path)
    prediction = model.predict(features)
    prediction_index = prediction.argmax()
    print("Prediction index:", prediction_index)
    print("Prediction data:", plant_disease[prediction_index])
    return plant_disease[prediction_index]

# Upload image endpoint (NO trailing slash)
@app.route('/upload', methods=['POST'])

def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    temp_dir = 'uploadimages'
    os.makedirs(temp_dir, exist_ok=True)
    temp_filename = f"{uuid.uuid4().hex}_{file.filename}"
    temp_path = os.path.join(temp_dir, temp_filename)
    file.save(temp_path)

    try:
        prediction = model_predict(temp_path)
        return jsonify({'prediction': prediction})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# Handle 404s intelligently
@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/upload'):
        return jsonify({'error': 'Endpoint not found'}), 404
    return send_from_directory(app.static_folder, 'index.html')

# Serve React frontend
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(debug=True)
