import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiPlusBold, PiTrashBold } from 'react-icons/pi';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';

export default function ManageHomepage() {
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/homepage')
      .then((res) => setForm(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !form) return <Loader />;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const updateServiceTime = (i, key, value) => {
    const times = [...(form.serviceTimes || [])];
    times[i] = { ...times[i], [key]: value };
    setForm((f) => ({ ...f, serviceTimes: times }));
  };

  const addServiceTime = () => setForm((f) => ({ ...f, serviceTimes: [...(f.serviceTimes || []), { label: '', time: '' }] }));
  const removeServiceTime = (i) => setForm((f) => ({ ...f, serviceTimes: f.serviceTimes.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('heroTitle', form.heroTitle || '');
      fd.append('heroSubtitle', form.heroSubtitle || '');
      fd.append('aboutSummary', form.aboutSummary || '');
      fd.append('address', form.address || '');
      fd.append('phone', form.phone || '');
      fd.append('email', form.email || '');
      fd.append('serviceTimes', JSON.stringify(form.serviceTimes || []));
      fd.append('verseOfTheDay', JSON.stringify(form.verseOfTheDay || {}));
      fd.append('socialLinks', JSON.stringify(form.socialLinks || {}));
      if (file) fd.append('heroImage', file);

      const { data } = await api.put('/homepage', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(data.data);
      toast.success('Homepage updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Homepage Content</h1>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5 max-w-2xl">
        <div>
          <label className="label-field">Hero Title</label>
          <input name="heroTitle" value={form.heroTitle || ''} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="label-field">Hero Subtitle</label>
          <textarea name="heroSubtitle" value={form.heroSubtitle || ''} onChange={handleChange} rows={2} className="input-field resize-none" />
        </div>
        <div>
          <label className="label-field">Hero Image</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="input-field !py-2.5" />
          {form.heroImage?.url && !file && <img src={form.heroImage.url} alt="" className="mt-2 h-28 rounded-xl object-cover" />}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label-field !mb-0">Service Times</label>
            <button type="button" onClick={addServiceTime} className="text-xs font-semibold text-candle-500 flex items-center gap-1">
              <PiPlusBold /> Add
            </button>
          </div>
          <div className="space-y-2">
            {(form.serviceTimes || []).map((s, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Label (e.g. Sunday Worship)" value={s.label} onChange={(e) => updateServiceTime(i, 'label', e.target.value)} className="input-field" />
                <input placeholder="Time" value={s.time} onChange={(e) => updateServiceTime(i, 'time', e.target.value)} className="input-field" />
                <button type="button" onClick={() => removeServiceTime(i)} className="h-11 w-11 shrink-0 grid place-items-center rounded-xl bg-red-50 text-red-500">
                  <PiTrashBold size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Verse of the Day</label>
            <textarea
              value={form.verseOfTheDay?.text || ''}
              onChange={(e) => setForm((f) => ({ ...f, verseOfTheDay: { ...f.verseOfTheDay, text: e.target.value } }))}
              rows={2}
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="label-field">Reference</label>
            <input
              value={form.verseOfTheDay?.reference || ''}
              onChange={(e) => setForm((f) => ({ ...f, verseOfTheDay: { ...f.verseOfTheDay, reference: e.target.value } }))}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Address</label>
          <input name="address" value={form.address || ''} onChange={handleChange} className="input-field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Phone</label>
            <input name="phone" value={form.phone || ''} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="label-field">Email</label>
            <input name="email" value={form.email || ''} onChange={handleChange} className="input-field" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Facebook Page URL</label>
            <input
              value={form.socialLinks?.facebook || ''}
              onChange={(e) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, facebook: e.target.value } }))}
              className="input-field"
              placeholder="https://facebook.com/yourchurch"
            />
          </div>
          <div>
            <label className="label-field">YouTube Channel URL</label>
            <input
              value={form.socialLinks?.youtube || ''}
              onChange={(e) => setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, youtube: e.target.value } }))}
              className="input-field"
              placeholder="https://youtube.com/@yourchurch"
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-gold w-full">
          {saving ? 'Saving...' : 'Save Homepage Content'}
        </button>
      </form>
    </div>
  );
}
