import AdminResourceManager from './AdminResourceManager.jsx';
import { PiMusicNotesBold } from 'react-icons/pi';

export default function ManageSongs() {
  return (
    <AdminResourceManager
      title="Songs"
      endpoint="/songs"
      emptyIcon={PiMusicNotesBold}
      renderItem={(s) => s.title}
      renderMeta={(s) => `${s.artist || 'Unknown artist'} · ${s.category}`}
      imageField={{ name: 'coverImage', label: 'Cover Image' }}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'artist', label: 'Artist' },
        { name: 'category', label: 'Category' },
        { name: 'youtubeUrl', label: 'YouTube URL' },
        { name: 'lyrics', label: 'Lyrics', type: 'textarea' },
      ]}
    />
  );
}
