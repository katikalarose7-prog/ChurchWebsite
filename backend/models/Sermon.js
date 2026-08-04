import mongoose from 'mongoose';

const sermonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    speaker: { type: String, trim: true, default: 'Pastor' },
    series: { type: String, trim: true },
    youtubeUrl: { type: String, required: true, trim: true },
    youtubeVideoId: { type: String, trim: true },
    description: { type: String, trim: true },
    datePreached: { type: Date, required: true, default: Date.now },
    thumbnail: {
      url: String,
      publicId: String,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

// Extract the YouTube video ID automatically before saving
sermonSchema.pre('save', function (next) {
  if (this.youtubeUrl) {
    const match = this.youtubeUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    if (match) this.youtubeVideoId = match[1];
  }
  next();
});

sermonSchema.index({ datePreached: -1 });

export default mongoose.model('Sermon', sermonSchema);
