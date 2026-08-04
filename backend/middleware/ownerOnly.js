// middleware/ownerOnly.js
//
// Blocks every Super Admin except the designated "owner" account. Must run
// after `protect` (needs req.admin). See config/owner.js for the single
// source of truth on who the owner is.
import { isOwner } from '../config/owner.js';

export const ownerOnly = (req, res, next) => {
  if (!isOwner(req.admin)) {
    res.status(403);
    throw new Error('Only the account owner can access this resource.');
  }
  next();
};
