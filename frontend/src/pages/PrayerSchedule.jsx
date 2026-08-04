import { useEffect, useState } from 'react';
import { PiClockBold, PiMapPinBold } from 'react-icons/pi';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const dayOrder = ['Monday - Saturday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function PrayerSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/prayer-schedule')
      .then((res) => setSchedules(res.data.data.filter((s) => s.isActive)))
      .finally(() => setLoading(false));
  }, []);

  const grouped = dayOrder
    .map((day) => ({ day, items: schedules.filter((s) => s.day === day) }))
    .filter((g) => g.items.length);

  return (
    <div>
      <PageHeader
        eyebrow="Pray Without Ceasing"
        title="Weekly Prayer Schedule"
        subtitle="Join a corporate prayer session that fits your week."
      />

      <div className="page-container">
        {loading ? (
          <Loader />
        ) : grouped.length === 0 ? (
          <EmptyState icon={PiClockBold} title="Schedule coming soon" />
        ) : (
          <div className="space-y-6">
            {grouped.map(({ day, items }) => (
              <div key={day}>
                <p className="eyebrow mb-3">{day}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((s) => (
                    <div key={s._id} className="card p-4 flex gap-4">
                      <div className="h-11 w-11 rounded-xl bg-sage-100 text-sage-600 grid place-items-center shrink-0">
                        <PiClockBold size={20} />
                      </div>
                      <div>
                        <p className="font-display font-semibold text-ink">{s.title}</p>
                        <p className="text-sm text-ink-300">{s.time}</p>
                        {s.focus && <p className="text-xs text-candle-500 font-semibold mt-1">{s.focus}</p>}
                        <p className="text-xs text-ink-300 mt-1 flex items-center gap-1">
                          <PiMapPinBold /> {s.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}