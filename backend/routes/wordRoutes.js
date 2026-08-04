import express from 'express';
import {
  getWeeklyWords,
  getWeeklyWord,
  getLatestWeeklyWord,
  createWeeklyWord,
  updateWeeklyWord,
  deleteWeeklyWord,
} from '../controllers/wordController.js';
import { protect, authorize } from '../middleware/auth.js';
import { makeUploader } from '../config/cloudinary.js';

const router = express.Router();
const upload = makeUploader('weekly-word');
const adminOnly = [protect, authorize('super_admin', 'content_admin')];

router.get('/', getWeeklyWords);
router.get('/latest', getLatestWeeklyWord);
router.get('/:id', getWeeklyWord);
router.post('/', ...adminOnly, upload.single('image'), createWeeklyWord);
router.put('/:id', ...adminOnly, upload.single('image'), updateWeeklyWord);
router.delete('/:id', ...adminOnly, deleteWeeklyWord);

export default router;
