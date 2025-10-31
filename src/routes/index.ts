import { Router } from 'express';
import { upload } from '../middlewares/uploadHandler';
import { encodeController } from '../controllers/encodeController';
import { compareController } from '../controllers/compareController';


const router = Router();


router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.post('/encode', upload.single('image'), encodeController);

router.post(
    '/compare',
    upload.fields([
        { name: 'image1', maxCount: 1 },
        { name: 'image2', maxCount: 1 },
    ]),
    compareController
);

export default router;