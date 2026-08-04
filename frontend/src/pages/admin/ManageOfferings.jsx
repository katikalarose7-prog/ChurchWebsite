import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { PiHeartStraightBold, PiTrashBold } from 'react-icons/pi';

const statusColors = {
  pending: 'bg-candle-100 text-candle-600',
  confirmed: 'bg-sage-100 text-sage-600',
};

export default function ManageOfferings() {
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/giving', { params: filter ? { status: filter } : {} })
      .then((res) => setOfferings(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const totalConfirmed = offerings
    .filter((o) => o.status === 'confirmed' && o.amount)
    .reduce((sum, o) => sum + o.amount, 0);

  const toggleStatus = async (o) => {
    try {
      await api.put(`/giving/${o._id}`, { status: o.status === 'confirmed' ? 'pending' : 'confirmed' });
      load();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this offering record permanently?')) return;
    try {
      await api.delete(`/giving/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold text-ink">Offerings Received</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field !w-auto !py-2 text-sm">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
        </select>
      </div>
      <p className="text-sm text-ink-300 mb-6">
        Visible to Super Admins only. Total confirmed with an amount: <strong>₹{totalConfirmed.toLocaleString('en-IN')}</strong>
      </p>

      {loading ? (
        <Loader />
      ) : offerings.length === 0 ? (
        <EmptyState icon={PiHeartStraightBold} title="No offerings recorded yet" />
      ) : (
        <div className="space-y-3">
          {offerings.map((o) => (
            <div key={o._id} className="card p-4 flex items-start gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink flex items-center gap-2 flex-wrap">
                  {o.name}
                  {o.amount ? <span className="text-candle-600">₹{o.amount.toLocaleString('en-IN')}</span> : null}
                </p>
                <p className="text-xs text-ink-300 mt-1">
                  {o.cause} · {new Date(o.createdAt).toLocaleString()}
                </p>
                {o.phone && <p className="text-xs text-ink-300 mt-1">{o.phone}</p>}
                {o.transactionId && <p className="text-xs text-ink-300 mt-1">Ref: {o.transactionId}</p>}
                {o.note && <p className="text-sm text-ink-400 mt-2 bg-ink/5 rounded-xl p-2">{o.note}</p>}
              </div>
              <button
                onClick={() => toggleStatus(o)}
                className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${statusColors[o.status]}`}
              >
                {o.status}
              </button>
              <button onClick={() => remove(o._id)} className="h-9 w-9 grid place-items-center rounded-xl bg-red-50 text-red-500 shrink-0">
                <PiTrashBold size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
