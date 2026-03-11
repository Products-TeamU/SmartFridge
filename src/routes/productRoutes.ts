import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';

const router = express.Router();

router.get('/', authMiddleware, getAllProducts);
router.post('/', authMiddleware, createProduct);
router.get('/:id', authMiddleware, getProductById);
router.put('/:id', authMiddleware, updateProduct);
router.patch('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);


export default router;