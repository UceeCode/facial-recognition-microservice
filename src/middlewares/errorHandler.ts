import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import multer from 'multer';



export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    logger.error('Error occurred', {
        message: err.message,
        stack: err.stack,
        path: req.path,
    });


    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            error: `Upload error: ${err.message}`,
        });
    }
    

    return res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
}