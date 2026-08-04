import asyncHandler from 'express-async-handler';
import Homepage from '../models/Homepage.js';
import About from '../models/About.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// multipart/form-data (used whenever an image upload is involved) can only
// carry plain strings — so array/object fields like serviceTimes, beliefs,
// etc. are sent as JSON.stringify()'d text and need to be parsed back into
// real objects before being assigned to the Mongoose document. A regular
// JSON request body would already have these as real objects/arrays, so we
// only parse the ones that actually came through as strings.
const parseJSONFields = (body, fields) => {
  const parsed = { ...body };
  fields.forEach((field) => {
    if (typeof parsed[field] === 'string') {
      try {
        parsed[field] = JSON.parse(parsed[field]);
      } catch {
        delete parsed[field]; // malformed JSON — skip rather than crash the save
      }
    }
  });
  return parsed;
};

// ---------- HOMEPAGE (singleton document) ----------

// @desc    Get homepage content (creates a default doc if none exists)
// @route   GET /api/homepage
// @access  Public
export const getHomepage = asyncHandler(async (req, res) => {
  let homepage = await Homepage.findOne();
  if (!homepage) homepage = await Homepage.create({});
  res.json({ success: true, data: homepage });
});

// @desc    Update homepage content
// @route   PUT /api/homepage
// @access  Private (content_admin, super_admin)
export const updateHomepage = asyncHandler(async (req, res) => {
  let homepage = await Homepage.findOne();
  if (!homepage) homepage = new Homepage();

  const body = parseJSONFields(req.body, ['serviceTimes', 'verseOfTheDay', 'socialLinks']);
  Object.assign(homepage, body);

  if (req.file) {
    if (homepage.heroImage?.publicId) {
      await deleteFromCloudinary(homepage.heroImage.publicId);
    }
    homepage.heroImage = { url: req.file.path, publicId: req.file.filename };
  }

  await homepage.save();
  res.json({ success: true, data: homepage });
});

// ---------- ABOUT (singleton document) ----------

// @desc    Get about page content
// @route   GET /api/about
// @access  Public
export const getAbout = asyncHandler(async (req, res) => {
  let about = await About.findOne();
  if (!about) about = await About.create({});
  res.json({ success: true, data: about });
});

// @desc    Update about page content
// @route   PUT /api/about
// @access  Private (content_admin, super_admin)
export const updateAbout = asyncHandler(async (req, res) => {
  let about = await About.findOne();
  if (!about) about = new About();

  const body = parseJSONFields(req.body, ['beliefs', 'leaders']);

  // req.files is an array here (multer .any()), not a single req.file, since
  // this route accepts the main hero image plus a variable number of
  // per-leader photos (fieldnames like "leaderImage_0", "leaderImage_1", ...).
  const files = req.files || [];
  const mainImageFile = files.find((f) => f.fieldname === 'image');
  const leaderImageFiles = files.filter((f) => f.fieldname.startsWith('leaderImage_'));

  // Preserve each leader's existing image unless a new photo was uploaded for
  // that specific index — the frontend sends the full leaders array (titles/
  // bios/existing image data) as JSON, and only attaches a File for whichever
  // leaders actually got a new photo picked.
  if (Array.isArray(body.leaders)) {
    for (const file of leaderImageFiles) {
      const index = Number(file.fieldname.replace('leaderImage_', ''));
      if (Number.isNaN(index) || !body.leaders[index]) continue;

      const oldPublicId = about.leaders?.[index]?.image?.publicId;
      if (oldPublicId) await deleteFromCloudinary(oldPublicId);

      body.leaders[index].image = { url: file.path, publicId: file.filename };
    }
  }

  Object.assign(about, body);

  if (mainImageFile) {
    if (about.image?.publicId) {
      await deleteFromCloudinary(about.image.publicId);
    }
    about.image = { url: mainImageFile.path, publicId: mainImageFile.filename };
  }

  await about.save();
  res.json({ success: true, data: about });
});
