import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  PiQrCodeBold,
  PiCopyBold,
  PiCheckBold,
  PiDeviceMobileBold,
  PiHeartStraightBold,
} from 'react-icons/pi';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';

const causes = ['General Offering', 'Tithe', 'Building Fund', 'Missions', 'Youth Ministry', 'Other'];

const initialForm = { name: '', phone: '', cause: 'General Offering', amount: '', transactionId: '', note: '' };

export default function Give() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    api
      .get('/giving/settings')
      .then((res) => setSettings(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const copyUpiId = async () => {
    if (!settings?.upiId) return;
    try {
      await navigator.clipboard.writeText(settings.upiId);
      setCopied(true);
      toast.success('UPI ID copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — please copy it manually');
    }
  };

  const upiPayLink = () => {
    if (!settings?.upiId) return '#';
    const params = new URLSearchParams({
      pa: settings.upiId,
      pn: settings.payeeName || 'Church',
      cu: 'INR',
    });
    if (form.amount) params.set('am', form.amount);
    if (form.cause) params.set('tn', form.cause);
    return `upi://pay?${params.toString()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.cause) {
      toast.error('Please share your name and the cause of your offering');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/giving', form);
      toast.success('Thank you for your generosity! We have recorded your offering.');
      setForm(initialForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader
        eyebrow="Give Online"
        title="Tithe & Offering"
        subtitle="Scan the QR code or pay via UPI, then let us know so we can direct your gift to the right place."
      />

      <div className="page-container-narrow space-y-6">
        {/* Scripture */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 sm:p-8 bg-ink text-parchment-100 relative overflow-hidden"
        >
          <p className="eyebrow !text-candle-300 mb-3">God Loves a Cheerful Giver</p>
          <p className="font-display text-lg sm:text-xl leading-relaxed">
            "Remember this: Whoever sows sparingly will also reap sparingly, and whoever sows generously will also
            reap generously. Each of you should give what you have decided in your heart to give, not reluctantly or
            under compulsion, for God loves a cheerful giver. And God is able to bless you abundantly, so that in
            all things at all times, having all that you need, you will abound in every good work."
          </p>
          <p className="text-sm text-parchment-100/60 mt-4">— 2 Corinthians 9:6-8</p>
        </motion.div>

        {!settings?.isEnabled ? (
          <div className="card p-6 text-center text-ink-300 text-sm">
            Online giving is temporarily unavailable. Please reach out to us directly — see the{' '}
            <a href="/contact" className="text-candle-500 font-semibold">
              Contact
            </a>{' '}
            page.
          </div>
        ) : (
          <>
            {/* QR Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-6 text-center">
              {settings?.qrImage?.url ? (
                <button onClick={() => setLightboxOpen(true)} className="inline-block">
                  <img
                    src={settings.qrImage.url}
                    alt="UPI QR Code"
                    className="h-56 w-56 mx-auto rounded-2xl object-contain border border-ink/10 p-3 bg-white"
                  />
                </button>
              ) : (
                <div className="h-56 w-56 mx-auto rounded-2xl bg-ink/5 flex flex-col items-center justify-center gap-2 text-ink-300">
                  <PiQrCodeBold size={40} />
                  <p className="text-xs">QR code coming soon</p>
                </div>
              )}

              {settings?.upiId && (
                <div className="mt-4 inline-flex items-center gap-2 bg-ink/5 rounded-full px-4 py-2">
                  <span className="text-sm font-semibold text-ink">{settings.upiId}</span>
                  <button onClick={copyUpiId} aria-label="Copy UPI ID" className="text-ink-400">
                    {copied ? <PiCheckBold className="text-sage-600" /> : <PiCopyBold />}
                  </button>
                </div>
              )}

              {settings?.upiId && (
                <a href={upiPayLink()} className="btn-gold w-full mt-4">
                  <PiDeviceMobileBold /> Pay with UPI App
                </a>
              )}
              <p className="text-xs text-ink-300 mt-2">"Pay with UPI App" works best on a mobile phone with GPay, PhonePe, Paytm, etc. installed.</p>

              {settings?.instructions && <p className="text-sm text-ink-400 leading-relaxed mt-5 text-left">{settings.instructions}</p>}
            </motion.div>

            {/* Intimation form */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <PiHeartStraightBold className="text-candle-500" size={20} />
                <h2 className="section-title !text-xl">Let Us Know You Gave</h2>
              </div>
              <form onSubmit={handleSubmit} className="card p-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Your Name</label>
                    <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Full name" />
                  </div>
                  <div>
                    <label className="label-field">Phone (optional)</label>
                    <input name="phone" value={form.phone} onChange={handleChange} className="input-field" placeholder="+91..." />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label-field">Cause of Offering</label>
                    <select name="cause" value={form.cause} onChange={handleChange} className="input-field">
                      {causes.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label-field">Amount (optional)</label>
                    <input
                      type="number"
                      min="0"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="₹"
                    />
                  </div>
                </div>
                <div>
                  <label className="label-field">Note (optional)</label>
                  <textarea name="note" value={form.note} onChange={handleChange} rows={2} className="input-field resize-none" />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
                <p className="text-xs text-ink-300 text-center">
                  This form only records your intimation — it does not process payment. Please complete your UPI payment separately using the QR code or UPI ID above.
                </p>
              </form>
            </div>
          </>
        )}
      </div>

      {lightboxOpen && settings?.qrImage?.url && (
        <div className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4" onClick={() => setLightboxOpen(false)}>
          <img src={settings.qrImage.url} alt="UPI QR Code" className="max-h-[85vh] max-w-full rounded-2xl bg-white p-4 object-contain" />
        </div>
      )}
    </div>
  );
}
