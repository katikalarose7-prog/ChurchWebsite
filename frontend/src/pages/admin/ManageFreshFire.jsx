import AdminResourceManager from './AdminResourceManager.jsx';
import { PiFireBold } from 'react-icons/pi';

export default function ManageFreshFire() {
  return (
    <AdminResourceManager
      title="Fresh Fire Videos"
      endpoint="/fresh-fire"
      emptyIcon={PiFireBold}
      renderItem={(v) => v.title}
      renderMeta={(v) => new Date(v.createdAt).toLocaleDateString()}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'youtubeUrl', label: 'YouTube URL', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
      ]}
    />
  );
}
