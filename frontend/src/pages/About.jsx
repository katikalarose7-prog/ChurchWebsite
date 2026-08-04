import { useEffect, useState } from 'react';
import { PiBookOpenBold, PiTargetBold, PiEyeBold, PiSparkleBold } from 'react-icons/pi';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';

export default function About() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/about')
      .then((res) => setAbout(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <PageHeader eyebrow="Who We Are" title="About Our Church" />

      {about?.image?.url && (
        <div className="page-container-narrow mb-8">
          <div className="relative rounded-app overflow-hidden">
            <img
              src={about.image.url}
              alt="Our church"
              className="w-full h-140 lg:h-100 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
          </div>
        </div>
      )}

      <div className="page-container-narrow space-y-10">
        {about?.story && (
          <div className="card p-6 lg:p-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-candle-100 text-candle-600 grid place-items-center shrink-0">
                <PiBookOpenBold size={18} />
              </div>
              <h2 className="font-display text-xl font-semibold text-ink">Our Story</h2>
            </div>
            <p className="text-ink-400 text-[15px] leading-relaxed whitespace-pre-line">{about.story}</p>
          </div>
        )}

        {(about?.mission || about?.vision) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {about?.mission && (
              <div className="card p-6 border-l-4 !border-l-candle-500">
                <div className="flex items-center gap-2 mb-2.5">
                  <PiTargetBold className="text-candle-500" size={18} />
                  <p className="eyebrow !mb-0">Mission</p>
                </div>
                <p className="text-ink-400 text-sm leading-relaxed">{about.mission}</p>
              </div>
            )}
            {about?.vision && (
              <div className="card p-6 border-l-4 !border-l-ink">
                <div className="flex items-center gap-2 mb-2.5">
                  <PiEyeBold className="text-ink" size={18} />
                  <p className="eyebrow !mb-0">Vision</p>
                </div>
                <p className="text-ink-400 text-sm leading-relaxed">{about.vision}</p>
              </div>
            )}
          </div>
        )}

        {!!about?.beliefs?.length && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <PiSparkleBold className="text-candle-500" size={20} />
              <h2 className="font-display text-xl font-semibold text-ink">What We Believe</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {about.beliefs.map((b, i) => (
                <div key={i} className="card p-4 hover:shadow-md transition-shadow">
                  <p className="font-display font-semibold text-ink">{b.title}</p>
                  <p className="text-sm text-ink-300 mt-1.5 leading-relaxed">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!!about?.leaders?.length && (
  <div>
    <h2 className="font-display text-xl font-semibold text-ink mb-4">Our Leadership</h2>
    <div className="grid sm:grid-cols-3 gap-6">
      {about.leaders.map((l, i) => (
        <div
          key={i}
          className="card p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
        >
          {l.image?.url ? (
            <img
              src={l.image.url}
              alt={l.name}
              className="h-[233px] w-[233px] rounded-3xl object-cover shrink-0 mb-4 ring-4 ring-candle-100"
            />
          ) : (
            <div className="h-[82px] w-[82px] rounded-3xl bg-ink/10 shrink-0 mb-4" />
          )}
          <p className="font-display font-semibold text-lg text-ink">{l.name}</p>
          <p className="text-xs uppercase tracking-wide text-candle-500 font-semibold mt-1">{l.role}</p>
          <p className="text-sm text-ink-300 mt-3 leading-relaxed">{l.bio}</p>
        </div>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
}