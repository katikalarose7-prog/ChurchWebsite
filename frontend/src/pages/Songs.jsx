import { useEffect, useState } from 'react';
import { PiMagnifyingGlassBold, PiMusicNotesBold, PiXBold } from 'react-icons/pi';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Songs() {
  const [songs, setSongs] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api
      .get('/songs')
      .then((res) => setSongs(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <PageHeader eyebrow="Sing With Us" title="Songs" subtitle="Lyrics and worship songs from our services." />

      <div className="page-container">
        <div className="relative mb-5 lg:max-w-md">
          <PiMagnifyingGlassBold className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs or artists..."
            className="input-field pl-11"
          />
        </div>

        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState icon={PiMusicNotesBold} title="No songs found" subtitle="Try a different search term." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((s) => (
              <button
                key={s._id}
                onClick={() => setActive(active?._id === s._id ? null : s)}
                className="card p-4 w-full text-left flex items-center gap-4"
              >
                {s.coverImage?.url ? (
                  <img src={s.coverImage.url} alt={s.title} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-candle-100 text-candle-500 grid place-items-center shrink-0">
                    <PiMusicNotesBold size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-ink truncate">{s.title}</p>
                  <p className="text-xs text-ink-300">{s.artist || s.category}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center sm:justify-center"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-white rounded-t-app sm:rounded-app w-full sm:max-w-lg max-h-[80vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">{active.title}</h3>
                <p className="text-sm text-ink-300">{active.artist}</p>
              </div>
              <button onClick={() => setActive(null)} className="text-ink-300">
                <PiXBold size={20} />
              </button>
            </div>
            {active.youtubeUrl && (
              <a href={active.youtubeUrl} target="_blank" rel="noreferrer" className="btn-secondary !py-2 !px-4 text-xs mb-4 inline-flex">
                Watch on YouTube
              </a>
            )}
            <p className="text-ink-400 text-[15px] leading-loose whitespace-pre-line">
              {active.lyrics || 'Lyrics coming soon.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
