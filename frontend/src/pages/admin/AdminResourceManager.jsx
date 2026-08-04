import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiPlusBold, PiPencilSimpleBold, PiTrashBold, PiXBold } from 'react-icons/pi';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

/**
 * fields: [{ name, label, type: 'text'|'textarea'|'date'|'select'|'checkbox', options?, required? }]
 * imageField: { name, label } | null
 * endpoint: '/songs' etc.
 * renderItem(item): string preview for list row title
 * renderMeta(item): string preview for list row subtitle
 */
export default function AdminResourceManager({ title, endpoint, fields, imageField, renderItem, renderMeta, emptyIcon }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => setItems(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [endpoint]);

  const openCreate = () => {
    const defaults = {};
    fields.forEach((f) => (defaults[f.name] = f.defaultValue !== undefined ? f.defaultValue : f.type === 'checkbox' ? false : ''));
    setForm(defaults);
    setFile(null);
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    const values = {};
    fields.forEach((f) => {
      let v = item[f.name];
      if (f.type === 'date' && v) v = new Date(v).toISOString().slice(0, 10);
      values[f.name] = v ?? (f.type === 'checkbox' ? false : '');
    });
    setForm(values);
    setFile(null);
    setEditing(item);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Only resources with an image field have multer configured on the
      // backend route, so only send multipart/form-data for those. Every
      // other resource (e.g. Prayer Schedule) should send plain JSON —
      // sending FormData to a route with no multer middleware means Express
      // can't parse the body at all, and every field arrives empty.
      let payload;
      let config;
      if (imageField) {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (file) fd.append(imageField.name, file);
        payload = fd;
        config = { headers: { 'Content-Type': 'multipart/form-data' } };
      } else {
        payload = form;
        config = undefined;
      }

      if (editing) {
        await api.put(`${endpoint}/${editing._id}`, payload, config);
        toast.success('Updated successfully');
      } else {
        await api.post(endpoint, payload, config);
        toast.success('Created successfully');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this item permanently?')) return;
    try {
      await api.delete(`${endpoint}/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        <button onClick={openCreate} className="btn-gold !py-2.5 !px-4 text-sm">
          <PiPlusBold /> Add New
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState icon={emptyIcon} title={`No ${title.toLowerCase()} yet`} subtitle="Click 'Add New' to create the first entry." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="card p-4 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink truncate">{renderItem(item)}</p>
                {renderMeta && <p className="text-xs text-ink-300 mt-1 truncate">{renderMeta(item)}</p>}
              </div>
              <button onClick={() => openEdit(item)} className="h-9 w-9 grid place-items-center rounded-xl bg-ink/5 text-ink shrink-0">
                <PiPencilSimpleBold size={16} />
              </button>
              <button onClick={() => remove(item._id)} className="h-9 w-9 grid place-items-center rounded-xl bg-red-50 text-red-500 shrink-0">
                <PiTrashBold size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center sm:justify-center" onClick={() => setModalOpen(false)}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-app sm:rounded-app w-full sm:max-w-lg max-h-[90vh] overflow-y-auto p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-ink">{editing ? 'Edit' : 'Add'} {title}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="text-ink-300">
                <PiXBold size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((f) => (
                <div key={f.name}>
                  {f.type === 'checkbox' ? (
                    <label className="flex items-center gap-2 text-sm text-ink-400">
                      <input type="checkbox" name={f.name} checked={!!form[f.name]} onChange={handleChange} className="rounded" />
                      {f.label}
                    </label>
                  ) : (
                    <>
                      <label className="label-field">{f.label}</label>
                      {f.type === 'textarea' ? (
                        <textarea
                          name={f.name}
                          value={form[f.name] || ''}
                          onChange={handleChange}
                          rows={4}
                          required={f.required}
                          className="input-field resize-none"
                        />
                      ) : f.type === 'select' ? (
                        <select name={f.name} value={form[f.name] || ''} onChange={handleChange} required={f.required} className="input-field">
                          <option value="" disabled>
                            Select {f.label.toLowerCase()}
                          </option>
                          {f.options.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={f.type || 'text'}
                          name={f.name}
                          value={form[f.name] || ''}
                          onChange={handleChange}
                          required={f.required}
                          className="input-field"
                        />
                      )}
                    </>
                  )}
                </div>
              ))}

              {imageField && (
                <div>
                  <label className="label-field">{imageField.label}</label>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="input-field !py-2.5" />
                  {editing?.[imageField.name]?.url && !file && (
                    <img src={editing[imageField.name].url} alt="" className="mt-2 h-20 w-20 rounded-xl object-cover" />
                  )}
                </div>
              )}
            </div>

            <button type="submit" disabled={saving} className="btn-gold w-full mt-6">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
