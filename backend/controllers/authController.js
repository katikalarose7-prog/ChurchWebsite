import asyncHandler from 'express-async-handler';
import Admin from '../models/Admin.js';
import { generateToken, setTokenCookie } from '../utils/generateToken.js';
import { isOwner } from '../config/owner.js';

// isOwner is computed here rather than stored in the DB — it's derived
// purely from the account's email matching config/owner.js, so there's
// nothing to keep in sync and no way for it to drift from the source of truth.
const withOwnerFlag = (admin) => ({ ...admin.toSafeObject(), isOwner: isOwner(admin) });

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');

  // Deliberately use the same generic message whether the account doesn't
  // exist or the password is wrong, so this endpoint can't be used to
  // enumerate which emails have admin accounts.
  if (!admin) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (admin.isLocked()) {
    res.status(423);
    throw new Error('This account is temporarily locked due to repeated failed login attempts. Please try again in 15 minutes.');
  }

  if (!(await admin.comparePassword(password))) {
    await admin.recordFailedLogin();
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!admin.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  await admin.resetFailedLogins();
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = generateToken(admin._id, admin.role);
  setTokenCookie(res, token);

  res.json({
    success: true,
    token,
    admin: withOwnerFlag(admin),
  });
});

// @desc    Get currently logged-in admin
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: withOwnerFlag(req.admin) });
});

// @desc    Logout admin (clears cookie)
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(process.env.JWT_COOKIE_NAME || 'church_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Update own password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin._id).select('+password');

  if (!(await admin.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  admin.password = newPassword;
  await admin.save();

  res.json({ success: true, message: 'Password updated successfully' });
});
