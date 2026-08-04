import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema(
  {
    story: { type: String, trim: true },
    mission: { type: String, trim: true },
    vision: { type: String, trim: true },
    beliefs: [{ title: String, description: String }],
    leaders: [
      {
        name: String,
        role: String,
        bio: String,
        image: { url: String, publicId: String },
      },
    ],
    image: { url: String, publicId: String },
  },
  { timestamps: true }
);

export default mongoose.model('About', aboutSchema);
