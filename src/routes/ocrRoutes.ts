import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { processReceipt } from '../controllers/ocrController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

const uploadDir = path.resolve('uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
});

router.post(
  '/receipt',
  authMiddleware,
  (req, res, next) => {
    console.log('--- OCR REQUEST START ---');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Authorization exists:', !!req.headers.authorization);
    next();
  },
  upload.single('image'),
  (req, res, next) => {
    console.log('Multer file:', req.file);
    next();
  },
  processReceipt
);

router.use(
  (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('OCR route error:', err);

    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: 'Multer error',
        error: err.message,
      });
    }

    return res.status(500).json({
      message: 'Upload error',
      error: err?.message || String(err),
    });
  }
);

export default router;