import express from 'express';
import { searchProducts, getProductByBarcode } from '../controllers/openFoodFactsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware); // если нужна авторизация

router.get('/search', searchProducts);
router.get('/product/:barcode', getProductByBarcode);

export default router;