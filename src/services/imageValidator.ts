import sharp from 'sharp';
import { ValidationError } from '../utils/errors';
import { config } from '../config/config';
import { logger } from '../utils/logger';


type AllowedMimeType = 'image/jpeg' | 'image/png' | 'image/jpg';

const allowedMimeTypes: AllowedMimeType[] = ['image/jpeg', 'image/png', 'image/jpg'];

export class ImageValidator {
    static validateFile(file:  Express.Multer.File | undefined): void {
        if (!file) {
            throw new ValidationError('No image file provided');
        }

        if (!allowedMimeTypes.includes(file.mimetype as AllowedMimeType)) {
            throw new ValidationError('Invalid file type. Only JPEG and PNG are accepted.');
        }

        if (file.size > config.maxFileSize) {
            throw new ValidationError(
                `File size exceeds maximum limit of ${config.maxFileSize / 1024 / 1024}MB`
            );
        }
    }


    static async validateImageIntegrity(buffer: Buffer): Promise<void> {
        try {
            const metadata = await sharp(buffer).metadata();

            if (!metadata.width || !metadata.height) {
                throw new ValidationError('Invalid image: unable to read dimensions');
            }

            if (metadata.width < 100 || metadata.height < 100) {
                throw new ValidationError('Image resolution too low (minimum 100x100)');
            }

            logger.debug('Image validated', {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
            });
            
        }  catch (error) {
            if (error instanceof ValidationError) throw error;
            throw new ValidationError('Invalid or corrupted image file');
        }
    }
}