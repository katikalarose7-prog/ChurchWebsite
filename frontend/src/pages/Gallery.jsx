import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PiImagesBold, PiXBold } from 'react-icons/pi';

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [album, setAlbum] = useState('All');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/gallery/albums').then((res) => setAlbums(res.data.albums));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get('/gallery', { params: album !== 'All' ? { album } : {} })
      .then((res) => setImages(res.data.data))
      .finally(() => setLoading(false));
  }, [album]);

  return (
    <div>
      <PageHeader eyebrow="Moments Together" title="Gallery" subtitle="Photos from our services, events, and community life." />

      <div className="page-container">
        {!!albums.length && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-5 px-5">
            {['All', ...albums].map((a) => (
              <button
                key={a}
                onClick={() => setAlbum(a)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold ${
                  album === a ? 'bg-ink text-parchment-100' : 'bg-white text-ink-400 border border-ink/10'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : images.length === 0 ? (
          <EmptyState icon={PiImagesBold} title="No photos yet" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {images.map((img) => (
              <button key={img._id} onClick={() => setLightbox(img)} className="aspect-square rounded-2xl overflow-hidden">
                <img src={img.image.url} alt={img.title || 'Gallery'} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 text-white" onClick={() => setLightbox(null)}>
            <PiXBold size={24} />
          </button>
          <img src={lightbox.image.url} alt={lightbox.title} className="max-h-[85vh] max-w-full rounded-2xl object-contain" />
        </div>
      )}
    </div>
  );
}
