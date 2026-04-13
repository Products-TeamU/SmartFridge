import express from 'express';
import {
  createFamily,
  joinFamily,
  getFamily,
  removeMember,
  updateFamilyName,
  deleteFamily,
  leaveFamily,
} from '../controllers/familyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createFamily);
router.post('/join', joinFamily);
router.post('/leave', leaveFamily);
router.get('/', getFamily);
router.delete('/member/:memberId', removeMember);
router.put('/', updateFamilyName);
router.delete('/', deleteFamily);

export default router;