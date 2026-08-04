import PrayerSchedule from '../models/PrayerSchedule.js';
import { getAll, getOne, createOne, updateOne, deleteOne } from '../utils/crudFactory.js';

export const getSchedules = getAll(PrayerSchedule, { sortBy: 'day' });
export const getSchedule = getOne(PrayerSchedule);
export const createSchedule = createOne(PrayerSchedule);
export const updateSchedule = updateOne(PrayerSchedule);
export const deleteSchedule = deleteOne(PrayerSchedule);
