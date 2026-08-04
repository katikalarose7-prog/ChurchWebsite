import express from 'express';
import { getVideos, getVideo, getLatestVideo, createVideo, updateVideo, deleteVideo } from '../controllers/freshFireController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
const adminOnly = [protect, authorize('super_admin', 'content_admin')];

router.get('/', getVideos);
router.get('/latest', getLatestVideo);
router.get('/:id', getVideo);
router.post('/', ...adminOnly, createVideo);
router.put('/:id', ...adminOnly, updateVideo);
router.delete('/:id', ...adminOnly, deleteVideo);

export default router;
