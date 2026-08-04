import express from 'express';
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  resetAdminPassword,
  deleteAdmin,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import { ownerOnly } from '../middleware/ownerOnly.js';
const router = express.Router();

// Every route here requires Super Admin privileges, and only the owner
// account may actually use them (see middleware/ownerOnly.js).
router.use(protect, authorize('super_admin'), ownerOnly);

router.route('/').get(getAdmins).post(createAdmin);
router.route('/:id').put(updateAdmin).delete(deleteAdmin);
router.put('/:id/reset-password', resetAdminPassword);

export default router;
