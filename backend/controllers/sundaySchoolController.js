import asyncHandler from 'express-async-handler';
import SundayStudent from '../models/SundayStudent.js';
import SundayAttendance from '../models/SundayAttendance.js';
import SundayPrayerRequest from '../models/SundayPrayerRequest.js';
import SundayOffering from '../models/SundayOffering.js';
import SundayExpense from '../models/SundayExpense.js';
import SundaySchoolSettings from '../models/SundaySchoolSettings.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// ================= PUBLIC =================

// @desc    Get Sunday School public page content
// @route   GET /api/sunday-school/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await SundaySchoolSettings.findOne();
  if (!settings) settings = await SundaySchoolSettings.create({});
  res.json({ success: true, data: settings });
});

// @desc    Submit a Sunday School prayer request (public, e.g. from a parent)
// @route   POST /api/sunday-school/prayer-requests
// @access  Public
export const createPrayerRequest = asyncHandler(async (req, res) => {
  const { name, studentClass, request } = req.body;
  if (!name || !request) {
    res.status(400);
    throw new Error('Name and prayer request are required');
  }
  const prayerRequest = await SundayPrayerRequest.create({ name, studentClass, request });
  res.status(201).json({
    success: true,
    message: 'Thank you — your prayer request has been received.',
    prayerRequest,
  });
});

// ================= ADMIN (super_admin, sunday_school_admin only) =================

// ---- Settings ----

// Small helper: parse a JSON-stringified field from multipart form-data,
// falling back to the existing value if it's missing or malformed.
const parseJsonField = (raw, fallback) => {
  if (raw === undefined) return fallback;
  if (typeof raw !== 'string') return raw; // already an object/array (e.g. non-multipart JSON body)
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

// Index uploaded files (from upload.any()) by their fieldname for quick lookup.
// Frontend sends nested-array images under predictable field names:
//   eventImage_<i>, winnerGroupImage_<wi>, winnerStudentImage_<wi>_<si>,
//   christmasImage_<i>, galleryImage_<i>, plus the existing 'image' for the banner.
const filesByField = (files) => {
  const map = {};
  (files || []).forEach((f) => {
    map[f.fieldname] = f;
  });
  return map;
};

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await SundaySchoolSettings.findOne();
  if (!settings) settings = new SundaySchoolSettings();

  const { title, description } = req.body;
  if (title !== undefined) settings.title = title;
  if (description !== undefined) settings.description = description;

  if (req.body.classes !== undefined) {
    settings.classes = parseJsonField(req.body.classes, settings.classes);
  }
  if (req.body.schedule !== undefined) {
    settings.schedule = parseJsonField(req.body.schedule, settings.schedule);
  }

  const filesMap = filesByField(req.files);
  const cleanupPromises = [];
  const cleanupImage = (img) => {
    if (img?.publicId) cleanupPromises.push(deleteFromCloudinary(img.publicId));
  };

  // ---- Main banner image ----
  const mainImageFile = filesMap['image'];
  if (mainImageFile) {
    cleanupImage(settings.image);
    settings.image = { url: mainImageFile.path, publicId: mainImageFile.filename };
  }

  // ---- Events ----
  if (req.body.events !== undefined) {
    const incomingEvents = parseJsonField(req.body.events, []);
    const previousEvents = settings.events || [];
    settings.events = incomingEvents.map((ev, i) => {
      const file = filesMap[`eventImage_${i}`];
      if (file) {
        cleanupImage(previousEvents[i]?.image);
        return { ...ev, image: { url: file.path, publicId: file.filename } };
      }
      // No new file this save — keep whatever image the client still had (already-saved one)
      return { ...ev, image: ev.image?.url ? ev.image : previousEvents[i]?.image };
    });
  }

  // ---- Winners ----
  if (req.body.winners !== undefined) {
    const incomingWinners = parseJsonField(req.body.winners, []);
    const previousWinners = settings.winners || [];
    settings.winners = incomingWinners.map((w, wi) => {
      const groupFile = filesMap[`winnerGroupImage_${wi}`];
      let groupImage = w.groupImage?.url ? w.groupImage : previousWinners[wi]?.groupImage;
      if (groupFile) {
        cleanupImage(previousWinners[wi]?.groupImage);
        groupImage = { url: groupFile.path, publicId: groupFile.filename };
      }

      const students = (w.students || []).map((s, si) => {
        const studentFile = filesMap[`winnerStudentImage_${wi}_${si}`];
        let image = s.image?.url ? s.image : previousWinners[wi]?.students?.[si]?.image;
        if (studentFile) {
          cleanupImage(previousWinners[wi]?.students?.[si]?.image);
          image = { url: studentFile.path, publicId: studentFile.filename };
        }
        return { ...s, image };
      });

      return { ...w, groupImage, students };
    });
  }

  // ---- Christmas ----
  if (req.body.christmas !== undefined) {
    const incomingChristmas = parseJsonField(req.body.christmas, {});
    const previousChristmasImages = settings.christmas?.images || [];
    const images = (incomingChristmas.images || []).map((img, i) => {
      const file = filesMap[`christmasImage_${i}`];
      if (file) {
        cleanupImage(previousChristmasImages[i]);
        return { ...img, url: file.path, publicId: file.filename };
      }
      return img.url ? img : previousChristmasImages[i];
    });
    settings.christmas = { ...incomingChristmas, images };
  }

  // ---- Gallery ----
  if (req.body.gallery !== undefined) {
    const incomingGallery = parseJsonField(req.body.gallery, []);
    const previousGallery = settings.gallery || [];
    settings.gallery = incomingGallery.map((img, i) => {
      const file = filesMap[`galleryImage_${i}`];
      if (file) {
        cleanupImage(previousGallery[i]);
        return { ...img, url: file.path, publicId: file.filename };
      }
      return img.url ? img : previousGallery[i];
    });
  }

  await Promise.allSettled(cleanupPromises);
  await settings.save();
  res.json({ success: true, data: settings });
});

