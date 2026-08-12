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
    <>
      {isActive && (
        <motion.span
          layoutId="bottom-nav-pill"
          className="absolute top-0 h-0.5 w-6 rounded-full bg-candle"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <Icon size={21} className={isActive ? 'text-ink' : 'text-ink-300'} />
      <span
        className={`text-[10px] leading-none font-semibold tracking-tight truncate max-w-full ${
          isActive ? 'text-ink' : 'text-ink-300'
        }`}
      >
        {label}
      </span>
    </>
  );
}

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-ink/5 shadow-nav md:hidden"
      style={{ paddingBottom: 'calc(0.25rem + var(--safe-bottom))' }}
    >
      <ul className="flex items-stretch justify-between px-1">
        {items.map(({ to, label, icon: Icon, external }) => (
          <li key={to} className="flex-1 min-w-0">
            {external ? (
              <a
                href={to}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex flex-col items-center justify-center gap-1 py-2 px-0.5 min-w-0"
              >
                <ItemContent Icon={Icon} label={label} isActive={false} />
              </a>
            ) : (
              <NavLink
                to={to}
                className="relative flex flex-col items-center justify-center gap-1 py-2 px-0.5 min-w-0"
                end={to === '/'}
              >
                {({ isActive }) => <ItemContent Icon={Icon} label={label} isActive={isActive} />}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
