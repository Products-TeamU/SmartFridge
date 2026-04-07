import express from 'express';
import { createFamily, joinFamily, getFamily, removeMember } from '../controllers/familyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware); // все маршруты требуют авторизации

router.post('/create', createFamily);
router.post('/join', joinFamily);
router.get('/', getFamily);
router.delete('/member/:memberId', removeMember);

export default router;