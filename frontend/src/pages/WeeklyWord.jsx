import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PiBookBookmarkBold } from 'react-icons/pi';

export default function WeeklyWord() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/weekly-word')
      .then((res) => setWords(res.data.data.filter((w) => w.isPublished)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader eyebrow="Be Fed" title="Weekly Word" subtitle="A message to encourage and challenge your walk this week." />

      <div className="page-container">
        {loading ? (
          <Loader />
        ) : words.length === 0 ? (
          <EmptyState icon={PiBookBookmarkBold} title="No messages yet" />
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {words.map((w) => (
              <article key={w._id} className="card overflow-hidden">
                {w.image?.url && <img src={w.image.url} alt={w.title} className="w-full h-40 object-cover" />}
                <div className="p-5">
                  <p className="eyebrow mb-2">
                    {w.scriptureReference} · {new Date(w.weekOf).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-ink">{w.title}</h2>
                  {w.scriptureText && (
                    <p className="text-sm text-candle-600 italic mt-2">&ldquo;{w.scriptureText}&rdquo;</p>
                  )}
                  <p className="text-ink-400 text-[15px] leading-relaxed mt-3 whitespace-pre-line">{w.message}</p>
                  <p className="text-xs text-ink-300 mt-3 font-semibold">— {w.author}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
