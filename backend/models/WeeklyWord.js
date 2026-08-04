import mongoose from 'mongoose';

const weeklyWordSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    scriptureReference: { type: String, required: true, trim: true }, // e.g. John 3:16
    scriptureText: { type: String, trim: true },
    message: { type: String, required: true, trim: true },
    author: { type: String, trim: true, default: 'Pastor' },
    weekOf: { type: Date, required: true, default: Date.now },
    image: {
      url: String,
      publicId: String,
    },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

weeklyWordSchema.index({ weekOf: -1 });

export default mongoose.model('WeeklyWord', weeklyWordSchema);
