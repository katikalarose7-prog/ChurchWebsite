import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiPlusBold, PiTrashBold } from 'react-icons/pi';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';

export default function ManageAbout() {
  const [form, setForm] = useState(null);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [leaderFiles, setLeaderFiles] = useState({}); // { [index]: File }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/about')
      .then((res) =>
        setForm({
          story: '',
          mission: '',
          vision: '',
          beliefs: [],
          leaders: [],
          ...res.data.data,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading || !form) return <Loader />;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ---- Beliefs ----
  const updateBelief = (i, key, value) => {
    const beliefs = [...form.beliefs];
    beliefs[i] = { ...beliefs[i], [key]: value };
    setForm((f) => ({ ...f, beliefs }));
  };
  const addBelief = () => setForm((f) => ({ ...f, beliefs: [...f.beliefs, { title: '', description: '' }] }));
  const removeBelief = (i) => setForm((f) => ({ ...f, beliefs: f.beliefs.filter((_, idx) => idx !== i) }));

  // ---- Leaders ----
  const updateLeader = (i, key, value) => {
    const leaders = [...form.leaders];
    leaders[i] = { ...leaders[i], [key]: value };
    setForm((f) => ({ ...f, leaders }));
  };
  const addLeader = () => setForm((f) => ({ ...f, leaders: [...f.leaders, { name: '', role: '', bio: '' }] }));
  const removeLeader = (i) => {
    setForm((f) => ({ ...f, leaders: f.leaders.filter((_, idx) => idx !== i) }));
    setLeaderFiles((prev) => {
      const next = { ...prev };
      delete next[i];
      return next;
    });
  };
  const setLeaderFile = (i, file) => setLeaderFiles((prev) => ({ ...prev, [i]: file }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('story', form.story || '');
      fd.append('mission', form.mission || '');
      fd.append('vision', form.vision || '');
      fd.append('beliefs', JSON.stringify(form.beliefs || []));
      fd.append('leaders', JSON.stringify(form.leaders || []));
      if (mainImageFile) fd.append('image', mainImageFile);
      Object.entries(leaderFiles).forEach(([index, file]) => {
        if (file) fd.append(`leaderImage_${index}`, file);
      });

      const { data } = await api.put('/about', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ story: '', mission: '', vision: '', beliefs: [], leaders: [], ...data.data });
      setMainImageFile(null);
      setLeaderFiles({});
      toast.success('About page updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-2">About Page</h1>
      <p className="text-sm text-ink-300 mb-6">Controls the content shown on the public "About" page.</p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Hero image */}
        <div className="card p-6 space-y-4">
          <p className="eyebrow">Hero Image</p>
          <input type="file" accept="image/*" onChange={(e) => setMainImageFile(e.target.files[0])} className="input-field !py-2.5" />
          {form.image?.url && !mainImageFile && (
            <img src={form.image.url} alt="Current about hero" className="h-40 w-full object-cover rounded-xl" />
          )}
        </div>

        {/* Story / Mission / Vision */}
        <div className="card p-6 space-y-4">
          <p className="eyebrow">Our Story</p>
          <textarea name="story" value={form.story || ''} onChange={handleChange} rows={5} className="input-field resize-none" />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Mission</label>
              <textarea name="mission" value={form.mission || ''} onChange={handleChange} rows={3} className="input-field resize-none" />
            </div>
            <div>
              <label className="label-field">Vision</label>
              <textarea name="vision" value={form.vision || ''} onChange={handleChange} rows={3} className="input-field resize-none" />
            </div>
          </div>
        </div>

        {/* Beliefs */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="eyebrow">What We Believe</p>
            <button type="button" onClick={addBelief} className="text-xs font-semibold text-candle-600 flex items-center gap-1">
              <PiPlusBold /> Add Belief
            </button>
          </div>
          {form.beliefs.length === 0 && <p className="text-sm text-ink-300">No beliefs added yet.</p>}
          <div className="space-y-3">
            {form.beliefs.map((b, i) => (
              <div key={i} className="border border-ink/10 rounded-xl p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    placeholder="Title (e.g. The Trinity)"
                    value={b.title || ''}
                    onChange={(e) => updateBelief(i, 'title', e.target.value)}
                    className="input-field"
                  />
                  <button type="button" onClick={() => removeBelief(i)} className="h-11 w-11 shrink-0 grid place-items-center rounded-xl bg-red-50 text-red-500">
                    <PiTrashBold size={16} />
                  </button>
                </div>
                <textarea
                  placeholder="Description"
                  value={b.description || ''}
                  onChange={(e) => updateBelief(i, 'description', e.target.value)}
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Leaders */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Leadership</p>
            <button type="button" onClick={addLeader} className="text-xs font-semibold text-candle-600 flex items-center gap-1">
              <PiPlusBold /> Add Leader
            </button>
          </div>
          {form.leaders.length === 0 && <p className="text-sm text-ink-300">No leaders added yet.</p>}
          <div className="space-y-4">
            {form.leaders.map((l, i) => (
              <div key={i} className="border border-ink/10 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="shrink-0">
                    {(leaderFiles[i] || l.image?.url) && (
                      <img
                        src={leaderFiles[i] ? URL.createObjectURL(leaderFiles[i]) : l.image.url}
                        alt={l.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLeaderFile(i, e.target.files[0])}
                      className="text-xs mt-1.5 w-16"
                    />
                  </div>
                  <div className="flex-1 grid sm:grid-cols-2 gap-2">
                    <input
                      placeholder="Name"
                      value={l.name || ''}
                      onChange={(e) => updateLeader(i, 'name', e.target.value)}
                      className="input-field"
                    />
                    <input
                      placeholder="Role (e.g. Senior Pastor)"
                      value={l.role || ''}
                      onChange={(e) => updateLeader(i, 'role', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <button type="button" onClick={() => removeLeader(i)} className="h-11 w-11 shrink-0 grid place-items-center rounded-xl bg-red-50 text-red-500">
                    <PiTrashBold size={16} />
                  </button>
                </div>
                <textarea
                  placeholder="Short bio"
                  value={l.bio || ''}
                  onChange={(e) => updateLeader(i, 'bio', e.target.value)}
                  rows={2}
                  className="input-field resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-gold w-full">
          {saving ? 'Saving...' : 'Save About Page'}
        </button>
      </form>
    </div>
  );
}
