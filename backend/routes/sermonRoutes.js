import express from 'express';
import {
  getSermons,
  getSermon,
  createSermon,
  updateSermon,
  deleteSermon,
} from '../controllers/sermonController.js';
import { protect, authorize } from '../middleware/auth.js';
import { makeUploader } from '../config/cloudinary.js';

const router = express.Router();
const upload = makeUploader('sermons');
const adminOnly = [protect, authorize('super_admin', 'content_admin')];

router.get('/', getSermons);
router.get('/:id', getSermon);
router.post('/', ...adminOnly, upload.single('thumbnail'), createSermon);
router.put('/:id', ...adminOnly, upload.single('thumbnail'), updateSermon);
router.delete('/:id', ...adminOnly, deleteSermon);

export default router;
