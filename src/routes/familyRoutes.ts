import express from 'express';
import { createFamily, joinFamily, getFamily, removeMember, updateFamilyName, deleteFamily } from '../controllers/familyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware); // все маршруты требуют авторизации

router.post('/create', createFamily);
router.post('/', createFamily);   // добавить эту строку
router.post('/join', joinFamily);
router.get('/', getFamily);
router.delete('/member/:memberId', removeMember);
router.put('/', updateFamilyName);
router.delete('/', deleteFamily);

export default router;