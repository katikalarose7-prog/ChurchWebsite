import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { PiHandsPrayingBold } from 'react-icons/pi';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const initialForm = { name: '', email: '', phone: '', request: '', isAnonymousPublic: false, isPrivate: false };

export default function PrayerRequests() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [wall, setWall] = useState([]);
  const [loadingWall, setLoadingWall] = useState(true);

  const loadWall = () => {
    api
      .get('/prayer-requests/public')
      .then((res) => setWall(res.data.prayerRequests))
      .finally(() => setLoadingWall(false));
  };

  useEffect(() => {
    loadWall();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.request) {
      toast.error('Please share your name and prayer request');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/prayer-requests', form);
      toast.success('Your request has been received. We are praying with you.');
      setForm(initialForm);
      if (!form.isPrivate) loadWall();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="You Are Not Alone"
        title="Prayer Requests"
        subtitle="Share what's on your heart. Our prayer team stands with you in faith."
      />

      <div className="page-container-narrow">
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <div>
            <label className="label-field">Your Name</label>
            <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Full name" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-field">Email (optional)</label>
              <input name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@email.com" />
            </div>
            <div>
              <label className="label-field">Phone (optional)</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+91..." />
            </div>
          </div>
          <div>
            <label className="label-field">Your Prayer Request</label>
            <textarea
              name="request"
              value={form.request}
              onChange={handleChange}
              rows={4}
              className="input-field resize-none"
              placeholder="Share what you'd like us to pray for..."
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-ink-400">
              <input type="checkbox" name="isPrivate" checked={form.isPrivate} onChange={handleChange} className="rounded" />
              Keep this request private (only our prayer team will see it)
            </label>
            {!form.isPrivate && (
              <label className="flex items-center gap-2 text-sm text-ink-400">
                <input
                  type="checkbox"
                  name="isAnonymousPublic"
                  checked={form.isAnonymousPublic}
                  onChange={handleChange}
                  className="rounded"
                />
                Show my request anonymously on the public prayer wall
              </label>
            )}
          </div>
          <button type="submit" disabled={submitting} className="btn-gold w-full">
            {submitting ? 'Sending...' : 'Send Prayer Request'}
          </button>
        </form>

        <div className="mt-10">
          <h2 className="section-title mb-4">Community Prayer Wall</h2>
          {loadingWall ? (
            <Loader />
          ) : wall.length === 0 ? (
            <EmptyState
              icon={PiHandsPrayingBold}
              title="No public requests yet"
              subtitle="Be the first to share a request on the community prayer wall."
            />
          ) : (
            <div className="space-y-3">
              {wall.map((r, i) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card p-4"
                >
                  <p className="text-sm text-ink-400 leading-relaxed">{r.request}</p>
                  <p className="text-xs text-ink-300 mt-2 font-semibold">— {r.name}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
