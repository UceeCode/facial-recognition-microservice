import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Model paths
    modelPath: process.env.MODEL_PATH || './models',
    
    // Face recognition settings
    similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.6'),
    minFaceSize: parseInt(process.env.MIN_FACE_SIZE || '80', 10),
    minBrightness: parseFloat(process.env.MIN_BRIGHTNESS || '30'),
    maxBrightness: parseFloat(process.env.MAX_BRIGHTNESS || '230'),
    minSharpness: parseFloat(process.env.MIN_SHARPNESS || '50'),
    
    // Upload settings
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    
    // Logging
    logLevel: process.env.LOG_LEVEL || 'info',
} as const;