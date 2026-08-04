import mongoose from 'mongoose';

const sundayStudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    
    class: {
      type: String,
      enum: ['Beginners', 'Primary', 'Juniors', 'Seniors'],
      required: true,
    },
    gender: { type: String, enum: ['Boy', 'Girl'], required: true },
    phone: { type: String, trim: true },
    parentName: { type: String, trim: true },
    address: { type: String, trim: true },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

sundayStudentSchema.index({ class: 1, name: 1 });

export default mongoose.model('SundayStudent', sundayStudentSchema);
