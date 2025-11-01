import { createApp } from './app';
import { config } from './config/config';
import { logger } from './utils/logger';
import { FaceDetector } from './models/faceDetector';

const startServer = async () => {
    try {
        logger.info('Initializing face recognition service...');
        await FaceDetector.initialize();

        const app = createApp();
        
        app.listen(config.port, () => {
            logger.info(`Server is running on port ${config.port}`, {
                environment: config.nodeEnv,
                similarityThreshold: config.similarityThreshold,
            });
        });
    } catch (error) {
        logger.error('Failed to start server', { error });
        process.exit(1);
    }
};

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection', { 
        reason,
        reasonMessage: reason instanceof Error ? reason.message : String(reason),
        reasonStack: reason instanceof Error ? reason.stack : undefined,
        promise: String(promise)
    });
    process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', { 
        error,
        errorMessage: error.message,
        errorStack: error.stack
    });
    process.exit(1);
});

startServer();