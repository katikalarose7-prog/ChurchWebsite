import { Link } from 'react-router-dom';
import {
  PiInfoBold,
  PiMusicNotesBold,
  PiClockBold,
  PiBookBookmarkBold,
  PiImagesBold,
  PiEnvelopeSimpleBold,
  PiCaretRightBold,
  PiShieldCheckBold,
  PiArrowSquareOutBold,
  PiHeartStraightBold,
  PiChalkboardTeacherBold,
  PiFireBold,
} from 'react-icons/pi';
import PageHeader from '../components/PageHeader.jsx';
import { EXTERNAL_LINKS } from '../config/externalLinks.js';

const links = [
  { to: '/about', label: 'About Us', icon: PiInfoBold },
  { to: '/give', label: 'Give Online', icon: PiHeartStraightBold },
  { to: '/fresh-fire', label: 'Fresh Fire', icon: PiFireBold },
  { to: '/sunday-school', label: 'Sunday School', icon: PiChalkboardTeacherBold },
  { to: EXTERNAL_LINKS.songs, label: 'Songs', icon: PiMusicNotesBold, external: true },
  { to: '/prayer-schedule', label: 'Weekly Prayer Schedule', icon: PiClockBold },
  { to: '/weekly-word', label: 'Weekly Word', icon: PiBookBookmarkBold },
  { to: '/gallery', label: 'Gallery', icon: PiImagesBold },
  { to: '/contact', label: 'Contact', icon: PiEnvelopeSimpleBold },
];

export default function More() {
  return (
    <div>
      <PageHeader title="More" subtitle="Explore everything our church community has to offer." />
      <div className="page-container space-y-2">
        {links.map(({ to, label, icon: Icon, external }) =>
          external ? (
            <a key={to} href={to} target="_blank" rel="noopener noreferrer" className="card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-ink/5 text-ink grid place-items-center shrink-0">
                <Icon size={19} />
              </div>
              <span className="font-medium text-ink flex-1">{label}</span>
              <PiArrowSquareOutBold className="text-ink-300" size={16} />
            </a>
          ) : (
            <Link key={to} to={to} className="card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-ink/5 text-ink grid place-items-center shrink-0">
                <Icon size={19} />
              </div>
              <span className="font-medium text-ink flex-1">{label}</span>
              <PiCaretRightBold className="text-ink-300" />
            </Link>
          )
        )}
        <Link to="/admin/login" className="card p-4 flex items-center gap-4 mt-4 opacity-70">
          <div className="h-10 w-10 rounded-xl bg-ink/5 text-ink grid place-items-center shrink-0">
            <PiShieldCheckBold size={19} />
          </div>
          <span className="font-medium text-ink flex-1">Admin Login</span>
          <PiCaretRightBold className="text-ink-300" />
        </Link>
      </div>
    </div>
  );
}
