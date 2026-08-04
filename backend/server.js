import './config/loadEnv.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import prayerRoutes from './routes/prayerRoutes.js';
import songRoutes from './routes/songRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import wordRoutes from './routes/wordRoutes.js';
import sermonRoutes from './routes/sermonRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import givingRoutes from './routes/givingRoutes.js';
import sundaySchoolRoutes from './routes/sundaySchoolRoutes.js';
import freshFireRoutes from './routes/freshFireRoutes.js';

import { homepageRouter, aboutRouter } from './routes/siteContentRoutes.js';

// --- Fail fast on dangerous misconfiguration ---
// A missing or weak JWT_SECRET would let anyone forge admin tokens. Refuse
// to start rather than run insecurely — this is deliberately strict even in
// development, so the mistake gets caught long before a production deploy.
const weakSecretPlaceholders = ['replace_with_a_long_random_string', 'your_jwt_secret', 'secret', 'changeme'];
if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  weakSecretPlaceholders.includes(process.env.JWT_SECRET.toLowerCase())
) {
  console.error(
    '\nJWT_SECRET is missing, too short, or still set to the example placeholder.\n' +
      'Generate a real random one with:\n' +
      '  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
      'and set it as JWT_SECRET in backend/.env before starting the server.\n'
  );
  process.exit(1);
}

const app = express();

// Catch anything that escapes Express's own error handling so failures are
// never silent — these print full details instead of just crashing quietly.
process.on('unhandledRejection', (reason) => {
  console.error('\nUNHANDLED PROMISE REJECTION:');
  console.error(reason);
});
process.on('uncaughtException', (err) => {
  console.error('\nUNCAUGHT EXCEPTION:');
  console.error(err);
});

// Connect to MongoDB Atlas
connectDB();

// Required in production behind a reverse proxy/load balancer (Render,
// Railway, Vercel, nginx, etc.) so req.ip reflects the real visitor instead
// of the proxy — without this, rate limiting and IP-based logging are
// effectively useless (every request looks like it comes from the proxy).
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// --- Security & core middleware ---
app.use(
  helmet({
    // This API is intentionally called cross-origin by a separately hosted
    // frontend (e.g. Netlify calling a Render backend) — the default
    // same-origin resource policy is meant for apps that serve their own
    // frontend, and would be overly restrictive here.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
// 1mb is generous for this API's JSON bodies (text fields only — actual file
// uploads go through multer/multipart, not through this JSON parser).
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Access logging: verbose in development, standard combined format (with
// real client IPs, thanks to trust proxy above) in production, so incidents
// can actually be investigated instead of leaving no trail at all.
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// A light global limiter guards every route against scripted abuse/scraping,
// on top of the stricter limiters below for login and public form spam.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 300 : 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
});
app.use('/api', globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});
const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions, please try again later.' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/prayer-requests', (req, res, next) => (req.method === 'POST' ? publicFormLimiter(req, res, next) : next()));
app.use('/api/contact', (req, res, next) => (req.method === 'POST' ? publicFormLimiter(req, res, next) : next()));
app.use('/api/giving', (req, res, next) => (req.method === 'POST' ? publicFormLimiter(req, res, next) : next()));
app.use('/api/sunday-school/prayer-requests', (req, res, next) => (req.method === 'POST' ? publicFormLimiter(req, res, next) : next()));

// --- Health check ---
app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/prayer-requests', prayerRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/prayer-schedule', scheduleRoutes);
app.use('/api/weekly-word', wordRoutes);
app.use('/api/sermons', sermonRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/giving', givingRoutes);
app.use('/api/sunday-school', sundaySchoolRoutes);
app.use('/api/homepage', homepageRouter);
app.use('/api/about', aboutRouter);

app.use('/api/fresh-fire', freshFireRoutes);

// --- Error handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
