import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, trim: true },
    category: { type: String, trim: true, default: 'General' },
    lyrics: { type: String, trim: true },
    youtubeUrl: { type: String, trim: true },
    audioUrl: { type: String, trim: true },
    coverImage: {
      url: String,
      publicId: String,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

songSchema.index({ title: 'text', artist: 'text', lyrics: 'text' });

export default mongoose.model('Song', songSchema);
