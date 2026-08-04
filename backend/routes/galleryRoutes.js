import express from 'express';
import {
  getGalleryImages,
  getAlbums,
  uploadGalleryImages,
  deleteGalleryImage,
} from '../controllers/galleryController.js';
import { protect, authorize } from '../middleware/auth.js';
import { makeUploader } from '../config/cloudinary.js';

const router = express.Router();
const upload = makeUploader('gallery');
const adminOnly = [protect, authorize('super_admin', 'content_admin')];

router.get('/', getGalleryImages);
router.get('/albums', getAlbums);
router.post('/', ...adminOnly, upload.array('images', 10), uploadGalleryImages);
router.delete('/:id', ...adminOnly, deleteGalleryImage);

export default router;
