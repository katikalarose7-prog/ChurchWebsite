import mongoose from 'mongoose';

const prayerRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    request: { type: String, required: true, trim: true, maxlength: 2000 },
    isAnonymousPublic: { type: Boolean, default: false }, // show name publicly on wall
    isPrivate: { type: Boolean, default: false }, // only admins can see request text
    status: {
      type: String,
      enum: ['new', 'in_progress', 'prayed', 'archived'],
      default: 'new',
    },
    adminResponse: { type: String, trim: true, maxlength: 2000 },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    respondedAt: Date,
  },
  { timestamps: true }
);

prayerRequestSchema.index({ createdAt: -1 });

export default mongoose.model('PrayerRequest', prayerRequestSchema);
