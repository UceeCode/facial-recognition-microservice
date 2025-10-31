#!/bin/bash

mkdir -p models

# Download face-api models
echo "Downloading face recognition models..."

# SSD MobileNet V1 (face detection)
curl -L "https://github.com/vladmandic/face-api/raw/master/model/ssd_mobilenetv1_model-weights_manifest.json" -o "models/ssd_mobilenetv1_model-weights_manifest.json"
curl -L "https://github.com/vladmandic/face-api/raw/master/model/ssd_mobilenetv1_model-shard1" -o "models/ssd_mobilenetv1_model-shard1"

# Face Landmark 68 Model
curl -L "https://github.com/vladmandic/face-api/raw/master/model/face_landmark_68_model-weights_manifest.json" -o "models/face_landmark_68_model-weights_manifest.json"
curl -L "https://github.com/vladmandic/face-api/raw/master/model/face_landmark_68_model-shard1" -o "models/face_landmark_68_model-shard1"

# Face Recognition Model
curl -L "https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model-weights_manifest.json" -o "models/face_recognition_model-weights_manifest.json"
curl -L "https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model-shard1" -o "models/face_recognition_model-shard1"
curl -L "https://github.com/vladmandic/face-api/raw/master/model/face_recognition_model-shard2" -o "models/face_recognition_model-shard2"

echo "✓ Models downloaded successfully!"