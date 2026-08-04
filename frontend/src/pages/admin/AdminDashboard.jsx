import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/Loader.jsx';
import {
  PiHandsPrayingBold,
  PiMusicNotesBold,
  PiCalendarBold,
  PiPlayCircleBold,
  PiEnvelopeSimpleBold,
  PiHeartStraightBold,
  PiChalkboardTeacherBold,
  PiUsersThreeBold,
  PiWalletBold,
  PiFilePdfBold,
} from 'react-icons/pi';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function SundaySchoolDashboard({ admin }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      api.get('/sunday-school/students').catch(() => ({ data: { count: 0 } })),
      api.get('/sunday-school/attendance', { params: { date: today } }).catch(() => ({ data: { presentCount: 0, totalStudents: 0 } })),
      api.get('/sunday-school/finance-summary').catch(() => ({ data: { data: { totalOfferings: 0, totalExpenses: 0, remaining: 0 } } })),
      api.get('/sunday-school/prayer-requests').catch(() => ({ data: { count: 0 } })),
    ]).then(([students, attendance, finance, prayers]) => {
      setStats({
        students: students.data.count,
        presentToday: attendance.data.presentCount,
        totalToday: attendance.data.totalStudents,
        ...finance.data.data,
        prayers: prayers.data.count,
      });
      setLoading(false);
    });
  }, []);

  if (loading || !stats) return <Loader />;

  const cards = [
    { label: 'Students', value: stats.students, icon: PiChalkboardTeacherBold, to: '/admin/sunday-school/students' },
    { label: 'Students Report', value: 'View / PDF', icon: PiFilePdfBold, to: '/admin/sunday-school/report' },
    { label: "Today's Attendance", value: `${stats.presentToday}/${stats.totalToday}`, icon: PiUsersThreeBold, to: '/admin/sunday-school/attendance' },
    { label: 'Prayer Requests', value: stats.prayers, icon: PiHandsPrayingBold, to: '/admin/sunday-school/prayer-requests' },
    { label: 'Offerings', value: inr(stats.totalOfferings), icon: PiWalletBold, to: '/admin/sunday-school/finance' },
    { label: 'Expenses', value: inr(stats.totalExpenses), icon: PiWalletBold, to: '/admin/sunday-school/finance' },
    { label: 'Remaining', value: inr(stats.remaining), icon: PiWalletBold, to: '/admin/sunday-school/finance', highlight: true },
  ];

  return (
    <div>
      <p className="eyebrow mb-2">Welcome back</p>
      <h1 className="font-display text-3xl font-semibold text-ink mb-1">{admin?.name}</h1>
      <p className="text-ink-300 text-sm mb-8">Sunday School Admin</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, to, highlight }) => (
          <Link key={label} to={to} className={`card p-5 ${highlight ? '!bg-ink text-parchment-100' : ''}`}>
            <div className={`h-10 w-10 rounded-xl grid place-items-center mb-3 ${highlight ? 'bg-candle-500/15 text-candle-300' : 'bg-candle-100 text-candle-600'}`}>
              <Icon size={20} />
            </div>
            <p className="font-display text-xl font-semibold">{value}</p>
            <p className={`text-xs mt-1 ${highlight ? 'text-parchment-100/60' : 'text-ink-300'}`}>{label}</p>
          </Link>
        ))}
      </div>

      <div className="card p-5 mt-6 bg-ink/5 border-none">
        <p className="text-sm text-ink-400">
          As a <strong>Sunday School Admin</strong>, you manage students, attendance, prayer requests, offerings, and
          expenses for Sunday School only. Other church content and settings are not part of your account.
        </p>
      </div>
    </div>
  );
}

