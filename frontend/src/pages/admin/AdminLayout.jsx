import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  PiSquaresFourBold,
  PiHandsPrayingBold,
  PiMusicNotesBold,
  PiClockBold,
  PiBookBookmarkBold,
  PiPlayCircleBold,
  PiCalendarBold,
  PiImagesBold,
  PiHouseBold,
  PiUsersBold,
  PiSignOutBold,
  PiListBold,
  PiXBold,
  PiEnvelopeSimpleBold,
  PiHeartStraightBold,
  PiQrCodeBold,
  PiInfoBold,
  PiChalkboardTeacherBold,
  PiUsersThreeBold,
  PiWalletBold,
  PiFireBold,
} from 'react-icons/pi';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: PiSquaresFourBold, roles: ['super_admin', 'content_admin', 'sunday_school_admin'] },
  { to: '/admin/prayer-requests', label: 'Prayer Requests', icon: PiHandsPrayingBold, roles: ['super_admin'] },
  { to: '/admin/offerings', label: 'Offerings Received', icon: PiHeartStraightBold, roles: ['super_admin'], requiresOwner: true },
  { to: '/admin/giving-settings', label: 'Giving / UPI Settings', icon: PiQrCodeBold, roles: ['super_admin'], requiresOwner: true },
  { to: '/admin/songs', label: 'Songs', icon: PiMusicNotesBold, roles: ['super_admin', 'content_admin'] },
  { to: '/admin/fresh-fire', label: 'Fresh Fire', icon: PiFireBold, roles: ['super_admin', 'content_admin'] },
  { to: '/admin/prayer-schedule', label: 'Prayer Schedule', icon: PiClockBold, roles: ['super_admin', 'content_admin'] },
  { to: '/admin/weekly-word', label: 'Weekly Word', icon: PiBookBookmarkBold, roles: ['super_admin', 'content_admin'] },
  { to: '/admin/sermons', label: 'Sermons', icon: PiPlayCircleBold, roles: ['super_admin', 'content_admin'] },
  { to: '/admin/events', label: 'Events', icon: PiCalendarBold, roles: ['super_admin', 'content_admin'] },
  { to: '/admin/gallery', label: 'Gallery', icon: PiImagesBold, roles: ['super_admin', 'content_admin'] },
  { to: '/admin/homepage', label: 'Homepage Content', icon: PiHouseBold, roles: ['super_admin', 'content_admin'] },
  // Full Sunday School management: sunday_school_admin always has access; a
  // super_admin only does if they're the owner (requiresOwner enforces this
  // for super_admin specifically — sunday_school_admin is unaffected by it).
  { to: '/admin/sunday-school/students', label: 'SS: Students', icon: PiChalkboardTeacherBold, roles: ['super_admin', 'sunday_school_admin'], requiresOwner: true },
  { to: '/admin/sunday-school/attendance', label: 'SS: Attendance', icon: PiUsersThreeBold, roles: ['super_admin', 'sunday_school_admin'], requiresOwner: true },
  { to: '/admin/sunday-school/prayer-requests', label: 'SS: Prayer Requests', icon: PiHandsPrayingBold, roles: ['super_admin', 'sunday_school_admin'], requiresOwner: true },
  { to: '/admin/sunday-school/finance', label: 'SS: Finance', icon: PiWalletBold, roles: ['super_admin', 'sunday_school_admin'], requiresOwner: true },
  { to: '/admin/sunday-school/settings', label: 'SS: Page Settings', icon: PiHouseBold, roles: ['super_admin', 'sunday_school_admin'], requiresOwner: true },
  // Read-only overview: the ONLY Sunday School item a non-owner super_admin
  // sees. Owner and sunday_school_admin also see it — harmless overlap with
  // the full-access pages above, since they can already do everything here.
  { to: '/admin/sunday-school/overview', label: 'SS: Overview', icon: PiUsersThreeBold, roles: ['super_admin', 'sunday_school_admin'] },
  { to: '/admin/about', label: 'About Page', icon: PiInfoBold, roles: ['super_admin', 'content_admin'] },
  { to: '/admin/contact-messages', label: 'Contact Messages', icon: PiEnvelopeSimpleBold, roles: ['super_admin'] },
  { to: '/admin/admins', label: 'Manage Admins', icon: PiUsersBold, roles: ['super_admin'], requiresOwner: true },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleItems = navItems.filter((item) => {
    if (!item.roles.includes(admin?.role)) return false;
    // requiresOwner only restricts the super_admin role — a role like
    // sunday_school_admin that's separately listed in item.roles is
    // unaffected, since "owner" is a super_admin-only concept.
    if (item.requiresOwner && admin?.role === 'super_admin' && !admin?.isOwner) return false;
    return true;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-2.5 px-5 py-6">
        <span className="grid place-items-center h-9 w-9 rounded-xl bg-candle text-ink font-display font-bold">+</span>
        <div>
          <p className="font-display font-semibold text-parchment-100 leading-none">Admin Panel</p>
          <p className="text-[11px] text-parchment-100/50 mt-1 capitalize">{admin?.role?.replace(/_/g, ' ')}</p>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-candle text-ink' : 'text-parchment-100/70 hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-parchment-100/70 hover:bg-white/5 w-full"
        >
          <PiSignOutBold size={18} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-parchment-200 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-ink shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-ink flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-30 bg-ink flex items-center justify-between px-4 h-14">
          <button onClick={() => setSidebarOpen(true)} className="text-parchment-100">
            <PiListBold size={22} />
          </button>
          <p className="font-display font-semibold text-parchment-100">Admin Panel</p>
          <button onClick={() => setSidebarOpen(false)} className="text-parchment-100 opacity-0">
            <PiXBold size={22} />
          </button>
        </header>
        <main className="p-5 md:p-8 max-w-5xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
