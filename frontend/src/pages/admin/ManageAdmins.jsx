import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiPlusBold, PiTrashBold, PiKeyBold, PiUsersBold } from 'react-icons/pi';
import api from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const initialForm = { name: '', email: '', password: '', role: 'content_admin' };

export default function ManageAdmins() {
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/admins')
      .then((res) => setAdmins(res.data.admins))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admins', form);
      toast.success('Admin created');
      setModalOpen(false);
      setForm(initialForm);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create admin');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (a) => {
    try {
      await api.put(`/admins/${a._id}`, { isActive: !a.isActive });
      toast.success(a.isActive ? 'Admin deactivated' : 'Admin activated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const changeRole = async (a, role) => {
    try {
      await api.put(`/admins/${a._id}`, { role });
      toast.success('Role updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const resetPassword = async (a) => {
    const newPassword = window.prompt(`New password for ${a.name} (min 8 characters):`);
    if (!newPassword) return;
    try {
      await api.put(`/admins/${a._id}/reset-password`, { newPassword });
      toast.success('Password reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const remove = async (a) => {
    if (!window.confirm(`Remove ${a.name} permanently?`)) return;
    try {
      await api.delete(`/admins/${a._id}`);
      toast.success('Admin removed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove admin');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Manage Admins</h1>
        <button onClick={() => setModalOpen(true)} className="btn-gold !py-2.5 !px-4 text-sm">
          <PiPlusBold /> Add Admin
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : admins.length === 0 ? (
        <EmptyState icon={PiUsersBold} title="No admins found" />
      ) : (
        <div className="space-y-3">
          {admins.map((a) => (
            <div key={a._id} className="card p-4 flex items-center gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink flex items-center gap-2">
                  {a.name}
                  {a._id === currentAdmin._id && <span className="text-[10px] bg-ink/5 text-ink-300 px-2 py-0.5 rounded-full">You</span>}
                  {a.isOwner && <span className="text-[10px] bg-candle-100 text-candle-600 px-2 py-0.5 rounded-full font-semibold">Owner</span>}
                  {!a.isActive && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full">Inactive</span>}
                </p>
                <p className="text-xs text-ink-300 mt-1">{a.email}</p>
              </div>

              <select
                value={a.role}
                onChange={(e) => changeRole(a, e.target.value)}
                disabled={a._id === currentAdmin._id}
                className="input-field !w-auto !py-2 text-xs"
              >
                <option value="super_admin">Super Admin</option>
                <option value="content_admin">Content Admin</option>
                <option value="sunday_school_admin">Sunday School Admin</option>
              </select>

              <button onClick={() => resetPassword(a)} className="h-9 w-9 grid place-items-center rounded-xl bg-ink/5 text-ink" title="Reset Password">
                <PiKeyBold size={16} />
              </button>
              <button
                onClick={() => toggleActive(a)}
                disabled={a._id === currentAdmin._id}
                className="text-xs font-semibold px-3 py-2 rounded-xl bg-ink/5 text-ink-400 disabled:opacity-40"
              >
                {a.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => remove(a)}
                disabled={a._id === currentAdmin._id}
                className="h-9 w-9 grid place-items-center rounded-xl bg-red-50 text-red-500 disabled:opacity-40"
              >
                <PiTrashBold size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center sm:justify-center" onClick={() => setModalOpen(false)}>
          <form onSubmit={handleCreate} onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-app sm:rounded-app w-full sm:max-w-md p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Add New Admin</h2>
            <div className="space-y-4">
              <div>
                <label className="label-field">Name</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label-field">Password</label>
                <input required type="password" minLength={8} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label-field">Role</label>
                <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="input-field">
                  <option value="content_admin">Content Admin</option>
                  <option value="sunday_school_admin">Sunday School Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-gold w-full mt-6">
              {saving ? 'Creating...' : 'Create Admin'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
