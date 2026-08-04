import AdminResourceManager from './AdminResourceManager.jsx';
import { PiCalendarBold } from 'react-icons/pi';

export default function ManageEvents() {
  return (
    <AdminResourceManager
      title="Events"
      endpoint="/events"
      emptyIcon={PiCalendarBold}
      renderItem={(e) => e.title}
      renderMeta={(e) => `${new Date(e.startDate).toLocaleDateString()} · ${e.location}`}
      imageField={{ name: 'image', label: 'Event Image' }}
      fields={[
        { name: 'title', label: 'Title', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'End Date', type: 'date' },
        { name: 'location', label: 'Location' },
        {
          name: 'category',
          label: 'Category',
          type: 'select',
          options: ['Service', 'Conference', 'Outreach', 'Youth', 'Kids', 'Other'],
        },
        { name: 'registrationLink', label: 'Registration Link' },
        { name: 'isFeatured', label: 'Featured Event', type: 'checkbox' },
      ]}
    />
  );
}
