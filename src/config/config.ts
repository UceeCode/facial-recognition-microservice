import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    
    modelPath: process.env.MODEL_PATH || path.resolve(__dirname, '../../models'),
    
    similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.58'),
    minFaceSize: parseInt(process.env.MIN_FACE_SIZE || '70', 10),
    minBrightness: parseFloat(process.env.MIN_BRIGHTNESS || '25'),
    maxBrightness: parseFloat(process.env.MAX_BRIGHTNESS || '235'),
    minSharpness: parseFloat(process.env.MIN_SHARPNESS || '40'),

    minConfidence: parseFloat(process.env.MIN_CONFIDENCE || '0.4'), 
    
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],

    logLevel: process.env.LOG_LEVEL || 'info',
} as const;