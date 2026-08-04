import mongoose from 'mongoose';

const sundayAttendanceSchema = new mongoose.Schema(
  {
    // Stored as a plain YYYY-MM-DD string rather than a Date, so "one record
    // per calendar day" is trivial to enforce and query regardless of time
    // zone — attendance is inherently a whole-day concept, not a timestamp.
    date: { type: String, required: true, unique: true },
    presentStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SundayStudent' }],
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export default mongoose.model('SundayAttendance', sundayAttendanceSchema);
