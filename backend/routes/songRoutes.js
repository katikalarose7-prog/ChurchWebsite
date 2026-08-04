import express from 'express';
import {
  getSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
  searchSongs,
} from '../controllers/songController.js';
import { protect, authorize } from '../middleware/auth.js';
import { makeUploader } from '../config/cloudinary.js';

const router = express.Router();
const upload = makeUploader('songs');

router.get('/', getSongs);
router.get('/search', searchSongs);
router.get('/:id', getSong);

router.post('/', protect, authorize('super_admin', 'content_admin'), upload.single('coverImage'), createSong);
router.put('/:id', protect, authorize('super_admin', 'content_admin'), upload.single('coverImage'), updateSong);
router.delete('/:id', protect, authorize('super_admin', 'content_admin'), deleteSong);

export default router;
