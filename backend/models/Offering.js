import mongoose from 'mongoose';

const offeringSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    cause: { type: String, required: true, trim: true }, // e.g. Tithe, Building Fund, Missions, General Offering
    amount: { type: Number, min: 0 },
    transactionId: { type: String, trim: true }, // UPI reference/UTR number, optional
    note: { type: String, trim: true, maxlength: 500 },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

offeringSchema.index({ createdAt: -1 });

export default mongoose.model('Offering', offeringSchema);
