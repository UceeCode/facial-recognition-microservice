import multer from 'multer';
import { config } from '../config/config';

type AllowedMimeType = 'image/jpeg' | 'image/png' | 'image/jpg';

const allowedMimeTypes: AllowedMimeType[] = ['image/jpeg', 'image/png', 'image/jpg'];


export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: config.maxFileSize,
    },
    fileFilter: (_req, file, cb) => {
        if (allowedMimeTypes.includes(file.mimetype as AllowedMimeType)) {
        cb(null, true);
        } else {
        cb(new Error('Invalid file type. Only JPEG and PNG are accepted.'));
        }
    },
});