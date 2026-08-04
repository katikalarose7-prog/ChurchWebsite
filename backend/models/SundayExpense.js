import mongoose from 'mongoose';

const sundayExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

sundayExpenseSchema.index({ date: -1 });

export default mongoose.model('SundayExpense', sundayExpenseSchema);
