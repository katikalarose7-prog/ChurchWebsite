import asyncHandler from 'express-async-handler';
import validator from 'validator';
import PrayerRequest from '../models/PrayerRequest.js';

// @desc    Submit a prayer request (public)
// @route   POST /api/prayer-requests
// @access  Public
export const createPrayerRequest = asyncHandler(async (req, res) => {
  const { name, email, phone, request, isAnonymousPublic, isPrivate } = req.body;

  if (!name || !request) {
    res.status(400);
    throw new Error('Name and prayer request are required');
  }

  if (email && !validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const prayerRequest = await PrayerRequest.create({
    name,
    email,
    phone,
    request,
    isAnonymousPublic: !!isAnonymousPublic,
    isPrivate: !!isPrivate,
  });

  res.status(201).json({
    success: true,
    message: 'Your prayer request has been received. Our team will be praying for you.',
    prayerRequest,
  });
});

// @desc    Get public prayer "wall" (non-private requests only, limited fields)
// @route   GET /api/prayer-requests/public
// @access  Public
export const getPublicPrayerWall = asyncHandler(async (req, res) => {
  const requests = await PrayerRequest.find({ isPrivate: false })
    .select('name request isAnonymousPublic status createdAt')
    .sort({ createdAt: -1 })
    .limit(50);

  const sanitized = requests.map((r) => ({
    _id: r._id,
    name: r.isAnonymousPublic ? 'Anonymous' : r.name,
    request: r.request,
    status: r.status,
    createdAt: r.createdAt,
  }));

  res.json({ success: true, count: sanitized.length, prayerRequests: sanitized });
});

// ---------- ADMIN ONLY (Super Admin) ----------

// @desc    Get all prayer requests (admin)
// @route   GET /api/prayer-requests
// @access  Private (super_admin)
export const getPrayerRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};

  const requests = await PrayerRequest.find(filter)
    .populate('respondedBy', 'name')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: requests.length, prayerRequests: requests });
});

// @desc    Get single prayer request
// @route   GET /api/prayer-requests/:id
// @access  Private (super_admin)
export const getPrayerRequest = asyncHandler(async (req, res) => {
  const request = await PrayerRequest.findById(req.params.id).populate('respondedBy', 'name');
  if (!request) {
    res.status(404);
    throw new Error('Prayer request not found');
  }
  res.json({ success: true, prayerRequest: request });
});

// @desc    Update status / respond to a prayer request
// @route   PUT /api/prayer-requests/:id
// @access  Private (super_admin)
export const updatePrayerRequest = asyncHandler(async (req, res) => {
  const { status, adminResponse } = req.body;

  const request = await PrayerRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Prayer request not found');
  }

  if (status) request.status = status;
  if (adminResponse !== undefined) {
    request.adminResponse = adminResponse;
    request.respondedBy = req.admin._id;
    request.respondedAt = new Date();
  }

  await request.save();
  res.json({ success: true, prayerRequest: request });
});

// @desc    Delete a prayer request
// @route   DELETE /api/prayer-requests/:id
// @access  Private (super_admin)
export const deletePrayerRequest = asyncHandler(async (req, res) => {
  const request = await PrayerRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error('Prayer request not found');
  }
  await request.deleteOne();
  res.json({ success: true, message: 'Prayer request deleted' });
});
