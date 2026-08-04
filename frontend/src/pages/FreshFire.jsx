import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import YouTubeEmbed from '../components/YouTubeEmbed.jsx';
import { PiFireBold, PiPlayFill } from 'react-icons/pi';

export default function FreshFire() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api
      .get('/fresh-fire')
      .then((res) => {
        setVideos(res.data.data);
        if (res.data.data.length) setActive(res.data.data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  if (videos.length === 0) {
    return (
      <div className="page-container pt-8">
        <PageHeader eyebrow="Revival Moments" title="Fresh Fire" subtitle="Fresh Fire worship and revival videos." />
        <EmptyState icon={PiFireBold} title="No videos uploaded yet" />
      </div>
    );
  }

  const isLatest = active?._id === videos[0]._id;

  return (
    <div>
      <PageHeader eyebrow="Revival Moments" title="Fresh Fire" subtitle="Fresh Fire worship and revival videos." />

      <div className="page-container">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
          {/* Player column */}
          <div className="lg:col-span-2 mb-6 lg:mb-0">
            {active && (
              <>
                <YouTubeEmbed
                  videoId={active.youtubeVideoId}
                  title={active.title}
                  autoplay={isLatest}
                  muted={isLatest}
                />
                <div className="flex items-center gap-2 mt-4">
                  {isLatest && (
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-candle-100 text-candle-600">
                      Newest
                    </span>
                  )}
                  <h2 className="font-display text-xl lg:text-2xl font-semibold text-ink">{active.title}</h2>
                </div>
                <p className="text-sm text-ink-300 mt-1">
                  Added {new Date(active.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                {active.description && <p className="text-ink-400 text-sm mt-3 leading-relaxed">{active.description}</p>}
              </>
            )}
          </div>

          {/* Playlist column */}
          <div className="lg:col-span-1">
            <p className="eyebrow mb-3">All Videos</p>
            <div className="space-y-3 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1">
              {videos.map((v, i) => (
                <button
                  key={v._id}
                  onClick={() => setActive(v)}
                  className={`w-full text-left card p-3 flex gap-4 items-center transition-shadow ${
                    active?._id === v._id ? 'ring-2 ring-candle' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={`https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`}
                      alt={v.title}
                      className="h-16 w-24 rounded-xl object-cover"
                    />
                    <span className="absolute inset-0 grid place-items-center bg-ink/30 rounded-xl">
                      <PiPlayFill className="text-white" size={18} />
                    </span>
                    {i === 0 && (
                      <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold uppercase bg-candle-500 text-white px-1.5 py-0.5 rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-ink text-sm line-clamp-2">{v.title}</p>
                    <p className="text-xs text-ink-300 mt-1">{new Date(v.createdAt).toLocaleDateString()}</p>
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
