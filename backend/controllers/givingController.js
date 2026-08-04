import asyncHandler from 'express-async-handler';
import GivingSettings from '../models/GivingSettings.js';
import Offering from '../models/Offering.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// ---------- PUBLIC ----------

// @desc    Get UPI/giving settings (QR code, UPI ID, instructions) — creates a
//          default doc if none exists yet
// @route   GET /api/giving/settings
// @access  Public
export const getGivingSettings = asyncHandler(async (req, res) => {
  let settings = await GivingSettings.findOne();
  if (!settings) settings = await GivingSettings.create({});
  res.json({ success: true, data: settings });
});

// @desc    Submit an offering intimation (name + cause, after paying via UPI)
// @route   POST /api/giving
// @access  Public
export const createOffering = asyncHandler(async (req, res) => {
  const { name, cause, amount, transactionId, note, phone } = req.body;

  if (!name || !cause) {
    res.status(400);
    throw new Error('Name and cause of offering are required');
  }

  const offering = await Offering.create({ name, cause, amount, transactionId, note, phone });

  res.status(201).json({
    success: true,
    message: 'Thank you for your generosity! Your offering has been recorded.',
    offering,
  });
});

// ---------- SUPER ADMIN ONLY ----------

// @desc    Update UPI/giving settings (QR image, UPI ID, payee name, instructions)
// @route   PUT /api/giving/settings
// @access  Private (super_admin)
export const updateGivingSettings = asyncHandler(async (req, res) => {
  let settings = await GivingSettings.findOne();
  if (!settings) settings = new GivingSettings();

  const { upiId, payeeName, instructions, isEnabled } = req.body;
  if (upiId !== undefined) settings.upiId = upiId;
  if (payeeName !== undefined) settings.payeeName = payeeName;
  if (instructions !== undefined) settings.instructions = instructions;
  if (isEnabled !== undefined) settings.isEnabled = isEnabled === 'true' || isEnabled === true;

  if (req.file) {
    if (settings.qrImage?.publicId) {
      await deleteFromCloudinary(settings.qrImage.publicId);
    }
    settings.qrImage = { url: req.file.path, publicId: req.file.filename };
  }

  await settings.save();
  res.json({ success: true, data: settings });
});

// @desc    Get all offering submissions (who gave, for what cause)
// @route   GET /api/giving
// @access  Private (super_admin)
export const getOfferings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const offerings = await Offering.find(filter).sort('-createdAt');
  res.json({ success: true, count: offerings.length, data: offerings });
});

// @desc    Update an offering's status (e.g. mark confirmed once verified in bank/UPI app)
// @route   PUT /api/giving/:id
// @access  Private (super_admin)
export const updateOffering = asyncHandler(async (req, res) => {
  const offering = await Offering.findById(req.params.id);
  if (!offering) {
    res.status(404);
    throw new Error('Offering not found');
  }
  if (req.body.status) offering.status = req.body.status;
  await offering.save();
  res.json({ success: true, data: offering });
});

// @desc    Delete an offering record
// @route   DELETE /api/giving/:id
// @access  Private (super_admin)
export const deleteOffering = asyncHandler(async (req, res) => {
  const offering = await Offering.findById(req.params.id);
  if (!offering) {
    res.status(404);
    throw new Error('Offering not found');
  }
  await offering.deleteOne();
  res.json({ success: true, message: 'Offering record deleted' });
});
