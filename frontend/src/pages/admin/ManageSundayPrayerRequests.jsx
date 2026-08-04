import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { PiHandsPrayingBold, PiTrashBold } from 'react-icons/pi';

export default function ManageSundayPrayerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/sunday-school/prayer-requests')
      .then((res) => setRequests(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleStatus = async (r) => {
    try {
      await api.put(`/sunday-school/prayer-requests/${r._id}`, { status: r.status === 'prayed' ? 'new' : 'prayed' });
      load();
    } catch {
      toast.error('Failed to update');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this prayer request?')) return;
    try {
      await api.delete(`/sunday-school/prayer-requests/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Sunday School Prayer Requests</h1>

      {loading ? (
        <Loader />
      ) : requests.length === 0 ? (
        <EmptyState icon={PiHandsPrayingBold} title="No prayer requests yet" />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r._id} className="card p-4 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">
                  {r.name} {r.studentClass && <span className="text-xs text-candle-600 font-semibold ml-1">{r.studentClass}</span>}
                </p>
                <p className="text-sm text-ink-400 mt-1">{r.request}</p>
                <p className="text-xs text-ink-300 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => toggleStatus(r)}
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                  r.status === 'prayed' ? 'bg-sage-100 text-sage-600' : 'bg-candle-100 text-candle-600'
                }`}
              >
                {r.status}
              </button>
              <button onClick={() => remove(r._id)} className="h-9 w-9 grid place-items-center rounded-xl bg-red-50 text-red-500 shrink-0">
                <PiTrashBold size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
