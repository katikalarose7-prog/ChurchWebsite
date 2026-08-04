import express from 'express';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} from '../controllers/scheduleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const adminOnly = [protect, authorize('super_admin', 'content_admin')];

router.get('/', getSchedules);
router.get('/:id', getSchedule);
router.post('/', ...adminOnly, createSchedule);
router.put('/:id', ...adminOnly, updateSchedule);
router.delete('/:id', ...adminOnly, deleteSchedule);

export default router;