// ---- Students ----
export const getStudents = asyncHandler(async (req, res) => {
  const { class: studentClass } = req.query;
  const filter = studentClass ? { class: studentClass } : {};
  const students = await SundayStudent.find(filter).sort('name');
  res.json({ success: true, count: students.length, data: students });
});

export const createStudent = asyncHandler(async (req, res) => {
  const { name, class: studentClass } = req.body;
  if (!name || !studentClass) {
    res.status(400);
    throw new Error('Name and class are required');
  }
  const student = await SundayStudent.create(req.body);
  res.status(201).json({ success: true, data: student });
});

export const updateStudent = asyncHandler(async (req, res) => {
  const student = await SundayStudent.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  Object.assign(student, req.body);
  await student.save();
  res.json({ success: true, data: student });
});

export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await SundayStudent.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  await student.deleteOne();
  res.json({ success: true, message: 'Student removed' });
});

// ---- Attendance ----

// Build a YYYY-MM-DD string from LOCAL date parts. Do NOT use
// date.toISOString().slice(0, 10) here — toISOString() converts to UTC
// first, which can shift the calendar date backward depending on the
// server's timezone offset from the admin's local time.
const toLocalISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// @desc    Get attendance for a specific date (defaults to today), plus every
//          active student so the admin UI can render a full checklist
// @route   GET /api/sunday-school/attendance?date=YYYY-MM-DD
export const getAttendanceForDate = asyncHandler(async (req, res) => {
  const date = req.query.date || toLocalISO(new Date());

  const [students, record] = await Promise.all([
    SundayStudent.find({ isActive: true }).sort('class name'),
    SundayAttendance.findOne({ date }),
  ]);

  const presentIds = new Set((record?.presentStudents || []).map((id) => id.toString()));

  res.json({
    success: true,
    date,
    presentCount: presentIds.size,
    totalStudents: students.length,
    students: students.map((s) => ({
      _id: s._id,
      name: s.name,
      class: s.class,
      present: presentIds.has(s._id.toString()),
    })),
  });
});

// @desc    Save attendance for a date (replaces the present-list for that date)
// @route   POST /api/sunday-school/attendance
export const saveAttendance = asyncHandler(async (req, res) => {
  const { date, presentStudents } = req.body;
  if (!date || !Array.isArray(presentStudents)) {
    res.status(400);
    throw new Error('Date and a list of present student IDs are required');
  }

  const record = await SundayAttendance.findOneAndUpdate(
    { date },
    { date, presentStudents, markedBy: req.admin._id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, data: record, presentCount: presentStudents.length });
});

// @desc    Attendance summary across recent dates (for a simple trend view)
// @route   GET /api/sunday-school/attendance/history
export const getAttendanceHistory = asyncHandler(async (req, res) => {
  const records = await SundayAttendance.find().sort('-date').limit(12);
  res.json({
    success: true,
    data: records.map((r) => ({ date: r.date, presentCount: r.presentStudents.length })),
  });
});

// @desc    Per-student attendance count across a date range, counting Sundays only.
//          Used by the Students Report to show "days attended" for a chosen
//          month or custom range.
// @route   GET /api/sunday-school/attendance/summary?from=YYYY-MM-DD&to=YYYY-MM-DD
export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    res.status(400);
    throw new Error('from and to query params are required (YYYY-MM-DD)');
  }

  // Validate the format/order WITHOUT changing what we actually query with.
  // `SundayAttendance.date` is stored as a plain YYYY-MM-DD STRING, so it
  // must be queried with STRING bounds. Comparing it against `Date` objects
  // (as this route previously did) silently matches zero documents: Mongo's
  // $gte/$lte compare by BSON type first, and a String field is always
  // considered "less than" a Date value, so `date: { $gte: someDate }`
  // can never be true for a String-typed field — the query returns nothing
  // no matter what's actually saved.
  const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateFormat.test(from) || !dateFormat.test(to)) {
    res.status(400);
    throw new Error('from and to must be in YYYY-MM-DD format');
  }
  if (from > to) {
    res.status(400);
    throw new Error('Invalid date range');
  }

  // YYYY-MM-DD strings sort lexicographically in the same order as
  // chronological order, so plain string comparison works correctly here.
  const records = await SundayAttendance.find({ date: { $gte: from, $lte: to } }).lean();

  // Defensive filter: only count records that actually fall on a Sunday,
  // in case a non-Sunday date was ever saved. Parse as a local date (not
  // UTC) so the day-of-week check matches what the admin actually saw
  // when they saved it.
  const isSunday = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).getDay() === 0;
  };
  const sundayRecords = records.filter((r) => isSunday(r.date));
  const totalSundays = sundayRecords.length;

  const counts = {};
  sundayRecords.forEach((r) => {
    (r.presentStudents || []).forEach((id) => {
      const key = id.toString();
      counts[key] = (counts[key] || 0) + 1;
    });
  });

  // Merge onto the full student roster so 0-attendance students still appear
  const students = await SundayStudent.find({}).select('_id').lean();

  const data = students.map((s) => ({
    studentId: s._id,
    presentCount: counts[s._id.toString()] || 0,
    totalSundays,
  }));

  res.json({
    success: true,
    totalSundays,
    sundayDates: sundayRecords.map((r) => r.date),
    data,
  });
});

