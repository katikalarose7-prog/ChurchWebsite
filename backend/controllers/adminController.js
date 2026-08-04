import asyncHandler from 'express-async-handler';
import validator from 'validator';
import Admin from '../models/Admin.js';
import { isOwner } from '../config/owner.js';

// @desc    Get all admins
// @route   GET /api/admins
// @access  Private (super_admin, owner only — see routes/adminRoutes.js)
export const getAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 });
  const withFlags = admins.map((a) => ({ ...a.toSafeObject(), isOwner: isOwner(a) }));
  res.json({ success: true, count: admins.length, admins: withFlags });
});

// @desc    Create a new admin (super or content)
// @route   POST /api/admins
// @access  Private (super_admin)
export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }

  if (role && !['super_admin', 'content_admin', 'sunday_school_admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const exists = await Admin.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An admin with this email already exists');
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    role: role || 'content_admin',
    createdBy: req.admin._id,
  });

  res.status(201).json({ success: true, admin: admin.toSafeObject() });
});

// @desc    Update an admin (role, name, isActive)
// @route   PUT /api/admins/:id
// @access  Private (super_admin)
export const updateAdmin = asyncHandler(async (req, res) => {
  const { name, role, isActive } = req.body;

  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  // Prevent a super admin from locking themselves out
  if (admin._id.equals(req.admin._id) && (role !== 'super_admin' || isActive === false)) {
    res.status(400);
    throw new Error('You cannot demote or deactivate your own account');
  }

  if (name) admin.name = name;
  if (role) admin.role = role;
  if (typeof isActive === 'boolean') admin.isActive = isActive;

  await admin.save();

  res.json({ success: true, admin: admin.toSafeObject() });
});

// @desc    Reset an admin's password
// @route   PUT /api/admins/:id/reset-password
// @access  Private (super_admin)
export const resetAdminPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error('New password must be at least 8 characters');
  }

  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  admin.password = newPassword;
  await admin.save();

  res.json({ success: true, message: 'Password reset successfully' });
});

// @desc    Delete an admin
// @route   DELETE /api/admins/:id
// @access  Private (super_admin)
export const deleteAdmin = asyncHandler(async (req, res) => {
  if (req.params.id === req.admin._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  const admin = await Admin.findById(req.params.id);
  if (!admin) {
    res.status(404);
    throw new Error('Admin not found');
  }

  await admin.deleteOne();
  res.json({ success: true, message: 'Admin removed successfully' });
});
