import mongoose from 'mongoose';

const sundayOfferingSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

sundayOfferingSchema.index({ date: -1 });

export default mongoose.model('SundayOffering', sundayOfferingSchema);