// ---- Prayer Requests ----
export const getPrayerRequests = asyncHandler(async (req, res) => {
  const requests = await SundayPrayerRequest.find().sort('-createdAt');
  res.json({ success: true, count: requests.length, data: requests });
});

export const updatePrayerRequest = asyncHandler(async (req, res) => {
  const request = await SundayPrayerRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Prayer request not found');
  }
  if (req.body.status) request.status = req.body.status;
  await request.save();
  res.json({ success: true, data: request });
});

export const deletePrayerRequest = asyncHandler(async (req, res) => {
  const request = await SundayPrayerRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Prayer request not found');
  }
  await request.deleteOne();
  res.json({ success: true, message: 'Prayer request deleted' });
});

// ---- Offerings ----
export const getOfferings = asyncHandler(async (req, res) => {
  const offerings = await SundayOffering.find().sort('-date');
  res.json({ success: true, count: offerings.length, data: offerings });
});

export const createOffering = asyncHandler(async (req, res) => {
  const { date, amount, note } = req.body;
  if (!date || amount === undefined) {
    res.status(400);
    throw new Error('Date and amount are required');
  }
  const offering = await SundayOffering.create({ date, amount, note, recordedBy: req.admin._id });
  res.status(201).json({ success: true, data: offering });
});

export const deleteOffering = asyncHandler(async (req, res) => {
  const offering = await SundayOffering.findById(req.params.id);
  if (!offering) {
    res.status(404);
    throw new Error('Offering record not found');
  }
  await offering.deleteOne();
  res.json({ success: true, message: 'Offering record deleted' });
});

// ---- Expenses ----
export const getExpenses = asyncHandler(async (req, res) => {
  const expenses = await SundayExpense.find().sort('-date');
  res.json({ success: true, count: expenses.length, data: expenses });
});

export const createExpense = asyncHandler(async (req, res) => {
  const { title, date, amount } = req.body;
  if (!title || !date || amount === undefined) {
    res.status(400);
    throw new Error('Title, date, and amount are required');
  }
  const expense = await SundayExpense.create({ ...req.body, recordedBy: req.admin._id });
  res.status(201).json({ success: true, data: expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await SundayExpense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  await expense.deleteOne();
  res.json({ success: true, message: 'Expense deleted' });
});

// ---- Finance summary ----
// @desc    Total offerings, total expenses, and the remaining balance
// @route   GET /api/sunday-school/finance-summary
export const getFinanceSummary = asyncHandler(async (req, res) => {
  const [offeringAgg, expenseAgg] = await Promise.all([
    SundayOffering.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    SundayExpense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
  ]);

  const totalOfferings = offeringAgg[0]?.total || 0;
  const totalExpenses = expenseAgg[0]?.total || 0;

  res.json({
    success: true,
    data: {
      totalOfferings,
      totalExpenses,
      remaining: totalOfferings - totalExpenses,
    },
  });
});

// ---- Read-only dashboard summary (for non-owner Super Admins) ----
// @desc    A single lightweight overview — no student lists, no attendance
//          editing, no line-item financial detail — just top-line numbers.
//          This is deliberately the ONLY Sunday School data a non-owner
//          Super Admin can see; every other route in this file requires
//          sunday_school_admin or the owner account (see routes file).
// @route   GET /api/sunday-school/dashboard-summary
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const [totalStudents, todayRecord, offeringAgg, expenseAgg, prayerCount] = await Promise.all([
    SundayStudent.countDocuments({ isActive: true }),
    SundayAttendance.findOne({ date: today }),
    SundayOffering.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    SundayExpense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    SundayPrayerRequest.countDocuments(),
  ]);

  const totalOfferings = offeringAgg[0]?.total || 0;
  const totalExpenses = expenseAgg[0]?.total || 0;

  res.json({
    success: true,
    data: {
      totalStudents,
      presentToday: todayRecord?.presentStudents?.length || 0,
      totalOfferings,
      totalExpenses,
      remaining: totalOfferings - totalExpenses,
      prayerRequestCount: prayerCount,
    },
  });
});