import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiEnvelopeSimpleBold, PiTrashBold } from 'react-icons/pi';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const statusColors = {
  new: 'bg-candle-100 text-candle-600',
  read: 'bg-sage-100 text-sage-600',
  replied: 'bg-ink text-parchment-100',
};

export default function ManageContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/contact')
      .then((res) => setMessages(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const open = async (m) => {
    setActive(m);
    if (m.status === 'new') {
      try {
        await api.put(`/contact/${m._id}`, { status: 'read' });
        load();
      } catch {
        /* silent */
      }
    }
  };

  const markReplied = async (id) => {
    try {
      await api.put(`/contact/${id}`, { status: 'replied' });
      toast.success('Marked as replied');
      load();
      setActive(null);
    } catch {
      toast.error('Failed to update');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/contact/${id}`);
      toast.success('Deleted');
      load();
      setActive(null);
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Contact Messages</h1>

      {loading ? (
        <Loader />
      ) : messages.length === 0 ? (
        <EmptyState icon={PiEnvelopeSimpleBold} title="No messages yet" />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <button key={m._id} onClick={() => open(m)} className="card p-4 w-full text-left flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{m.name} · <span className="text-ink-300 font-normal">{m.email}</span></p>
                <p className="text-sm text-ink-400 mt-1 line-clamp-1">{m.subject}</p>
                <p className="text-xs text-ink-300 mt-1">{new Date(m.createdAt).toLocaleString()}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${statusColors[m.status]}`}>
                {m.status}
              </span>
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center sm:justify-center" onClick={() => setActive(null)}>
          <div className="bg-white rounded-t-app sm:rounded-app w-full sm:max-w-lg max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-lg font-semibold text-ink">{active.subject}</p>
            <p className="text-xs text-ink-300 mt-1">{active.name} · {active.email}</p>
            <p className="text-ink-400 text-sm leading-relaxed mt-4 bg-ink/5 rounded-xl p-4 whitespace-pre-line">{active.message}</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => markReplied(active._id)} className="btn-gold flex-1 !py-2.5">
                Mark as Replied
              </button>
              <a href={`mailto:${active.email}`} className="btn-secondary !py-2.5">
                Reply by Email
              </a>
              <button onClick={() => remove(active._id)} className="h-11 w-11 grid place-items-center rounded-full bg-red-50 text-red-500">
                <PiTrashBold size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
