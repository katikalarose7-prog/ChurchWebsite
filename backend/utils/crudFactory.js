import asyncHandler from 'express-async-handler';
import { deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * Generic CRUD factory for simple content models (Songs, Events, Sermons, etc.)
 * imageField: name of the field storing { url, publicId } — pass null if the model has no image
 */
export const getAll = (Model, { sortBy = '-createdAt', populate } = {}) =>
  asyncHandler(async (req, res) => {
    let query = Model.find();
    if (populate) query = query.populate(populate);
    const docs = await query.sort(sortBy);
    res.json({ success: true, count: docs.length, data: docs });
  });

export const getOne = (Model) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      res.status(404);
      throw new Error('Resource not found');
    }
    res.json({ success: true, data: doc });
  });

export const createOne = (Model, { imageField } = {}) =>
  asyncHandler(async (req, res) => {
    const payload = { ...req.body, createdBy: req.admin?._id };

    if (imageField && req.file) {
      payload[imageField] = { url: req.file.path, publicId: req.file.filename };
    }

    const doc = await Model.create(payload);
    res.status(201).json({ success: true, data: doc });
  });

export const updateOne = (Model, { imageField } = {}) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      res.status(404);
      throw new Error('Resource not found');
    }

    Object.assign(doc, req.body);

    if (imageField && req.file) {
      if (doc[imageField]?.publicId) {
        await deleteFromCloudinary(doc[imageField].publicId);
      }
      doc[imageField] = { url: req.file.path, publicId: req.file.filename };
    }

    await doc.save();
    res.json({ success: true, data: doc });
  });

export const deleteOne = (Model, { imageField } = {}) =>
  asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      res.status(404);
      throw new Error('Resource not found');
    }

    if (imageField && doc[imageField]?.publicId) {
      await deleteFromCloudinary(doc[imageField].publicId);
    }

    await doc.deleteOne();
    res.json({ success: true, message: 'Deleted successfully' });
  });
