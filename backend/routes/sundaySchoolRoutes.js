import express from 'express';
import {
  getSettings,
  createPrayerRequest,
  updateSettings,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAttendanceForDate,
  saveAttendance,
  getAttendanceHistory,
  getAttendanceSummary,
  getPrayerRequests,
  updatePrayerRequest,
  deletePrayerRequest,
  getOfferings,
  createOffering,
  deleteOffering,
  getExpenses,
  createExpense,
  deleteExpense,
  getFinanceSummary,
  getDashboardSummary,
} from '../controllers/sundaySchoolController.js';
import { protect, authorize, authorizeOwnerOr } from '../middleware/auth.js';
import { makeUploader } from '../config/cloudinary.js';

const router = express.Router();
const upload = makeUploader('sunday-school');

// FULL management (students, attendance editing, prayer requests, finance,
// settings) requires either the sunday_school_admin role, OR a super_admin
// who is specifically the owner account. A non-owner super_admin is
// deliberately NOT included here — they only get the read-only summary
// below instead of full access to this module.
const ssFullAccess = [protect, authorizeOwnerOr('sunday_school_admin')];

// Read-only overview: any super_admin (owner or not) plus sunday_school_admin.
// This is the ONLY Sunday School data a non-owner super_admin can see.
const ssOverviewAccess = [protect, authorize('super_admin', 'sunday_school_admin')];

// Public
router.get('/settings', getSettings);
router.post('/prayer-requests', createPrayerRequest);

// Read-only dashboard summary (must be registered before any full-access
// routes below, though there's no path conflict here since it's its own
// distinct path).
router.get('/dashboard-summary', ...ssOverviewAccess, getDashboardSummary);

// Admin (full access)
// upload.any() (rather than upload.single('image')) because the settings form
// now also uploads per-item images for events, winners, christmas photos, and
// gallery — each under its own predictable field name (see controller).
router.put('/settings', ...ssFullAccess, upload.any(), updateSettings);

router.get('/students', ...ssFullAccess, getStudents);
router.post('/students', ...ssFullAccess, createStudent);
router.put('/students/:id', ...ssFullAccess, updateStudent);
router.delete('/students/:id', ...ssFullAccess, deleteStudent);

// IMPORTANT: '/attendance/summary' and '/attendance/history' must be
// registered before any '/attendance/:id'-style route (there isn't one here,
// but keep this ordering if you ever add one) so Express doesn't try to
// match "summary" or "history" as an :id param.
router.get('/attendance', ...ssFullAccess, getAttendanceForDate);
router.post('/attendance', ...ssFullAccess, saveAttendance);
router.get('/attendance/history', ...ssFullAccess, getAttendanceHistory);
router.get('/attendance/summary', ...ssFullAccess, getAttendanceSummary);

router.get('/prayer-requests', ...ssFullAccess, getPrayerRequests);
router.put('/prayer-requests/:id', ...ssFullAccess, updatePrayerRequest);
router.delete('/prayer-requests/:id', ...ssFullAccess, deletePrayerRequest);

router.get('/offerings', ...ssFullAccess, getOfferings);
router.post('/offerings', ...ssFullAccess, createOffering);
router.delete('/offerings/:id', ...ssFullAccess, deleteOffering);

router.get('/expenses', ...ssFullAccess, getExpenses);
router.post('/expenses', ...ssFullAccess, createExpense);
router.delete('/expenses/:id', ...ssFullAccess, deleteExpense);

router.get('/finance-summary', ...ssFullAccess, getFinanceSummary);

export default router;
