import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';

export default function ManageGivingSettings() {
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/giving/settings')
      .then((res) => setForm(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !form) return <Loader />;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('upiId', form.upiId || '');
      fd.append('payeeName', form.payeeName || '');
      fd.append('instructions', form.instructions || '');
      fd.append('isEnabled', form.isEnabled ? 'true' : 'false');
      if (file) fd.append('qrImage', file);

      const { data } = await api.put('/giving/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(data.data);
      setFile(null);
      toast.success('Giving settings updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-2">Giving / UPI Settings</h1>
      <p className="text-sm text-ink-300 mb-6">
        This QR code and UPI ID are shown publicly on the "Give" page. Offering submissions are visible only to
        Super Admins under "Offerings Received".
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5 max-w-xl">
        <label className="flex items-center gap-2 text-sm text-ink-400">
          <input type="checkbox" name="isEnabled" checked={!!form.isEnabled} onChange={handleChange} className="rounded" />
          Online giving is enabled (shown on the public "Give" page)
        </label>

        <div>
          <label className="label-field">UPI QR Code Image</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="input-field !py-2.5" />
          {form.qrImage?.url && !file && (
            <img src={form.qrImage.url} alt="Current QR" className="mt-2 h-32 w-32 rounded-xl object-contain border border-ink/10 p-2 bg-white" />
          )}
          <p className="text-xs text-ink-300 mt-1.5">
            Upload the QR code from your bank/GPay/PhonePe business app (a screenshot works fine).
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label-field">UPI ID (VPA)</label>
            <input name="upiId" value={form.upiId || ''} onChange={handleChange} className="input-field" placeholder="churchname@okaxis" />
          </div>
          <div>
            <label className="label-field">Payee Name</label>
            <input name="payeeName" value={form.payeeName || ''} onChange={handleChange} className="input-field" />
          </div>
        </div>

        <div>
          <label className="label-field">Instructions shown to givers</label>
          <textarea name="instructions" value={form.instructions || ''} onChange={handleChange} rows={4} className="input-field resize-none" />
        </div>

        <button type="submit" disabled={saving} className="btn-gold w-full">
          {saving ? 'Saving...' : 'Save Giving Settings'}
        </button>
      </form>
    </div>
  );
}
