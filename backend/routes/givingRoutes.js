import express from 'express';
import {
  getGivingSettings,
  updateGivingSettings,
  createOffering,
  getOfferings,
  updateOffering,
  deleteOffering,
} from '../controllers/givingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ownerOnly } from '../middleware/ownerOnly.js';
import { makeUploader } from '../config/cloudinary.js';

const router = express.Router();
const upload = makeUploader('giving');

// Public — anyone can see the QR code/UPI ID and submit an offering intimation
router.get('/settings', getGivingSettings);
router.post('/', createOffering);

// Owner ONLY — offering records and UPI/payment settings are the most
// sensitive financial data in this app. Every Super Admin can manage
// content, but only the designated owner account can see or change these.
router.put('/settings', protect, authorize('super_admin'), ownerOnly, upload.single('qrImage'), updateGivingSettings);
router.get('/', protect, authorize('super_admin'), ownerOnly, getOfferings);
router.put('/:id', protect, authorize('super_admin'), ownerOnly, updateOffering);
router.delete('/:id', protect, authorize('super_admin'), ownerOnly, deleteOffering);

export default router;
