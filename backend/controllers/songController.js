import asyncHandler from 'express-async-handler';
import Song from '../models/Song.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/crudFactory.js';

const opts = { imageField: 'coverImage' };

export const getSongs = getAll(Song, { sortBy: 'title' });
export const getSong = getOne(Song);
export const createSong = createOne(Song, opts);
export const updateSong = updateOne(Song, opts);
export const deleteSong = deleteOne(Song, opts);

// @desc    Search songs by title/artist/lyrics
// @route   GET /api/songs/search?q=
// @access  Public
export const searchSongs = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({ success: true, count: 0, data: [] });
  }
  const songs = await Song.find({ $text: { $search: q } }).limit(30);
  res.json({ success: true, count: songs.length, data: songs });
});
