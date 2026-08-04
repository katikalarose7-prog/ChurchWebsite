import AdminResourceManager from './AdminResourceManager.jsx';
import { PiBookBookmarkBold } from 'react-icons/pi';

export default function ManageWord() {
  return (
    <AdminResourceManager
      title="Weekly Word"
      endpoint="/weekly-word"
      emptyIcon={PiBookBookmarkBold}
      renderItem={(w) => w.title}
      renderMeta={(w) => `${w.scriptureReference} · ${new Date(w.weekOf).toLocaleDateString()}`}
      imageField={{ name: 'image', label: 'Cover Image' }}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'scriptureReference', label: 'Scripture Reference (e.g. John 3:16)', required: true },
        { name: 'scriptureText', label: 'Scripture Text', type: 'textarea' },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
        { name: 'author', label: 'Author' },
        { name: 'weekOf', label: 'Week Of', type: 'date', required: true },
        { name: 'isPublished', label: 'Published', type: 'checkbox' },
      ]}
    />
  );
}
