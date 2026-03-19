import express from 'express';
import { searchProducts } from '../controllers/commonProductController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// Все маршруты защищены — требуют токен
router.use(authMiddleware);

// GET /api/common/search?q=...
router.get('/search', searchProducts);

export default router;