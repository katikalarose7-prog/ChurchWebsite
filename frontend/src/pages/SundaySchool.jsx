import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PiClockBold,
  PiUsersThreeBold,
  PiHandsPrayingBold,
  PiCalendarCheckBold,
  PiTrophyBold,
  PiMedalBold,
  PiGiftBold,
  PiImagesBold,
  PiMapPinBold,
  PiChalkboardTeacherBold,
} from 'react-icons/pi';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const initialForm = { name: '', studentClass: '', request: '' };

const EVENT_TYPE_STYLES = {
  competition: { label: 'Competition', className: 'bg-candle-50 text-candle-700 border-candle-200' },
  event: { label: 'Event', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  celebration: { label: 'Celebration', className: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const POSITION_STYLES = {
  '1st': { label: '1st Place', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  '2nd': { label: '2nd Place', className: 'bg-slate-100 text-slate-700 border-slate-300' },
  '3rd': { label: '3rd Place', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  ConsolationPrize: { label: 'Consolation Prize', className: 'bg-ink-50 text-ink-300 border-ink-100' },
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

export default function SundaySchool() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get('/sunday-school/settings')
      .then((res) => setSettings(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.request) {
      toast.error('Please share your name and prayer request');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/sunday-school/prayer-requests', form);
      toast.success('Thank you — we will be praying!');
      setForm(initialForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  const schedule = settings?.schedule;
  const hasEvents = !!settings?.events?.length;
  const hasWinners = !!settings?.winners?.length;
  const hasChristmas = settings?.christmas?.title && (settings.christmas.description || settings.christmas.images?.length);
  const hasGallery = !!settings?.gallery?.length;

  return (
    <div>
      <PageHeader eyebrow="For Our Kids" title={settings?.title || 'Sunday School'} subtitle={settings?.description} />

      {settings?.image?.url && (
        <div className="page-container-narrow mb-6">
          <img src={settings.image.url} alt="Sunday School" className="w-full h-56 object-cover rounded-app" />
        </div>
      )}

      <div className="page-container-narrow space-y-10">
        {/* Sunday School timing — the one thing every parent needs at a glance */}
        {schedule && (schedule.day || schedule.time) && (
          <div className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4 bg-candle-50/60 border-candle-100">
            <div className="w-12 h-12 rounded-full bg-candle-500 text-white flex items-center justify-center shrink-0">
              <PiCalendarCheckBold size={22} />
            </div>
            <div className="flex-1">
              <p className="eyebrow !mb-1">Sunday School Meets</p>
              <p className="font-display font-semibold text-ink text-lg">
                {schedule.day} · {schedule.time}
              </p>
              {schedule.note && (
                <p className="text-sm text-ink-300 mt-1 flex items-center gap-1">
                  <PiMapPinBold /> {schedule.note}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Classes */}
        <div>
          <p className="eyebrow mb-3 flex items-center gap-1.5">
            <PiUsersThreeBold /> Classes
          </p>

          {!!settings?.classes?.length ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {settings.classes.map((c, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display font-semibold text-ink">{c.name}</p>
                    {c.ageRange && (
                      <span className="text-xs font-semibold text-candle-700 bg-candle-50 border border-candle-200 rounded-full px-2 py-0.5 whitespace-nowrap">
                        {c.ageRange}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {c.time && (
                      <p className="text-xs text-ink-300 flex items-center gap-1">
                        <PiClockBold /> {c.time}
                      </p>
                    )}
                    {c.teacher && (
                      <p className="text-xs text-ink-300 flex items-center gap-1">
                        <PiChalkboardTeacherBold /> {c.teacher}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={PiUsersThreeBold} title="Class schedule coming soon" />
          )}
        </div>

        {/* Events & Competitions */}
        {hasEvents && (
          <div>
            <p className="eyebrow mb-3 flex items-center gap-1.5">
              <PiTrophyBold /> Events &amp; Competitions
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {settings.events.map((ev, i) => {
                const style = EVENT_TYPE_STYLES[ev.type] || EVENT_TYPE_STYLES.event;
                return (
                  <div key={i} className="card overflow-hidden">
                    {ev.image?.url && (
                      <img src={ev.image.url} alt={ev.title} className="w-full h-36 object-cover" />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${style.className}`}>
                          {style.label}
                        </span>
                        {ev.date && <span className="text-xs text-ink-300">{formatDate(ev.date)}</span>}
                      </div>
<div className="flex items-center justify-between gap-2 flex-wrap">
  <p className="font-display font-semibold text-ink">
    {ev.title}
  </p>

  {ev.class && (
    <span className="px-2 py-1 rounded-full bg-candle-50 text-candle-700 text-xs font-semibold border border-candle-200">
      {ev.class}
    </span>
  )}
</div>                      {ev.description && <p className="text-sm text-ink-300 mt-1">{ev.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Winners */}
        {hasWinners && (
          <div>
            <p className="eyebrow mb-3 flex items-center gap-1.5">
              <PiMedalBold /> Competition Winners
            </p>
            <div className="space-y-4">
              {settings.winners.map((w, i) => (
                <div key={i} className="card p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {w.groupImage?.url && (
                      <img
                        src={w.groupImage.url}
                        alt={w.competitionTitle}
                        className="w-full sm:w-40 h-28 object-cover rounded-app shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
<div className="flex items-center gap-2 flex-wrap">
  <p className="font-display font-semibold text-ink">
    {w.competitionTitle}
  </p>

  {w.class && (
    <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
      {w.class}
    </span>
  )}
</div>                        {w.date && <span className="text-xs text-ink-300">{formatDate(w.date)}</span>}
                      </div>
                      {w.category && <p className="text-xs text-candle-700 font-semibold mt-0.5">{w.category}</p>}

                      {!!w.students?.length && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {w.students.map((s, j) => {
                            const pos = POSITION_STYLES[s.position] || POSITION_STYLES.ConsolationPrize;
                            return (
                              <div
                                key={j}
                                className={`flex items-center gap-2 border rounded-app pl-1 pr-3 py-1 ${pos.className}`}
                              >
                                {s.image?.url ? (
                                  <img src={s.image.url} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                                ) : (
                                  <span className="w-7 h-7 rounded-full bg-white/60 flex items-center justify-center">
                                    <PiMedalBold size={14} />
                                  </span>
                                )}
                                <div className="leading-tight">
                                  <p className="text-xs font-semibold">{s.name}</p>
                                  <p className="text-[11px] opacity-80">
                                    {pos.label}
                                    {s.studentClass ? ` · ${s.studentClass}` : ''}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Christmas */}
        {hasChristmas && (
          <div>
            <p className="eyebrow mb-3 flex items-center gap-1.5">
              <PiGiftBold /> Christmas
            </p>
            <div className="card p-5 border-2 border-candle-200 bg-candle-50/50">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <p className="font-display font-semibold text-ink text-lg">{settings.christmas.title}</p>
                {settings.christmas.date && (
                  <span className="text-xs font-semibold text-candle-700">{formatDate(settings.christmas.date)}</span>
                )}
              </div>
              {settings.christmas.description && (
                <p className="text-sm text-ink-300">{settings.christmas.description}</p>
              )}
              {!!settings.christmas.images?.length && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
                  {settings.christmas.images.map((img, i) => (
                    <img
                      key={i}
                      src={img.url}
                      alt={img.caption || 'Christmas celebration'}
                      className="w-full h-24 object-cover rounded-app"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Gallery */}
        {hasGallery && (
          <div>
            <p className="eyebrow mb-3 flex items-center gap-1.5">
              <PiImagesBold /> Gallery
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {settings.gallery.map((img, i) => (
                <div key={i} className="group">
                  <img
                    src={img.url}
                    alt={img.caption || img.event || 'Sunday School event'}
                    className="w-full h-28 object-cover rounded-app transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                  {(img.caption || img.event) && (
                    <p className="text-[11px] text-ink-300 mt-1 truncate">{img.caption || img.event}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prayer request */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <PiHandsPrayingBold className="text-candle-500" size={20} />
            <h2 className="section-title !text-xl">Prayer Request for Your Child</h2>
          </div>
          <form onSubmit={handleSubmit} className="card p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label-field">Your Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="input-field" placeholder="Parent/Guardian name" />
              </div>
              <div>
                <label className="label-field">Class (optional)</label>
                <select name="studentClass" value={form.studentClass} onChange={handleChange} className="input-field">
                  <option value="">Select class</option>
                  {['Beginners', 'Primary', 'Juniors', 'Seniors'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label-field">Prayer Request</label>
              <textarea
                name="request"
                value={form.request}
                onChange={handleChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Share what you'd like us to pray for..."
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-gold w-full">
              {submitting ? 'Submitting...' : 'Submit Prayer Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}