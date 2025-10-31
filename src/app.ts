import express, { Application } from 'express';
import 'express-async-errors';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

export const createApp = (): Application => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        });
        next();
    });

    app.use('/', router);

    app.use((req, res) => {
        res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        });
    });

    app.use(errorHandler);

    return app;
};