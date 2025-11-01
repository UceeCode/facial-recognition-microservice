import { Request, Response, NextFunction } from 'express';
import { FaceRecognitionService } from '../services/faceRecognition';
import { ValidationError } from '../utils/errors';
import { ComparisonResponse } from '../types/api.types';
import { logger } from '../utils/logger';

export const compareController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        logger.info('Compare request received');
        
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
        if (!files || !files.image1 || !files.image2) {
            throw new ValidationError('Both image1 and image2 are required');
        }
    
        const file1 = files.image1[0];
        const file2 = files.image2[0];
    
        logger.info('Processing compare request', {
            image1: { filename: file1.originalname, size: file1.size },
            image2: { filename: file2.originalname, size: file2.size }
        });
    
        const result = await FaceRecognitionService.compareImages(file1, file2);
    
        const response: ComparisonResponse = {
            success: true,
            similarity: result.similarity,
            isSamePerson: result.isSamePerson,
        };
    
        logger.info('Compare request successful', { 
            similarity: result.similarity,
            isSamePerson: result.isSamePerson
        });
        
        res.status(200).json(response);
    } catch (error) {
        logger.error('Error in compare controller', {
            error,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
        });
        next(error);
    }
};