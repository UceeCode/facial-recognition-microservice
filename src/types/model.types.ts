import * as faceapi from '@vladmandic/face-api';

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