import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PiMapPinBold,
  PiPhoneBold,
  PiEnvelopeSimpleBold,
  PiFacebookLogoBold,
  PiInstagramLogoBold,
  PiYoutubeLogoBold,
  PiTwitterLogoBold,
  PiArrowSquareOutBold,
} from 'react-icons/pi';
import api from '../api/axios.js';
import { EXTERNAL_LINKS } from '../config/externalLinks.js';

const exploreLinks = [
  { to: '/about', label: 'About Us' },
  { to: '/sermons', label: 'Sermons' },
  { to: '/events', label: 'Events' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/sunday-school', label: 'Sunday School' },
];

const connectLinks = [
  { to: '/give', label: 'Give Online' },
  { to: '/prayer-requests', label: 'Prayer Requests' },
  { to: '/prayer-schedule', label: 'Prayer Schedule' },
  { to: '/weekly-word', label: 'Weekly Word' },
  { to: '/contact', label: 'Contact Us' },
];

const socialIcons = {
  facebook: PiFacebookLogoBold,
  instagram: PiInstagramLogoBold,
  youtube: PiYoutubeLogoBold,
  twitter: PiTwitterLogoBold,
};

export default function Footer() {
  const [homepage, setHomepage] = useState(null);

  useEffect(() => {
    api
      .get('/homepage')
      .then((res) => setHomepage(res.data.data))
      .catch(() => {});
  }, []);

  const social = homepage?.socialLinks || {};
  const hasSocial = Object.values(social).some(Boolean);

  return (
    <footer className="bg-ink text-parchment-100 mt-6 pb-safe-nav md:pb-0">
      <div className="page-container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="New Covenant Church logo" className="h-14 w-14 rounded-full object-cover shrink-0" />
              <span className="font-display font-semibold text-lg">New Covenant Church</span>
            </Link>
            <p className="text-parchment-100/60 text-sm leading-relaxed mt-4 max-w-xs">
              {homepage?.aboutSummary || 'A place to belong, believe, and become — join us as we grow together in faith.'}
            </p>
            {hasSocial && (
              <div className="flex items-center gap-2 mt-5">
                {Object.entries(social).map(([key, url]) => {
                  const Icon = socialIcons[key];
                  if (!url || !Icon) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={key}
                      className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-candle hover:text-ink transition-colors"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Explore */}
          <div>
            <p className="eyebrow !text-candle-300 mb-4">Explore</p>
            <ul className="space-y-2.5">
              {exploreLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-parchment-100/70 hover:text-parchment-100 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={EXTERNAL_LINKS.songs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-parchment-100/70 hover:text-parchment-100 transition-colors inline-flex items-center gap-1"
                >
                  Songs <PiArrowSquareOutBold size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="eyebrow !text-candle-300 mb-4">Connect</p>
            <ul className="space-y-2.5">
              {connectLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-parchment-100/70 hover:text-parchment-100 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <p className="eyebrow !text-candle-300 mb-4">Visit Us</p>
            <ul className="space-y-3">
              {homepage?.address && (
                <li className="flex gap-2.5 text-sm text-parchment-100/70">
                  <PiMapPinBold className="shrink-0 mt-0.5 text-candle-300" size={16} />
                  {homepage.address}
                </li>
              )}
              {homepage?.phone && (
                <li className="flex gap-2.5 text-sm text-parchment-100/70">
                  <PiPhoneBold className="shrink-0 mt-0.5 text-candle-300" size={16} />
                  {homepage.phone}
                </li>
              )}
              {homepage?.email && (
                <li className="flex gap-2.5 text-sm text-parchment-100/70">
                  <PiEnvelopeSimpleBold className="shrink-0 mt-0.5 text-candle-300" size={16} />
                  {homepage.email}
                </li>
              )}
              {!homepage?.address && !homepage?.phone && !homepage?.email && (
                <li className="text-sm text-parchment-100/50">Details coming soon.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-parchment-100/50 text-center sm:text-left">
            © {new Date().getFullYear()} New Covenant Church. All rights reserved.
          </p>
          <Link to="/admin/login" className="text-xs text-parchment-100/50 hover:text-parchment-100 transition-colors">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
}
