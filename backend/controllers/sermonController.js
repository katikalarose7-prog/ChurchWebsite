import Sermon from '../models/Sermon.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/crudFactory.js';

const opts = { imageField: 'thumbnail' };

export const getSermons = getAll(Sermon, { sortBy: '-datePreached' });
export const getSermon = getOne(Sermon);
export const createSermon = createOne(Sermon, opts);
export const updateSermon = updateOne(Sermon, opts);
export const deleteSermon = deleteOne(Sermon, opts);
