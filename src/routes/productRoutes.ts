import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getPersonalProducts,
  getFamilyProducts
} from '../controllers/productController';

import { validate } from '../middleware/validationMiddleware';
import { productSchema } from '../validators/productValidator';

const router = express.Router();

router.get('/search', authMiddleware, searchProducts);
router.get('/personal', authMiddleware, getPersonalProducts);
router.get('/family', authMiddleware, getFamilyProducts);


router.get('/', authMiddleware, getAllProducts);
router.post('/', authMiddleware, validate(productSchema), createProduct);
router.get('/:id', authMiddleware, getProductById);
router.put('/:id', authMiddleware, validate(productSchema), updateProduct);
router.patch('/:id', authMiddleware, validate(productSchema), updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;