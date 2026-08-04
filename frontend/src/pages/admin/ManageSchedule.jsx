import AdminResourceManager from './AdminResourceManager.jsx';
import { PiClockBold } from 'react-icons/pi';

export default function ManageSchedule() {
  return (
    <AdminResourceManager
      title="Prayer Schedule"
      endpoint="/prayer-schedule"
      emptyIcon={PiClockBold}
      renderItem={(s) => `${s.day} — ${s.title}`}
      renderMeta={(s) => `${s.time} · ${s.location}`}
      fields={[
        {
          name: 'day',
          label: 'Day',
          type: 'select',
          required: true,
          options: ['Monday - Saturday','Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        },
        { name: 'title', label: 'Title', required: true },
        { name: 'time', label: 'Time (e.g. 6:00 AM - 7:00 AM)', required: true },
        { name: 'focus', label: 'Prayer Focus' },
        { name: 'location', label: 'Location' },
        { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
      ]}
    />
  );
}
