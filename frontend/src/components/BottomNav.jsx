import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PiHouseFill, PiMusicNotesFill, PiHandsPrayingFill, PiHandCoinsFill, PiListFill } from 'react-icons/pi';
import { EXTERNAL_LINKS } from '../config/externalLinks.js';

const items = [
  { to: '/', label: 'Home', icon: PiHouseFill },
  { to: EXTERNAL_LINKS.songs, label: 'Songs', icon: PiMusicNotesFill, external: true },
  { to: '/prayer-requests', label: 'Prayer', icon: PiHandsPrayingFill },
  { to: '/give', label: 'Offerings', icon: PiHandCoinsFill },
  { to: '/more', label: 'More', icon: PiListFill },
];

function ItemContent({ Icon, label, isActive }) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/90 backdrop-blur-xl border-t border-ink/5 shadow-nav md:hidden"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <ul className="flex items-stretch justify-between px-2">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} className="relative flex flex-col items-center gap-1 py-2.5 px-1" end={to === '/'}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-pill"
                      className="absolute -top-0.5 h-1 w-8 rounded-full bg-candle"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={22}
                    className={isActive ? 'text-ink' : 'text-ink-300'}
                  />
                  <span
                    className={`text-[10.5px] font-semibold ${isActive ? 'text-ink' : 'text-ink-300'}`}
                  >
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
