import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    location: { type: String, trim: true, default: 'Church Sanctuary' },
    category: {
      type: String,
      enum: ['Service', 'Conference', 'Outreach', 'Youth', 'Kids', 'Other'],
      default: 'Other',
    },
    image: {
      url: String,
      publicId: String,
    },
    registrationLink: { type: String, trim: true },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

eventSchema.index({ startDate: 1 });

export default mongoose.model('Event', eventSchema);
