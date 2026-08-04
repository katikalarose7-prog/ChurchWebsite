import express from 'express';
import {
  getEvents,
  getEvent,
  getUpcomingEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/auth.js';
import { makeUploader } from '../config/cloudinary.js';

const router = express.Router();
const upload = makeUploader('events');
const adminOnly = [protect, authorize('super_admin', 'content_admin')];

router.get('/', getEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/:id', getEvent);
router.post('/', ...adminOnly, upload.single('image'), createEvent);
router.put('/:id', ...adminOnly, upload.single('image'), updateEvent);
router.delete('/:id', ...adminOnly, deleteEvent);

export default router;
