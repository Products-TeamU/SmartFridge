import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts
} from '../controllers/productController';

import { validate } from '../middleware/validationMiddleware';
import { productSchema } from '../validators/productValidator';


const router = express.Router();

router.get('/', authMiddleware, getAllProducts);
router.post('/', authMiddleware, validate(productSchema), createProduct);
router.get('/:id', authMiddleware, getProductById);
router.put('/:id', authMiddleware, validate(productSchema), updateProduct);
router.patch('/:id', authMiddleware, validate(productSchema), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.get('/search', authMiddleware, searchProducts);

export default router;