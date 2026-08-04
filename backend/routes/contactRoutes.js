import express from 'express';
import {
  submitContact,
  getContactMessages,
  updateContactStatus,
  deleteContactMessage,
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', protect, authorize('super_admin'), getContactMessages);
router.put('/:id', protect, authorize('super_admin'), updateContactStatus);
router.delete('/:id', protect, authorize('super_admin'), deleteContactMessage);

export default router;
