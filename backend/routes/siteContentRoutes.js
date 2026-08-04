import express from 'express';
import { getHomepage, updateHomepage, getAbout, updateAbout } from '../controllers/siteContentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { makeUploader } from '../config/cloudinary.js';

const homepageRouter = express.Router();
const aboutRouter = express.Router();

const heroUpload = makeUploader('homepage');
const aboutUpload = makeUploader('about');
const adminOnly = [protect, authorize('super_admin', 'content_admin')];

homepageRouter.get('/', getHomepage);
homepageRouter.put('/', ...adminOnly, heroUpload.single('heroImage'), updateHomepage);

aboutRouter.get('/', getAbout);
// .any() accepts the main "image" field plus any number of dynamically named
// leader photo fields (leaderImage_0, leaderImage_1, ...) sent from the admin
// panel, since the number of leaders is variable.
aboutRouter.put('/', ...adminOnly, aboutUpload.any(), updateAbout);

export { homepageRouter, aboutRouter };
