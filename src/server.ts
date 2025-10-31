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

process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Rejection', { reason });
    process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', { error });
    process.exit(1);
});

startServer();