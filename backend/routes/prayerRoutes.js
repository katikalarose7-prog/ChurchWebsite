import express from 'express';
import {
  createPrayerRequest,
  getPublicPrayerWall,
  getPrayerRequests,
  getPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest,
} from '../controllers/prayerController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public
router.post('/', createPrayerRequest);
router.get('/public', getPublicPrayerWall);

// Private - Super Admin ONLY (Content Admin must NOT access prayer requests)
router.get('/', protect, authorize('super_admin'), getPrayerRequests);
router.get('/:id', protect, authorize('super_admin'), getPrayerRequest);
router.put('/:id', protect, authorize('super_admin'), updatePrayerRequest);
router.delete('/:id', protect, authorize('super_admin'), deletePrayerRequest);

export default router;
