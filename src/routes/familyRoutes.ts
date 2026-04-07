import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  createFamily,
  joinFamily,
  getFamily,
  removeMember,
  updateFamilyName,
  deleteFamily,
  leaveFamily,
} from '../controllers/familyController';

const router = express.Router();

router.use(authMiddleware); // все маршруты требуют авторизации

router.post('/create', createFamily);
router.post('/join', joinFamily);
router.get('/', getFamily);
router.delete('/member/:memberId', removeMember);
router.put('/', updateFamilyName);
router.delete('/', deleteFamily);
router.post('/leave', leaveFamily);

export default router;