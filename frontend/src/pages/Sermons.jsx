import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import YouTubeEmbed from '../components/YouTubeEmbed.jsx';
import { PiPlayCircleBold, PiPlayFill } from 'react-icons/pi';

export default function Sermons() {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api
      .get('/sermons')
      .then((res) => {
        setSermons(res.data.data);
        if (res.data.data.length) setActive(res.data.data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (sermons.length === 0) {
    return (
      <div className="page-container pt-8">
        <PageHeader eyebrow="Grow in the Word" title="Sermons" subtitle="Watch messages from our services." />
        <EmptyState icon={PiPlayCircleBold} title="No sermons uploaded yet" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Grow in the Word" title="Sermons" subtitle="Watch messages from our services." />

      <div className="page-container">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
          {/* Player column */}
          <div className="lg:col-span-2 mb-6 lg:mb-0">
            {active && (
              <>
                <YouTubeEmbed videoId={active.youtubeVideoId} title={active.title} />
                <h2 className="font-display text-xl lg:text-2xl font-semibold text-ink mt-4">{active.title}</h2>
                <p className="text-sm text-ink-300 mt-1">
                  {active.speaker} ·{' '}
                  {new Date(active.datePreached).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                {active.description && (
                  <p className="text-ink-400 text-sm mt-3 leading-relaxed">{active.description}</p>
                )}
              </>
            )}
          </div>

          {/* Playlist column */}
          <div className="lg:col-span-1">
            <p className="eyebrow mb-3">More Sermons</p>
            <div className="space-y-3 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1">
              {sermons.map((s) => (
                <button
                  key={s._id}
                  onClick={() => setActive(s)}
                  className={`w-full text-left card p-3 flex gap-4 items-center transition-shadow ${
                    active?._id === s._id ? 'ring-2 ring-candle' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={s.thumbnail?.url || `https://img.youtube.com/vi/${s.youtubeVideoId}/hqdefault.jpg`}
                      alt={s.title}
                      className="h-16 w-24 rounded-xl object-cover"
                    />
                    {active?._id === s._id && (
                      <span className="absolute inset-0 grid place-items-center bg-ink/30 rounded-xl">
                        <PiPlayFill className="text-white" size={18} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-ink text-sm line-clamp-2">{s.title}</p>
                    <p className="text-xs text-ink-300 mt-1">{s.speaker}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
