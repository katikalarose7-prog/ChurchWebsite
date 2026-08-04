# Grace Sanctuary — Church Website (PWA)

A mobile-first, installable church website built as a Progressive Web App.

**Stack:** React (Vite) · Node.js/Express · MongoDB Atlas · Cloudinary · JWT Auth · Tailwind CSS · Framer Motion

---

## ✨ Features

**Public site**
Home · About · Prayer Requests (+ public prayer wall) · Songs (searchable, with lyrics) · Weekly Prayer Schedule · Weekly Word · Sermons (YouTube) · Events · Gallery (albums) · Contact

**Admin Panel** — two roles, enforced both in the UI and on every API route:
- **Super Admin** — full access, including Prayer Requests and Admin account management.
- **Content Admin** — manages Songs, Weekly Word, Prayer Schedule, Sermons, Events, Gallery, and Homepage content. Cannot see Prayer Requests or manage admins.

**App-like UX**
- Bottom tab navigation on mobile, top nav on desktop.
- Installable PWA (Web App Manifest + Service Worker via `vite-plugin-pwa`) with a custom install prompt for Android (`beforeinstallprompt`) and iOS ("Add to Home Screen" instructions).
- Offline-friendly caching for images (Cloudinary) and API responses.

---

## 📁 Folder Structure

```
church-website/
├── backend/
│   ├── config/        # MongoDB + Cloudinary setup
│   ├── models/        # Mongoose schemas
│   ├── middleware/     # JWT auth, role authorization, error handling
│   ├── controllers/    # Route handlers (+ generic CRUD factory)
│   ├── routes/         # Express routers
│   ├── utils/          # JWT helpers, seed script
│   └── server.js
└── frontend/
    ├── public/          # manifest icons, favicon
    └── src/
        ├── api/         # Axios instance
        ├── context/     # Auth context
        ├── components/  # Reusable UI (nav, layout, install prompt, etc.)
        └── pages/
            ├── admin/    # Admin panel (role-protected)
            └── *.jsx     # Public pages
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB)
- A [Cloudinary](https://cloudinary.com) account (free tier is fine)

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB Atlas URI, Cloudinary credentials, and a strong JWT_SECRET
npm install
npm run seed:admin   # creates your first Super Admin from SUPER_ADMIN_* values in .env
npm run dev          # starts the API on http://localhost:5000
```

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev           # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000` (see `vite.config.js`), so both servers can run side by side during development.

### 4. Log in to the Admin Panel
Go to `http://localhost:5173/admin/login` and sign in with the Super Admin credentials you set in `backend/.env` before seeding. From there, use **Manage Admins** to create Content Admin accounts for your team.

---

## 🏗️ Production Deployment Notes

- **Backend**: deploy to any Node host (Render, Railway, Fly.io, an EC2/VPS, etc.). Set all variables from `.env.example` in your host's environment settings. Set `NODE_ENV=production` and `CLIENT_URL` to your deployed frontend origin (for CORS + secure cookies).
- **Frontend**: `npm run build` produces a static `dist/` folder (Vite) — deploy to Vercel, Netlify, Cloudflare Pages, or serve via any static host/CDN. Update `vite.config.js`'s dev proxy or set `VITE_API_URL`/a reverse-proxy rewrite so `/api` reaches your deployed backend in production.
- **MongoDB Atlas**: whitelist your backend host's IP (or `0.0.0.0/0` for platforms with dynamic IPs, combined with a strong DB user password).
- **Cloudinary**: no extra config needed beyond the three env vars; uploaded images are organized into folders like `church-website/songs`, `church-website/events`, etc.
- **HTTPS is required** for the PWA install prompt and service worker to function on real devices — most static/host providers provide this by default.
- Regenerate the icons in `frontend/public/icons/` with your own church branding/logo before launch (192×192, 512×512, and a 512×512 maskable icon).

---

## 🔒 Security Notes

**Authentication & accounts**
- Passwords are hashed with bcrypt (12 rounds).
- JWT is issued on login and sent as a `Bearer` header (used by the frontend by default); an httpOnly, `sameSite: lax` cookie is also set as a same-site fallback — it's deliberately never `sameSite: none`, since that would let a malicious third-party site auto-attach it to forged cross-site requests (CSRF). The Bearer header, which browsers never attach cross-site on their own, is the mechanism that's actually safe from CSRF.
- Login failures are throttled two ways: an IP-based rate limit (10 attempts / 15 min) and a per-account lockout (5 wrong passwords locks that specific account for 15 minutes) — so switching IPs doesn't bypass the protection.
- The login endpoint returns the same generic error for "no such account" and "wrong password," so it can't be used to check which emails have admin access.
- The server refuses to start if `JWT_SECRET` is missing, too short, or still the example placeholder from `.env.example` — this is checked at boot, not discovered later in production.

**Request & input handling**
- `express-mongo-sanitize` strips Mongo operator injection attempts (`$`, `.`) from input.
- Email fields on every public form (Contact, Prayer Requests, admin creation) are validated with a real email-format check, not just a truthiness check.
- Image uploads are checked by both MIME type and file extension (MIME type alone is client-supplied and can be spoofed), capped at 8MB, and re-encoded through Cloudinary.
- JSON request bodies are capped at 1MB — file uploads go through a separate multipart path with its own limit, so this isn't blocking legitimate uploads.
- Rate limiting: a light global limit across all of `/api` (300 req/15min) guards against scripted abuse, on top of the stricter limits on login and public form submissions (Prayer Requests, Contact, Giving).

**Transport & headers**
- `helmet` sets HSTS, `X-Frame-Options: DENY` (clickjacking), `X-Content-Type-Options: nosniff`, and a cross-origin resource policy appropriate for an API that's intentionally called from a separately-hosted frontend.
- `app.set('trust proxy', 1)` is enabled in production so rate limiting and access logs see the real visitor IP, not your hosting platform's proxy IP.
- Access logs use Morgan's `combined` format in production (so there's an actual audit trail) and the more verbose `dev` format locally.

**Authorization**
- Role checks happen server-side on every protected route — the frontend's role-based UI is a convenience layer, not the security boundary. Verified directly: Content Admins get a real `403`/`401` if they try to hit Prayer Requests, Offerings, or Admin-management endpoints, not just a hidden button.

**Still your responsibility before going live**
- Rotate `JWT_SECRET`, `MONGO_URI` credentials, and Cloudinary keys if they were ever shared, committed, or used in testing.
- In MongoDB Atlas, restrict Network Access to your hosting provider's IPs where possible (rather than `0.0.0.0/0`), and give the database user only the roles it needs.
- Always run behind HTTPS in production (see Deployment Notes above) — several of these protections (secure cookies, HSTS) only take effect over HTTPS.

---

## 🎨 Design System
Palette: deep ink navy (`#1B2430`) + warm candle gold (`#C68B33`) + parchment off-white (`#FAF7F0`) + muted sage accent. Typography pairs **Fraunces** (display serif) with **Inter** (body sans). All tokens live in `frontend/tailwind.config.js` — adjust there to match your church's branding.
