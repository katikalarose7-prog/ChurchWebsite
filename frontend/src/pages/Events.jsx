import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import PageHeader from '../components/PageHeader.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { PiCalendarBold, PiMapPinBold } from 'react-icons/pi';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/events')
      .then((res) => setEvents(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.startDate) >= now);
  const past = events.filter((e) => new Date(e.startDate) < now);

  const EventCard = ({ e }) => (
    <div className="card overflow-hidden">
      {e.image?.url && <img src={e.image.url} alt={e.title} className="w-full h-40 object-cover" />}
      <div className="p-4">
        <span className="text-[10px] font-bold uppercase tracking-wide text-candle-500">{e.category}</span>
        <h3 className="font-display font-semibold text-ink mt-1">{e.title}</h3>
        <p className="text-xs text-ink-300 mt-2 flex items-center gap-1 flex-wrap">
          <PiCalendarBold />
          {new Date(e.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          <PiMapPinBold className="ml-2" /> {e.location}
        </p>
        {e.description && <p className="text-sm text-ink-400 mt-2 line-clamp-2">{e.description}</p>}
        {e.registrationLink && (
          <a href={e.registrationLink} target="_blank" rel="noreferrer" className="btn-gold !py-2 !px-4 text-xs mt-3 inline-flex">
            Register
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader eyebrow="Gather With Us" title="Events" subtitle="What's happening at our church this season." />

      <div className="page-container">
        {loading ? (
          <Loader />
        ) : events.length === 0 ? (
          <EmptyState icon={PiCalendarBold} title="No events scheduled" />
        ) : (
          <>
            {!!upcoming.length && (
              <div className="mb-8">
                <p className="eyebrow mb-3">Upcoming</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.map((e) => (
                    <EventCard key={e._id} e={e} />
                  ))}
                </div>
              </div>
            )}
            {!!past.length && (
              <div>
                <p className="eyebrow mb-3">Past Events</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
                  {past.map((e) => (
                    <EventCard key={e._id} e={e} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
