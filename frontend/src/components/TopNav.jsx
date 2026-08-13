import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  PiListBold,
  PiXBold,
  PiArrowSquareOutBold,
  PiShieldCheckBold,
  PiCaretDownBold,
} from 'react-icons/pi';
import { AnimatePresence, motion } from 'framer-motion';
import { EXTERNAL_LINKS } from '../config/externalLinks.js';

// Primary links stay visible on desktop at all times.
const primaryLinks = [
  { to: '/', label: 'Home' },
  { to: EXTERNAL_LINKS.songs, label: 'Songs', external: true },
    { to: '/sermons', label: 'Sermons' },
    { to: '/fresh-fire', label: 'Fresh Fire' },
      { to: '/prayer-requests', label: 'Prayer Requests' },
        { to: '/give', label: 'Offering', accent: true },

  { to: '/events', label: 'Events' },

  { to: '/about', label: 'About' },

];

// Secondary links collapse into a "More" dropdown on desktop, but still show
// as plain items in the full mobile menu.
const secondaryLinks = [
  { to: '/sunday-school', label: 'Sunday School' },
  { to: '/prayer-schedule', label: 'Prayer Schedule' },
  { to: '/weekly-word', label: 'Weekly Word' },
  { to: '/gallery', label: 'Gallery' },
];

const allMobileLinks = [...primaryLinks, ...secondaryLinks, { to: '/contact', label: 'Contact' }];

export default function TopNav() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();

  // Close the "More" dropdown on outside click and on route change.
  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  const pillClass = (isActive, accent) =>
    `px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
      isActive ? 'bg-ink text-parchment-100' : accent ? 'text-candle-600 hover:bg-candle-50' : 'text-ink-400 hover:bg-ink/5'
    }`;

  return (
    <header
      className="sticky top-0 z-40 bg-parchment/85 backdrop-blur-xl border-b border-ink/5"
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="page-container flex items-center justify-between min-h-16 py-2 gap-2">
        <Link to="/" className="flex items-center gap-2 min-w-0 flex-1 lg:flex-initial" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="New Covenant Church logo" className="h-[4.25rem] w-[4.25rem] rounded-full object-cover shrink-0" />
          <span className="font-display font-semibold text-[13.5px] leading-tight sm:text-base lg:text-lg text-ink">
            New Covenant Church
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 shrink-0">
          {primaryLinks.map((l) =>
            l.external ? (
              <a
                key={l.to}
                href={l.to}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors text-ink-400 hover:bg-ink/5 inline-flex items-center gap-1"
              >
                {l.label} <PiArrowSquareOutBold size={13} />
              </a>
            ) : (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => pillClass(isActive, l.accent)}>
                {l.label}
              </NavLink>
            )
          )}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((o) => !o)}
              className={`px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1 ${
                moreOpen ? 'bg-ink/5 text-ink' : 'text-ink-400 hover:bg-ink/5'
              }`}
            >
              More <PiCaretDownBold className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} size={12} />
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-soft border border-ink/5 p-1.5 z-50"
                >
                  {secondaryLinks.map((l) =>
                    l.external ? (
                      <a
                        key={l.to}
                        href={l.to}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-400 hover:bg-ink/5"
                      >
                        {l.label} <PiArrowSquareOutBold size={13} />
                      </a>
                    ) : (
                      <NavLink
                        key={l.to}
                        to={l.to}
                        className={({ isActive }) =>
                          `block px-3 py-2.5 rounded-xl text-sm font-medium ${
                            isActive ? 'bg-ink text-parchment-100' : 'text-ink-400 hover:bg-ink/5'
                          }`
                        }
                      >
                        {l.label}
                      </NavLink>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            to="/admin/login"
            aria-label="Admin login"
            className="hidden sm:grid place-items-center h-10 w-10 rounded-full bg-white border border-ink/10 text-ink-400 hover:text-ink hover:border-ink/20 transition-colors shrink-0"
          >
            <PiShieldCheckBold size={17} />
          </Link>
          <Link to="/contact" className="btn-gold hidden lg:inline-flex !px-4 !py-2 text-xs shrink-0">
            Contact
          </Link>

          <button
            className="lg:hidden grid place-items-center h-10 w-10 rounded-full bg-white border border-ink/10 shrink-0"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? <PiXBold size={18} /> : <PiListBold size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden overflow-hidden border-t border-ink/5 bg-parchment"
          >
            <div className="page-container py-3 grid grid-cols-2 gap-1 max-h-[70vh] overflow-y-auto">
              {allMobileLinks.map((l) =>
                l.external ? (
                  <a
                    key={l.to}
                    href={l.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5 rounded-xl text-sm font-medium text-ink-400 bg-white inline-flex items-center gap-1"
                  >
                    {l.label} <PiArrowSquareOutBold size={13} />
                  </a>
                ) : (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2.5 rounded-xl text-sm font-medium ${
                        isActive ? 'bg-ink text-parchment-100' : l.accent ? 'text-candle-600 bg-white' : 'text-ink-400 bg-white'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                )
              )}
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-ink-400 bg-white inline-flex items-center gap-1.5 sm:hidden"
              >
                <PiShieldCheckBold size={15} /> Admin Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
