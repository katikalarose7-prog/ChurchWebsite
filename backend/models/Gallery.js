import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    album: { type: String, trim: true, default: 'General' },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export default mongoose.model('Gallery', gallerySchema);
