import mongoose from 'mongoose';

const givingSettingsSchema = new mongoose.Schema(
  {
    upiId: { type: String, trim: true }, // e.g. newcovenantchurch@okaxis
    payeeName: { type: String, trim: true, default: 'New Covenant Church' },
    qrImage: {
      url: String,
      publicId: String,
    },
    instructions: {
      type: String,
      trim: true,
      default:
        'Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm, etc.) or pay to the UPI ID below. Please let us know you gave by filling in the form so we can direct it to the right cause.',
    },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('GivingSettings', givingSettingsSchema);
