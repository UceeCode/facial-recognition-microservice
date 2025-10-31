import * as faceapi from '@vladmandic/face-api';
import { loadImage, Canvas, Image } from 'canvas';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import { ValidationError } from '../utils/errors';


faceapi.env.monkeyPatch({ Canvas, Image });


export class FaceDetector {
    private static isInitialized = false;

    static async initialize(): Promise<void> {

        if (this.isInitialized) {
            logger.info('Face detector already initialized');
            return;
        }
    
        try {
            logger.info('Loading face detection models...');
                
            await faceapi.nets.ssdMobilenetv1.loadFromDisk(config.modelPath);
            await faceapi.nets.faceLandmark68Net.loadFromDisk(config.modelPath);
            await faceapi.nets.faceRecognitionNet.loadFromDisk(config.modelPath);
        
            this.isInitialized = true;
            logger.info('Face detection models loaded successfully');
        } catch (error) {
            logger.error('Failed to load face detection models', { error });
            throw new Error('Failed to initialize face detection models');
        }
    }
    

    static async detectAndEncode(imageBuffer: Buffer) {
        if (!this.isInitialized) {
            throw new Error('Face detector not initialized');
        }

        try {
            const img = await loadImage(imageBuffer);

            const detections = await faceapi
                .detectAllFaces(img as any, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptors();

            if (!detections || detections.length === 0) {
                throw new ValidationError('No face found in the provided image.');
            }

            let selectedDetection = detections[0];
            if (detections.length > 1) {
                logger.warn(`Multiple faces detected (${detections.length}), selecting largest`);
                    selectedDetection = detections.reduce((largest, current) =>
                    current.detection.box.area > largest.detection.box.area ? current : largest
                );
            }

            const { detection, landmarks, descriptor } = selectedDetection;

            if (!descriptor) {
                throw new ValidationError('Failed to generate face encoding');
            }

            return {
                detection,
                landmarks,
                descriptor,
                faceBox: {
                    x: detection.box.x,
                    y: detection.box.y,
                    width: detection.box.width,
                    height: detection.box.height,
                },
            };
        } catch (error) {
            if (error instanceof ValidationError) throw error;
            logger.error('Error during face detection', { error });
            throw new ValidationError('Failed to process image for face detection');
        }
    }
}