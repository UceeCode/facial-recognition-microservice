import { Request, Response, NextFunction } from 'express';
import { FaceRecognitionService } from '../services/faceRecognition';
import { ValidationError } from '../utils/errors';
import { EncodingResponse } from '../types/api.types';
import { logger } from '../utils/logger';

export const encodeController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const file = req.file;
    
        if (!file) {
            throw new ValidationError('No image file provided');
        }
    
        logger.info('Processing encode request', {
            filename: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
    
        const encoding = await FaceRecognitionService.encodeImage(file);
    
        const response: EncodingResponse = {
            success: true,
            encoding,
        };
    
        logger.info('Encode request successful');
        res.status(200).json(response);
    } catch (error) {
        logger.error('Error in encode controller', {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
        });
        next(error);
    }
};