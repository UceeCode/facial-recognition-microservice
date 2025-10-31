import { Request, Response, NextFunction } from 'express';
import { FaceRecognitionService } from '../services/faceRecognition';
import { ValidationError } from '../utils/errors';
import { EncodingResponse } from '../types/api.types';


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
    
        const encoding = await FaceRecognitionService.encodeImage(file);
    
        const response: EncodingResponse = {
            success: true,
            encoding,
        };
    
        res.status(200).json(response);
    } catch (error) {
        next(error);
    }
};