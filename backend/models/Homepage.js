import mongoose from 'mongoose';

const homepageSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: 'Welcome Home' },
    heroSubtitle: {
      type: String,
      default: 'A place to belong, believe, and become.',
    },
    heroImage: {
      url: String,
      publicId: String,
    },
    serviceTimes: [
      {
        label: { type: String, trim: true }, // e.g. "Sunday Worship"
        time: { type: String, trim: true }, // e.g. "9:00 AM & 11:00 AM"
      },
    ],
    aboutSummary: { type: String, trim: true },
    verseOfTheDay: {
      text: String,
      reference: String,
    },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    socialLinks: {
      facebook: String,
      instagram: String,
      youtube: String,
      twitter: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Homepage', homepageSchema);
