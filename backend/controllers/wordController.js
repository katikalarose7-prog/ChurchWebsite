import asyncHandler from 'express-async-handler';
import WeeklyWord from '../models/WeeklyWord.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/crudFactory.js';

const opts = { imageField: 'image' };

export const getWeeklyWords = getAll(WeeklyWord, { sortBy: '-weekOf' });
export const getWeeklyWord = getOne(WeeklyWord);
export const createWeeklyWord = createOne(WeeklyWord, opts);
export const updateWeeklyWord = updateOne(WeeklyWord, opts);
export const deleteWeeklyWord = deleteOne(WeeklyWord, opts);

// @desc    Get the most recent published Weekly Word
// @route   GET /api/weekly-word/latest
// @access  Public
export const getLatestWeeklyWord = asyncHandler(async (req, res) => {
  const word = await WeeklyWord.findOne({ isPublished: true }).sort('-weekOf');
  res.json({ success: true, data: word });
});
