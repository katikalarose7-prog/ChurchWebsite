import asyncHandler from 'express-async-handler';
import FreshFireVideo from '../models/FreshFireVideo.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/crudFactory.js';

export const getVideos = getAll(FreshFireVideo, { sortBy: '-createdAt' });
export const getVideo = getOne(FreshFireVideo);
export const createVideo = createOne(FreshFireVideo);
export const updateVideo = updateOne(FreshFireVideo);
export const deleteVideo = deleteOne(FreshFireVideo);

// @desc    Get the single most recently added Fresh Fire video
// @route   GET /api/fresh-fire/latest
// @access  Public
export const getLatestVideo = asyncHandler(async (req, res) => {
  const video = await FreshFireVideo.findOne().sort('-createdAt');
  res.json({ success: true, data: video });
});
