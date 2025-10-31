import { FaceDetector } from '../models/faceDetector';
import { FaceComparator } from '../models/faceComparator';
import { QualityChecker } from './qualityChecker';
import { ImageValidator } from './imageValidator';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';



export class FaceRecognitionService {
    static async encodeImage(file: Express.Multer.File): Promise<number[]> {

        ImageValidator.validateFile(file);
        await ImageValidator.validateImageIntegrity(file.buffer);
    
        const result = await FaceDetector.detectAndEncode(file.buffer);
    
        const qualityCheck = await QualityChecker.checkFaceQuality(
            file.buffer,
            result.faceBox
        );
    
        if (!qualityCheck.isGoodQuality) {
            logger.warn('Face quality check failed', {
                reason: qualityCheck.reason,
                metrics: qualityCheck.metrics,
            });
            throw new ValidationError(qualityCheck.reason || 'Face quality too low for encoding');
        }
    

        const encoding = Array.from(result.descriptor);
    
        logger.info('Face encoded successfully', {
            encodingLength: encoding.length,
            faceSize: result.faceBox.width,
            quality: qualityCheck.metrics,
        });
    
        return encoding;
    }


    static async compareImages(
        file1: Express.Multer.File,
        file2: Express.Multer.File
    ) {
        logger.info('Starting face comparison');
    
        let encoding1: number[];
        let encoding2: number[];
    
        try {
            encoding1 = await this.encodeImage(file1);
        } catch (error) {
            if (error instanceof ValidationError) {
            throw new ValidationError(`${error.message} in image1`);
        }
            throw error;
        }
    
        try {
            encoding2 = await this.encodeImage(file2);
        } catch (error) {
            if (error instanceof ValidationError) {
            throw new ValidationError(`${error.message} in image2`);
        }
            throw error;
        }
    
        const result = FaceComparator.compare(
            new Float32Array(encoding1),
            new Float32Array(encoding2)
        );
    
        logger.info('Face comparison completed', result);
    
        return result;
    }
}