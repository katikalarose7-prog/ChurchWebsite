import mongoose from 'mongoose';

const sundayPrayerRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    studentClass: {
      type: String,
      enum: ['Beginners', 'Primary', 'Juniors', 'Seniors', ''],
      default: '',
    },
    request: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['new', 'prayed'],
      default: 'new',
    },
  },
  { timestamps: true }
);

sundayPrayerRequestSchema.index({ createdAt: -1 });

export default mongoose.model('SundayPrayerRequest', sundayPrayerRequestSchema);
