import sharp from 'sharp';
import { config } from '../config/config';
import { QualityCheckResult } from '../types/model.types';
import { logger } from '../utils/logger';


export class QualityChecker {
    private static async calculateBrightness(buffer: Buffer): Promise<number> {
        const { data } = await sharp(buffer)
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });
    
        const sum = data.reduce((acc, val) => acc + val, 0);
        return sum / data.length;
    }

    private static async calculateSharpness(buffer: Buffer): Promise<number> {
        const { data, info } = await sharp(buffer)
            .greyscale()
            .raw()
            .toBuffer({ resolveWithObject: true });
        
            const width = info.width;
            const height = info.height;
            let variance = 0;
            let count = 0;
        
            // Simple Laplacian operator for edge detection
            for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = y * width + x;
                const laplacian =
                -data[idx - width] -
                data[idx - 1] +
                8 * data[idx] -
                data[idx + 1] -
                data[idx + width];
                variance += laplacian * laplacian;
                count++;
            }
        }
    
        return Math.sqrt(variance / count);
    }


    static async checkFaceQuality(
        imageBuffer: Buffer,
        faceBox: { x: number; y: number; width: number; height: number }
    ): Promise<QualityCheckResult> {
        try {
            const faceImage = await sharp(imageBuffer)
                .extract({
                    left: Math.max(0, Math.floor(faceBox.x)),
                    top: Math.max(0, Math.floor(faceBox.y)),
                    width: Math.floor(faceBox.width),
                    height: Math.floor(faceBox.height),
                })
                .toBuffer();
            
            const brightness = await this.calculateBrightness(faceImage);
            const sharpness = await this.calculateSharpness(faceImage);
            const faceSize = Math.min(faceBox.width, faceBox.height);

            const metrics = { brightness, sharpness, faceSize };

            if (faceSize < config.minFaceSize) {
                return {
                    isGoodQuality: false,
                    reason: `Face too small (${faceSize}px). Minimum required: ${config.minFaceSize}px`,
                    metrics,
                };
            }

            if (brightness < config.minBrightness) {
                return {
                    isGoodQuality: false,
                    reason: 'Face quality too low: insufficient lighting',
                    metrics,
                };
            }

            if (brightness > config.maxBrightness) {
                return {
                    isGoodQuality: false,
                    reason: 'Face quality too low: overexposed lighting',
                    metrics,
                };
            }
        
            if (sharpness < config.minSharpness) {
                return {
                    isGoodQuality: false,
                    reason: 'Face quality too low: image too blurry',
                    metrics,
                };
            }
            
            logger.debug('Face quality check passed', metrics);

            return {
                isGoodQuality: true,
                metrics,
            };

        } catch (error) {
            logger.error('Error checking face quality', { error });
            return {
                isGoodQuality: false,
                reason: 'Unable to assess face quality',
                metrics: { brightness: 0, sharpness: 0, faceSize: 0 },
            };
        }
    }
}