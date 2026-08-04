import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { PiUsersThreeBold, PiCheckCircleBold, PiCircleBold } from 'react-icons/pi';

const classOrder = ['Beginners', 'Primary', 'Juniors', 'Seniors'];

// Build a YYYY-MM-DD string from LOCAL date parts.
// Do NOT use date.toISOString().slice(0, 10) for calendar dates —
// toISOString() always converts to UTC, which can shift the date
// backward (e.g. in IST, anytime before 5:30am gets shifted to the
// previous day). That caused attendance to sometimes get saved under
// the wrong date.
const toLocalISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayStr = () => toLocalISO(new Date());

export default function ManageSundayAttendance() {
  const [date, setDate] = useState(todayStr());
  const [students, setStudents] = useState([]);
  const [present, setPresent] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = (d) => {
    setLoading(true);
    api
      .get('/sunday-school/attendance', { params: { date: d } })
      .then((res) => {
        setStudents(res.data.students);
        setPresent(new Set(res.data.students.filter((s) => s.present).map((s) => s._id)));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(date), [date]);

  const toggle = (id) => {
    setPresent((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/sunday-school/attendance', { date, presentStudents: Array.from(present) });
      toast.success('Attendance saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const grouped = classOrder
    .map((c) => ({ class: c, students: students.filter((s) => s.class === c) }))
    .filter((g) => g.students.length);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Attendance</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field !w-auto !py-2 text-sm" />
      </div>
      <p className="text-sm text-ink-300 mb-6">
        Tap a student to mark present/absent for the selected date, then save.
      </p>

      <div className="card p-4 mb-5 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-candle-100 text-candle-600 grid place-items-center shrink-0">
          <PiUsersThreeBold size={22} />
        </div>
        <div>
          <p className="font-display text-2xl font-semibold text-ink">
            {present.size} <span className="text-base text-ink-300 font-normal">/ {students.length} present</span>
          </p>
          <p className="text-xs text-ink-300">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : students.length === 0 ? (
        <EmptyState icon={PiUsersThreeBold} title="No active students yet" subtitle="Add students first from the Students page." />
      ) : (
        <div className="space-y-5">
          {grouped.map((g) => (
            <div key={g.class}>
              <p className="eyebrow mb-2">
                {g.class} ({g.students.filter((s) => present.has(s._id)).length}/{g.students.length})
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {g.students.map((s) => {
                  const isPresent = present.has(s._id);
                  return (
                    <button
                      key={s._id}
                      onClick={() => toggle(s._id)}
                      className={`card p-3 flex items-center gap-3 text-left transition-colors ${
                        isPresent ? '!bg-sage-100 border-sage-400' : ''
                      }`}
                    >
                      {isPresent ? (
                        <PiCheckCircleBold className="text-sage-600 shrink-0" size={20} />
                      ) : (
                        <PiCircleBold className="text-ink-300 shrink-0" size={20} />
                      )}
                      <span className="text-sm font-medium text-ink truncate">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button onClick={save} disabled={saving} className="btn-gold w-full mt-4">
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      )}
    </div>
  );
}