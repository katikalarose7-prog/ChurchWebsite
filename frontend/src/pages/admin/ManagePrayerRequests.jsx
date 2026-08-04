import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { PiHandsPrayingBold } from 'react-icons/pi';

const statusColors = {
  new: 'bg-candle-100 text-candle-600',
  in_progress: 'bg-sage-100 text-sage-600',
  prayed: 'bg-ink text-parchment-100',
  archived: 'bg-ink/5 text-ink-300',
};

export default function ManagePrayerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [active, setActive] = useState(null);
  const [response, setResponse] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/prayer-requests', { params: filter ? { status: filter } : {} })
      .then((res) => setRequests(res.data.prayerRequests))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const openRequest = (r) => {
    setActive(r);
    setResponse(r.adminResponse || '');
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/prayer-requests/${id}`, { status });
      toast.success('Status updated');
      load();
      if (active?._id === id) setActive((a) => ({ ...a, status }));
    } catch {
      toast.error('Failed to update status');
    }
  };

  const saveResponse = async () => {
    try {
      await api.put(`/prayer-requests/${active._id}`, { adminResponse: response });
      toast.success('Response saved');
      load();
      setActive(null);
    } catch {
      toast.error('Failed to save response');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this prayer request permanently?')) return;
    try {
      await api.delete(`/prayer-requests/${id}`);
      toast.success('Deleted');
      load();
      setActive(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Prayer Requests</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field !w-auto !py-2 text-sm">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="prayed">Prayed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : requests.length === 0 ? (
        <EmptyState icon={PiHandsPrayingBold} title="No prayer requests" />
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <button key={r._id} onClick={() => openRequest(r)} className="card p-4 w-full text-left block">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{r.name}</p>
                  <p className="text-sm text-ink-400 mt-1 line-clamp-2">{r.request}</p>
                  <p className="text-xs text-ink-300 mt-2">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${statusColors[r.status]}`}>
                  {r.status.replace('_', ' ')}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center sm:justify-center" onClick={() => setActive(null)}>
          <div className="bg-white rounded-t-app sm:rounded-app w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-lg font-semibold text-ink">{active.name}</p>
            <p className="text-xs text-ink-300 mt-1">{active.email || 'No email'} · {active.phone || 'No phone'}</p>
            <p className="text-ink-400 text-sm leading-relaxed mt-3 bg-ink/5 rounded-xl p-3">{active.request}</p>

            <div className="flex flex-wrap gap-2 mt-4">
              {['new', 'in_progress', 'prayed', 'archived'].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(active._id, s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    active.status === s ? 'bg-ink text-parchment-100' : 'bg-ink/5 text-ink-400'
                  }`}
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className="label-field">Internal Response / Notes</label>
              <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={3} className="input-field resize-none" />
            </div>

            <div className="flex gap-2 mt-4">
              <button onClick={saveResponse} className="btn-gold flex-1 !py-2.5">
                Save Response
              </button>
              <button onClick={() => remove(active._id)} className="btn-secondary !py-2.5 !text-red-500">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
