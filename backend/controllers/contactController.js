import asyncHandler from 'express-async-handler';
import validator from 'validator';
import Contact from '../models/Contact.js';

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
export const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    res.status(400);
    throw new Error('Name, email, and message are required');
  }

  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const contact = await Contact.create({ name: name.trim(), email, subject, message });

  res.status(201).json({
    success: true,
    message: "Thank you for reaching out. We'll get back to you soon.",
    contact,
  });
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (super_admin)
export const getContactMessages = asyncHandler(async (req, res) => {
  const messages = await Contact.find().sort('-createdAt');
  res.json({ success: true, count: messages.length, data: messages });
});

// @desc    Update message status (read/replied)
// @route   PUT /api/contact/:id
// @access  Private (super_admin)
export const updateContactStatus = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error('Message not found');
  }
  contact.status = req.body.status || contact.status;
  await contact.save();
  res.json({ success: true, data: contact });
});

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private (super_admin)
export const deleteContactMessage = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error('Message not found');
  }
  await contact.deleteOne();
  res.json({ success: true, message: 'Message deleted' });
});
