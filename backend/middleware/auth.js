import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import Admin from '../models/Admin.js';
import { isOwner } from '../config/owner.js';

// Verifies JWT (from Authorization header OR httpOnly cookie) and attaches admin to req
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies?.[process.env.JWT_COOKIE_NAME || 'church_token']) {
    token = req.cookies[process.env.JWT_COOKIE_NAME || 'church_token'];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized. Please log in.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      res.status(401);
      throw new Error('Account not found or deactivated.');
    }

    req.admin = admin;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized. Invalid or expired token.');
  }
});

// Restrict route to specific roles, e.g. authorize('super_admin')
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      res.status(403);
      throw new Error('You do not have permission to perform this action.');
    }
    next();
  };
};

// Like authorize(), but a plain 'super_admin' role is only sufficient if
// that account is the designated owner (see config/owner.js) — every other
// role listed is allowed unconditionally. Used for Sunday School management:
// a sunday_school_admin always has full access, but a non-owner super_admin
// is restricted to the read-only overview instead (see sundaySchoolRoutes.js).
export const authorizeOwnerOr = (...roles) => {
  return (req, res, next) => {
    const admin = req.admin;
    if (!admin) {
      res.status(401);
      throw new Error('Not authorized. Please log in.');
    }
    const allowed = roles.includes(admin.role) || (admin.role === 'super_admin' && isOwner(admin));
    if (!allowed) {
      res.status(403);
      throw new Error('You do not have permission to perform this action.');
    }
    next();
  };
};
