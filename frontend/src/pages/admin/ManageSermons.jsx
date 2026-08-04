import AdminResourceManager from './AdminResourceManager.jsx';
import { PiPlayCircleBold } from 'react-icons/pi';

export default function ManageSermons() {
  return (
    <AdminResourceManager
      title="Sermons"
      endpoint="/sermons"
      emptyIcon={PiPlayCircleBold}
      renderItem={(s) => s.title}
      renderMeta={(s) => `${s.speaker} · ${new Date(s.datePreached).toLocaleDateString()}`}
      imageField={{ name: 'thumbnail', label: 'Thumbnail (optional — YouTube thumbnail used otherwise)' }}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'speaker', label: 'Speaker' },
        { name: 'series', label: 'Series' },
        { name: 'youtubeUrl', label: 'YouTube URL', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'datePreached', label: 'Date Preached', type: 'date', required: true },
      ]}
    />
  );
}
