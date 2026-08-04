import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { PiPlusBold, PiTrashBold, PiWalletBold } from 'react-icons/pi';

const todayStr = () => new Date().toISOString().slice(0, 10);
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function ManageSundayFinance() {
  const [summary, setSummary] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [offeringForm, setOfferingForm] = useState({ date: todayStr(), amount: '', note: '' });
  const [expenseForm, setExpenseForm] = useState({ title: '', date: todayStr(), amount: '', note: '' });
  const [savingOffering, setSavingOffering] = useState(false);
  const [savingExpense, setSavingExpense] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/sunday-school/finance-summary'),
      api.get('/sunday-school/offerings'),
      api.get('/sunday-school/expenses'),
    ])
      .then(([s, o, e]) => {
        setSummary(s.data.data);
        setOfferings(o.data.data);
        setExpenses(e.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const addOffering = async (e) => {
    e.preventDefault();
    if (!offeringForm.date || !offeringForm.amount) {
      toast.error('Date and amount are required');
      return;
    }
    setSavingOffering(true);
    try {
      await api.post('/sunday-school/offerings', offeringForm);
      toast.success('Offering recorded');
      setOfferingForm({ date: todayStr(), amount: '', note: '' });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record offering');
    } finally {
      setSavingOffering(false);
    }
  };

  const addExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.date || !expenseForm.amount) {
      toast.error('Title, date, and amount are required');
      return;
    }
    setSavingExpense(true);
    try {
      await api.post('/sunday-school/expenses', expenseForm);
      toast.success('Expense recorded');
      setExpenseForm({ title: '', date: todayStr(), amount: '', note: '' });
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record expense');
    } finally {
      setSavingExpense(false);
    }
  };

  const removeOffering = async (id) => {
    if (!window.confirm('Delete this offering record?')) return;
    await api.delete(`/sunday-school/offerings/${id}`);
    loadAll();
  };
  const removeExpense = async (id) => {
    if (!window.confirm('Delete this expense record?')) return;
    await api.delete(`/sunday-school/expenses/${id}`);
    loadAll();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Sunday School Finance</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card p-4">
          <p className="text-xs font-semibold text-ink-300 uppercase">Offerings</p>
          <p className="font-display text-xl font-semibold text-sage-600 mt-1">{inr(summary.totalOfferings)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold text-ink-300 uppercase">Expenses</p>
          <p className="font-display text-xl font-semibold text-red-500 mt-1">{inr(summary.totalExpenses)}</p>
        </div>
        <div className="card p-4 bg-ink text-parchment-100">
          <p className="text-xs font-semibold text-parchment-100/60 uppercase flex items-center gap-1">
            <PiWalletBold /> Remaining
          </p>
          <p className="font-display text-xl font-semibold text-candle-300 mt-1">{inr(summary.remaining)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Offerings */}
        <div>
          <h2 className="font-display text-lg font-semibold text-ink mb-3">Offerings</h2>
          <form onSubmit={addOffering} className="card p-4 space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={offeringForm.date}
                onChange={(e) => setOfferingForm((f) => ({ ...f, date: e.target.value }))}
                className="input-field !py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                placeholder="Amount ₹"
                value={offeringForm.amount}
                onChange={(e) => setOfferingForm((f) => ({ ...f, amount: e.target.value }))}
                className="input-field !py-2 text-sm"
              />
            </div>
            <input
              placeholder="Note (optional)"
              value={offeringForm.note}
              onChange={(e) => setOfferingForm((f) => ({ ...f, note: e.target.value }))}
              className="input-field !py-2 text-sm"
            />
            <button type="submit" disabled={savingOffering} className="btn-gold w-full !py-2 text-sm">
              <PiPlusBold /> Add Offering
            </button>
          </form>

          {offerings.length === 0 ? (
            <EmptyState icon={PiWalletBold} title="No offerings recorded yet" />
          ) : (
            <div className="space-y-2">
              {offerings.map((o) => (
                <div key={o._id} className="card p-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink text-sm">{inr(o.amount)}</p>
                    <p className="text-xs text-ink-300">
                      {new Date(o.date).toLocaleDateString()} {o.note && `· ${o.note}`}
                    </p>
                  </div>
                  <button onClick={() => removeOffering(o._id)} className="h-8 w-8 grid place-items-center rounded-lg bg-red-50 text-red-500 shrink-0">
                    <PiTrashBold size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses */}
        <div>
          <h2 className="font-display text-lg font-semibold text-ink mb-3">Expenses</h2>
          <form onSubmit={addExpense} className="card p-4 space-y-3 mb-4">
            <input
              placeholder="Title (e.g. Craft supplies)"
              value={expenseForm.title}
              onChange={(e) => setExpenseForm((f) => ({ ...f, title: e.target.value }))}
              className="input-field !py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) => setExpenseForm((f) => ({ ...f, date: e.target.value }))}
                className="input-field !py-2 text-sm"
              />
              <input
                type="number"
                min="0"
                placeholder="Amount ₹"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))}
                className="input-field !py-2 text-sm"
              />
            </div>
            <button type="submit" disabled={savingExpense} className="btn-primary w-full !py-2 text-sm">
              <PiPlusBold /> Add Expense
            </button>
          </form>

          {expenses.length === 0 ? (
            <EmptyState icon={PiWalletBold} title="No expenses recorded yet" />
          ) : (
            <div className="space-y-2">
              {expenses.map((ex) => (
                <div key={ex._id} className="card p-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink text-sm">{ex.title} — {inr(ex.amount)}</p>
                    <p className="text-xs text-ink-300">{new Date(ex.date).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => removeExpense(ex._id)} className="h-8 w-8 grid place-items-center rounded-lg bg-red-50 text-red-500 shrink-0">
                    <PiTrashBold size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
