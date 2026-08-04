import mongoose from 'mongoose';

const freshFireVideoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    youtubeUrl: { type: String, required: true, trim: true },
    youtubeVideoId: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

// Extract the YouTube video ID automatically before saving (same pattern as Sermon)
freshFireVideoSchema.pre('save', function (next) {
  if (this.youtubeUrl) {
    const match = this.youtubeUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    if (match) this.youtubeVideoId = match[1];
  }
  next();
});

freshFireVideoSchema.index({ createdAt: -1 });

export default mongoose.model('FreshFireVideo', freshFireVideoSchema);
