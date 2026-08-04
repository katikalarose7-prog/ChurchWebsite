import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiMapPinBold, PiPhoneBold, PiEnvelopeSimpleBold, PiNavigationArrowBold } from 'react-icons/pi';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';

const initialForm = { name: '', email: '', subject: '', message: '' };

const CHURCH_ADDRESS = '17-4, 41/3, David St, Pezzonipet, Vijayawada, Andhra Pradesh 520003';

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [homepage, setHomepage] = useState(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    api.get('/homepage').then((res) => setHomepage(res.data.data));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in your name, email, and message');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      toast.success("Message sent. We'll be in touch soon!");
      setForm(initialForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetDirections = () => {
    const destination = encodeURIComponent(homepage?.address || CHURCH_ADDRESS);

    if (!navigator.geolocation) {
      // No geolocation support — open directions with destination only,
      // Google will ask the user for their location on its own site.
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocating(false);
        window.open(
          `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination}&travelmode=driving`,
          '_blank'
        );
      },
      () => {
        setLocating(false);
        toast.error('Could not access your location. Opening directions without it.');
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const mapQuery = encodeURIComponent(homepage?.address || CHURCH_ADDRESS);

  return (
    <div>
      <PageHeader eyebrow="Let's Connect" title="Contact Us" subtitle="We'd love to hear from you." />

      <div className="page-container space-y-6">
        <div className="grid sm:grid-cols-3 gap-3">
          {homepage?.address && (
            <div className="card p-4 flex items-start gap-3">
              <PiMapPinBold className="text-candle-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-ink-400">{homepage.address}</p>
            </div>
          )}
          {homepage?.phone && (
            <div className="card p-4 flex items-start gap-3">
              <PiPhoneBold className="text-candle-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-ink-400">{homepage.phone}</p>
            </div>
          )}
          {homepage?.email && (
            <div className="card p-4 flex items-start gap-3">
              <PiEnvelopeSimpleBold className="text-candle-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-ink-400">{homepage.email}</p>
            </div>
          )}
        </div>

        {/* Map + Form side by side */}
        {/* Map + Form side by side */}
<div className="grid lg:grid-cols-2 gap-6 items-stretch">
  <div className="card p-4 space-y-3 flex flex-col">
    <div className="flex items-center justify-between flex-wrap gap-2">
      <h3 className="font-semibold text-ink-700">Find Us</h3>
      <button
        type="button"
        onClick={handleGetDirections}
        disabled={locating}
        className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm"
      >
        <PiNavigationArrowBold size={16} />
        {locating ? 'Locating you...' : 'Get Directions'}
      </button>
    </div>
    <div className="w-full flex-1 min-h-[280px] rounded-lg overflow-hidden border border-ink-100">
      <iframe
        title="Church location map"
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
      />
    </div>
  </div>

          <form onSubmit={handleSubmit} className="card p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Your name" />
              </div>
              <div>
                <label className="label-field">Email</label>
                <input name="email" value={form.email} onChange={handleChange} className="input-field" placeholder="you@email.com" />
              </div>
            </div>
            <div>
              <label className="label-field">Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange} className="input-field" placeholder="How can we help?" />
            </div>
            <div>
              <label className="label-field">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                className="input-field resize-none"
                placeholder="Write your message..."
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}