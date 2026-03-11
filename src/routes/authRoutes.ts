import express from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();
router.post('/login', login);

router.post('/register', register);

export default router;