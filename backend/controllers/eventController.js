import asyncHandler from 'express-async-handler';
import Event from '../models/Event.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/crudFactory.js';

const opts = { imageField: 'image' };

export const getEvents = getAll(Event, { sortBy: 'startDate' });
export const getEvent = getOne(Event);
export const createEvent = createOne(Event, opts);
export const updateEvent = updateOne(Event, opts);
export const deleteEvent = deleteOne(Event, opts);

// @desc    Get only upcoming events (public homepage widget)
// @route   GET /api/events/upcoming
// @access  Public
export const getUpcomingEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ startDate: { $gte: new Date() } })
    .sort('startDate')
    .limit(6);
  res.json({ success: true, count: events.length, data: events });
});
