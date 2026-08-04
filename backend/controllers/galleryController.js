import asyncHandler from 'express-async-handler';
import Gallery from '../models/Gallery.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    Get all gallery images (optionally filter by album)
// @route   GET /api/gallery
// @access  Public
export const getGalleryImages = asyncHandler(async (req, res) => {
  const { album } = req.query;
  const filter = album ? { album } : {};
  const images = await Gallery.find(filter).sort('-createdAt');
  res.json({ success: true, count: images.length, data: images });
});

// @desc    Get distinct album names
// @route   GET /api/gallery/albums
// @access  Public
export const getAlbums = asyncHandler(async (req, res) => {
  const albums = await Gallery.distinct('album');
  res.json({ success: true, albums });
});

// @desc    Upload one or more images to the gallery
// @route   POST /api/gallery
// @access  Private (content_admin, super_admin)
export const uploadGalleryImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('Please upload at least one image');
  }

  const { album, title } = req.body;

  const docs = await Promise.all(
    req.files.map((file) =>
      Gallery.create({
        title,
        album: album || 'General',
        image: { url: file.path, publicId: file.filename },
        createdBy: req.admin._id,
      })
    )
  );

  res.status(201).json({ success: true, count: docs.length, data: docs });
});

// @desc    Delete a gallery image
// @route   DELETE /api/gallery/:id
// @access  Private (content_admin, super_admin)
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const doc = await Gallery.findById(req.params.id);
  if (!doc) {
    res.status(404);
    throw new Error('Image not found');
  }

  await deleteFromCloudinary(doc.image.publicId);
  await doc.deleteOne();

  res.json({ success: true, message: 'Image deleted' });
});
