import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    
    modelPath: process.env.MODEL_PATH || path.resolve(__dirname, '../../models'),
    
    similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.6'),
    minFaceSize: parseInt(process.env.MIN_FACE_SIZE || '80', 10),
    minBrightness: parseFloat(process.env.MIN_BRIGHTNESS || '30'),
    maxBrightness: parseFloat(process.env.MAX_BRIGHTNESS || '230'),
    minSharpness: parseFloat(process.env.MIN_SHARPNESS || '50'),
    
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],

    logLevel: process.env.LOG_LEVEL || 'info',
} as const;