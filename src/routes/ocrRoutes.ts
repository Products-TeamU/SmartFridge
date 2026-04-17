import express from 'express';
import multer from 'multer';
import { processReceipt } from '../controllers/ocrController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
});

router.post('/receipt', authMiddleware, upload.single('image'), processReceipt);

export default router;