function GeneralDashboard({ admin, isSuperAdmin }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // Sourced from the backend (config/owner.js) via the login/me response,
  // not duplicated here — if the owner account ever changes, only the
  // backend needs updating and this stays correct automatically.
  const isOwner = !!admin?.isOwner;

  useEffect(() => {
    const calls = [
      api.get('/songs').catch(() => ({ data: { count: 0 } })),
      api.get('/events').catch(() => ({ data: { count: 0 } })),
      api.get('/sermons').catch(() => ({ data: { count: 0 } })),
    ];
    if (isSuperAdmin) {
      calls.push(api.get('/prayer-requests').catch(() => ({ data: { count: 0 } })));
      calls.push(api.get('/contact').catch(() => ({ data: { count: 0 } })));
      if (isOwner) {
        calls.push(api.get('/giving').catch(() => ({ data: { count: 0 } })));
      }
    }

    Promise.all(calls)
      .then((results) => {
        const [songs, events, sermons, prayers, contacts, offerings] = results;
        setStats({
          songs: songs.data.count,
          events: events.data.count,
          sermons: sermons.data.count,
          prayers: prayers?.data.count ?? null,
          contacts: contacts?.data.count ?? null,
          offerings: offerings?.data.count ?? null,
        });
      })
      .finally(() => setLoading(false));
  }, [isSuperAdmin, isOwner]);

  if (loading) return <Loader />;

  const cards = [
    { label: 'Songs', value: stats.songs, icon: PiMusicNotesBold, to: '/admin/songs' },
    { label: 'Events', value: stats.events, icon: PiCalendarBold, to: '/admin/events' },
    { label: 'Sermons', value: stats.sermons, icon: PiPlayCircleBold, to: '/admin/sermons' },
    ...(isSuperAdmin
      ? [
          { label: 'Prayer Requests', value: stats.prayers, icon: PiHandsPrayingBold, to: '/admin/prayer-requests' },
          { label: 'Contact Messages', value: stats.contacts, icon: PiEnvelopeSimpleBold, to: '/admin/contact-messages' },
          ...(isOwner
            ? [{ label: 'Offerings Received', value: stats.offerings, icon: PiHeartStraightBold, to: '/admin/offerings' }]
            : []),
        ]
      : []),
  ];

  return (
    <div>
      <p className="eyebrow mb-2">Welcome back</p>
      <h1 className="font-display text-3xl font-semibold text-ink mb-1">{admin?.name}</h1>
      <p className="text-ink-300 text-sm mb-8 capitalize">Logged in as {admin?.role?.replace(/_/g, ' ')}</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, to }) => (
          <Link key={label} to={to} className="card p-5">
            <div className="h-10 w-10 rounded-xl bg-candle-100 text-candle-600 grid place-items-center mb-3">
              <Icon size={20} />
            </div>
            <p className="font-display text-2xl font-semibold text-ink">{value}</p>
            <p className="text-xs text-ink-300 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {isSuperAdmin && (
        <Link
          to={isOwner ? '/admin/sunday-school/students' : '/admin/sunday-school/overview'}
          className="card p-5 mt-6 flex items-center gap-4 hover:!bg-ink/5"
        >
          <div className="h-10 w-10 rounded-xl bg-candle-100 text-candle-600 grid place-items-center shrink-0">
            <PiChalkboardTeacherBold size={20} />
          </div>
          <div>
            <p className="font-display font-semibold text-ink">Sunday School</p>
            <p className="text-xs text-ink-300">
              {isOwner ? 'Manage students, attendance, offerings & expenses' : 'View a read-only summary'}
            </p>
          </div>
        </Link>
      )}

      {!isSuperAdmin && (
        <div className="card p-5 mt-6 bg-ink/5 border-none">
          <p className="text-sm text-ink-400">
            As a <strong>Content Admin</strong>, you can manage Songs, Weekly Word, Prayer Schedule, Sermons,
            Events, Gallery, and Homepage content. Prayer Requests, Offerings, Sunday School, and Admin accounts
            are managed by Super Admins only.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { admin, isSuperAdmin } = useAuth();

  if (admin?.role === 'sunday_school_admin') {
    return <SundaySchoolDashboard admin={admin} />;
  }

  return <GeneralDashboard admin={admin} isSuperAdmin={isSuperAdmin} />;
}