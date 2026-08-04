import mongoose from 'mongoose';

const prayerScheduleSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        'Monday - Saturday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true }, // e.g. "6:00 AM - 7:00 AM"
    focus: { type: String, trim: true }, // e.g. "Prayer for the Nation"
    location: { type: String, trim: true, default: 'Church Sanctuary' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('PrayerSchedule', prayerScheduleSchema);
