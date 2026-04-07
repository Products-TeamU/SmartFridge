import express from 'express';
import { register, login, updateProfile } from '../controllers/authController';
import { validate } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema } from '../validators/authValidator';
import { forgotPassword, resetPassword } from '../controllers/passwordController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.put('/update-profile', authMiddleware, updateProfile);
export default router;