import { useEffect, useState } from 'react';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import { PiChalkboardTeacherBold, PiUsersThreeBold, PiHandsPrayingBold, PiWalletBold } from 'react-icons/pi';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function ManageSundaySchoolOverview() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/sunday-school/dashboard-summary')
      .then((res) => setSummary(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !summary) return <Loader />;

  const cards = [
    { label: 'Active Students', value: summary.totalStudents, icon: PiChalkboardTeacherBold },
    { label: "Present Today", value: summary.presentToday, icon: PiUsersThreeBold },
    { label: 'Prayer Requests', value: summary.prayerRequestCount, icon: PiHandsPrayingBold },
    { label: 'Total Offerings', value: inr(summary.totalOfferings), icon: PiWalletBold },
    { label: 'Total Expenses', value: inr(summary.totalExpenses), icon: PiWalletBold },
    { label: 'Remaining', value: inr(summary.remaining), icon: PiWalletBold, highlight: true },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-2">Sunday School Overview</h1>
      <p className="text-sm text-ink-300 mb-6">
        A read-only summary. Managing students, attendance, prayer requests, and finances is limited to Sunday
        School Admins and the account owner.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, highlight }) => (
          <div key={label} className={`card p-5 ${highlight ? '!bg-ink text-parchment-100' : ''}`}>
            <div className={`h-10 w-10 rounded-xl grid place-items-center mb-3 ${highlight ? 'bg-candle-500/15 text-candle-300' : 'bg-candle-100 text-candle-600'}`}>
              <Icon size={20} />
            </div>
            <p className="font-display text-xl font-semibold">{value}</p>
            <p className={`text-xs mt-1 ${highlight ? 'text-parchment-100/60' : 'text-ink-300'}`}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
