import * as faceapi from 'face-api.js';

export interface FaceDetectionResult {
    detection: faceapi.FaceDetection;
    landmarks: faceapi.FaceLandmarks68;
    descriptor: Float32Array;
}

export interface QualityCheckResult {
    isGoodQuality: boolean;
    reason?: string;
    metrics: {
        brightness: number;
        sharpness: number;
        faceSize: number;
    };
}