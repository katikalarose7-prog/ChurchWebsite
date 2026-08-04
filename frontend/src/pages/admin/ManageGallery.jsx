import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiPlusBold, PiTrashBold, PiImagesBold } from 'react-icons/pi';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function ManageGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [album, setAlbum] = useState('General');
  const [title, setTitle] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get('/gallery')
      .then((res) => setImages(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Select at least one image');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('album', album);
      fd.append('title', title);
      Array.from(files).forEach((f) => fd.append('images', f));
      await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Images uploaded');
      setModalOpen(false);
      setFiles([]);
      setTitle('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Gallery</h1>
        <button onClick={() => setModalOpen(true)} className="btn-gold !py-2.5 !px-4 text-sm">
          <PiPlusBold /> Upload Photos
        </button>
      </div>

      {loading ? (
        <Loader />
      ) : images.length === 0 ? (
        <EmptyState icon={PiImagesBold} title="No photos yet" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img._id} className="relative aspect-square rounded-2xl overflow-hidden group">
              <img src={img.image.url} alt={img.title} className="w-full h-full object-cover" />
              <button
                onClick={() => remove(img._id)}
                className="absolute top-2 right-2 h-8 w-8 rounded-full bg-ink/70 text-white grid place-items-center"
              >
                <PiTrashBold size={14} />
              </button>
              <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-white/90 px-2 py-0.5 rounded-full text-ink">
                {img.album}
              </span>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 flex items-end sm:items-center sm:justify-center" onClick={() => setModalOpen(false)}>
          <form onSubmit={handleUpload} onClick={(e) => e.stopPropagation()} className="bg-white rounded-t-app sm:rounded-app w-full sm:max-w-md p-6">
            <h2 className="font-display text-lg font-semibold text-ink mb-4">Upload Photos</h2>
            <div className="space-y-4">
              <div>
                <label className="label-field">Album</label>
                <input value={album} onChange={(e) => setAlbum(e.target.value)} className="input-field" placeholder="e.g. Youth Camp 2026" />
              </div>
              <div>
                <label className="label-field">Title (optional)</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label-field">Images</label>
                <input type="file" accept="image/*" multiple onChange={(e) => setFiles(e.target.files)} className="input-field !py-2.5" />
              </div>
            </div>
            <button type="submit" disabled={uploading} className="btn-gold w-full mt-6">
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
