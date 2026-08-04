import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PiArrowRightBold, PiCalendarBlankBold, PiMapPinBold, PiPlayFill, PiHeartStraightBold, PiClockBold, PiChalkboardTeacherBold, PiFireBold } from 'react-icons/pi';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import YouTubeEmbed from '../components/YouTubeEmbed.jsx';
const dayOrder = ['Monday - Saturday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function Home() {
  const [homepage, setHomepage] = useState(null);
  const [word, setWord] = useState(null);
  const [events, setEvents] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
const [gallery, setGallery] = useState([]);
const [freshFire, setFreshFire] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [hp, w, ev, sm, sc, gal, ff] = await Promise.all([
          api.get('/homepage'),
          api.get('/weekly-word/latest'),
          api.get('/events/upcoming'),
          api.get('/sermons'),
          api.get('/prayer-schedule'),   // ← new
          api.get("/gallery"),
  api.get('/fresh-fire'), // ← changed from /fresh-fire/latest
        ]);
        setHomepage(hp.data.data);
        setWord(w.data.data);
        setEvents(ev.data.data.slice(0, 3));
        setSermons(sm.data.data.slice(0, 3));
const sortedSchedules = sc.data.data
  .filter((s) => s.isActive)
  .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
setSchedules(sortedSchedules.slice(0, 4));   // ← new        
setGallery(gal.data.data.slice(0,6));
setFreshFire(ff.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Preparing your home page..." />;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-candle-glow border-b border-ink/5">
        <div className="page-container pt-10 pb-14 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="max-w-xl">
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow mb-3 lg:text-2xl">
                New Covenant Church
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink leading-[1.08] tracking-tight"
              >
                {homepage?.heroTitle || 'HEAVEN ON EARTH'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-ink-300 mt-4 text-[15px] lg:text-lg leading-relaxed max-w-md"
              >
                {homepage?.heroSubtitle || 'A place you should have FELLOWSHIP.'}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-wrap gap-3 mt-7"
              >
                <Link to="/prayer-requests" className="btn-gold">
                  Submit a Prayer Request
                </Link>
                <Link to="/sermons" className="btn-secondary">
                  <PiPlayFill /> Watch Sermons
                </Link>
                <Link to="/fresh-fire" className="btn-secondary">
                  <PiPlayFill /> Fresh Fire
                </Link>
                <Link to="/give" className="btn-secondary">
                  <PiHeartStraightBold /> Give Online
                </Link>
              </motion.div>

              {/* Sunday Services */}
              {!!homepage?.serviceTimes?.length && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-9"
                >
                  <p className="text-xs font-semibold text-ink-300 uppercase tracking-[0.16em]">
                    Sunday Services
                  </p>
                  <div className="mt-3 rounded-2xl bg-white shadow-soft ring-1 ring-ink/5 divide-y divide-ink/6 overflow-hidden">
                    {homepage.serviceTimes.map((s, i) => (
                      <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-candle-500 shrink-0" />
                        <span className="text-sm text-ink-400 flex-1">{s.label}</span>
                        <span className="font-display text-base font-semibold text-ink tabular-nums">
                          {s.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Hero image / verse panel - desktop only decorative column */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="hidden lg:block"
            >
              {homepage?.heroImage?.url ? (
                <img
                  src={homepage.heroImage.url}
                  alt="Our church"
                  className="w-full h-[420px] object-cover rounded-app shadow-soft"
                />
              ) : (
                <div className="w-full h-[420px] rounded-app bg-ink flex items-center justify-center relative overflow-hidden shadow-soft">
                  <div className="absolute inset-0 bg-candle-glow opacity-70" />
                  <span className="relative font-display text-8xl text-candle/30 select-none">+</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="page-container">
        {/* Verse of the day 
        {homepage?.verseOfTheDay?.text && (
          <section className="py-6">
            <div className="card p-6 sm:p-8 bg-ink text-parchment-100 relative overflow-hidden">
              <p className="eyebrow !text-candle-300 mb-3">Verse of the Day</p>
              <p className="font-display text-xl sm:text-2xl leading-snug max-w-2xl">
                &ldquo;{homepage.verseOfTheDay.text}&rdquo;
              </p>
              <p className="text-sm text-parchment-100/60 mt-3">— {homepage.verseOfTheDay.reference}</p>
            </div>
          </section>
        )} */}

        {/* Weekly Prayer Schedule */}
      {!!schedules.length && (
<section className="py-8 md:py-12">

    <div className="flex items-center justify-between mb-6 gap-4">

        <div>
            <p className="eyebrow mb-1">
                Join Us
            </p>

            <h2 className="section-title">
                Weekly Prayer Schedule
            </h2>
        </div>

        <Link 
            to="/prayer-schedule" 
            className="
                text-sm 
                font-semibold 
                text-candle-500 
                flex 
                items-center 
                gap-1 
                shrink-0
                hover:text-candle-600
                transition
            "
        >
            See all <PiArrowRightBold />
        </Link>

    </div>


    <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-4 
        gap-4 
        md:gap-5
    ">

        {schedules.map((s) => (

            <motion.div
                key={s._id}
                whileHover={{ 
                    y: -6,
                    scale: 1.02
                }}
                whileTap={{
                    scale:0.98
                }}
                transition={{ 
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                }}
                className="
                    group
                    relative
                    overflow-hidden
                    rounded-3xl
                    bg-white
                    border
                    border-ink/10
                    shadow-soft
                    hover:shadow-lift
                    transition-all
                    duration-300
                    cursor-pointer
                "
            >

                {/* Top Header */}
                <div className="
                    bg-gradient-to-r
                    from-ink
                    to-ink/90
                    px-5
                    py-4
                    flex
                    items-center
                    justify-between
                ">

                    <span className="
                        text-xs
                        font-semibold
                        uppercase
                        tracking-widest
                        text-parchment-100/80
                    ">
                        {s.day}
                    </span>


                    <div className="
                        w-8
                        h-8
                        rounded-full
                        bg-candle-500/10
                        flex
                        items-center
                        justify-center
                        group-hover:bg-candle-500/20
                        transition
                    ">
                        <PiClockBold 
                            className="text-candle-400" 
                            size={16}
                        />
                    </div>

                </div>


                {/* Content */}
                <div className="p-5">

                    <h3 className="
                        font-display
                        font-semibold
                        text-ink
                        text-base
                        md:text-lg
                        leading-snug
                        line-clamp-2
                        group-hover:text-candle-600
                        transition
                    ">
                        {s.title}
                    </h3>


                    <div className="
                        mt-4
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-ink-300
                    ">

                        <PiClockBold size={14}/>

                        <span className="font-medium">
                            {s.time}
                        </span>

                    </div>

                </div>


                {/* Hover bottom line */}
                <div className="
                    absolute
                    bottom-0
                    left-0
                    h-1
                    w-0
                    bg-candle-500
                    group-hover:w-full
                    transition-all
                    duration-500
                "/>

            </motion.div>

        ))}

    </div>

</section>
)}

        {/* Fresh Fire */}
  {/* Fresh Fire */}
{!!freshFire.length && (
  <section className="py-8 md:py-12">
    <div className="flex items-center justify-between mb-6 gap-4">
      <div>
        <p className="eyebrow mb-1 flex items-center gap-1.5">
          <PiFireBold className="text-candle-500" /> Latest Uploads
        </p>
        <h2 className="section-title">Fresh Fire</h2>
        <p>Carrying the fire from our altar to yours</p>
      </div>
      <Link
        to="/fresh-fire"
        className="text-sm font-semibold text-candle-500 flex items-center gap-1 shrink-0 hover:text-candle-600 transition"
      >
        See all <PiArrowRightBold />
      </Link>
    </div>

    <div className="grid lg:grid-cols-3 gap-5">
      {/* Featured — big player, spans 2 of 3 columns on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="lg:col-span-2 rounded-3xl overflow-hidden shadow-lift bg-ink"
      >
        <YouTubeEmbed
          videoId={freshFire[0].youtubeVideoId}
          title={freshFire[0].title}
          autoplay
          muted
        />
        <div className="p-5 bg-white">
          <h3 className="font-display text-lg sm:text-xl font-semibold text-ink">
            {freshFire[0].title}
          </h3>
          {freshFire[0].description && (
            <p className="text-ink-300 text-sm mt-1 line-clamp-2">
              {freshFire[0].description}
            </p>
          )}
        </div>
      </motion.div>

      {/* Side list — smaller thumbnails, 3 other recent uploads */}
      <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-5 px-5 lg:mx-0 lg:px-0 snap-x">
        {freshFire.slice(1, 4).map((v) => (
          <Link
            key={v._id}
            to="/fresh-fire"
            className="snap-start shrink-0 w-56 lg:w-auto card overflow-hidden flex lg:flex-col group"
          >
            <div className="relative overflow-hidden shrink-0 lg:w-full w-28 aspect-video">
              <img
                src={v.thumbnail?.url || `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg`}
                alt={v.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-ink/20 group-hover:bg-ink/10 transition-colors flex items-center justify-center">
                <span className="h-8 w-8 rounded-full bg-white/90 grid place-items-center">
                  <PiPlayFill className="text-ink ml-0.5" size={14} />
                </span>
              </div>
            </div>
            <div className="p-3 min-w-0">
              <p className="font-display font-semibold text-ink text-sm line-clamp-2">
                {v.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
)}

        {/* Weekly Word + Recent sermons side by side on desktop */}
        <div className="">
          {word && (
            <section className="py-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">This Week's Word</h2>
                <Link to="/weekly-word" className="text-sm font-semibold text-candle-500 flex items-center gap-1 shrink-0">
                  See all <PiArrowRightBold />
                </Link>
              </div>
              <Link to="/weekly-word" className="card p-5 lg:p-6 block h-full">
                <p className="eyebrow mb-2">{word.scriptureReference}</p>
                <h3 className="font-display text-xl font-semibold text-ink">{word.title}</h3>
                <p className="text-ink-300 text-sm mt-2 line-clamp-4">{word.message}</p>
              </Link>
            </section>
          )}

          {!!sermons.length && (
            <section className="py-6 lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Recent Sermons</h2>
                <Link to="/sermons" className="text-sm font-semibold text-candle-500 flex items-center gap-1 shrink-0">
                  See all <PiArrowRightBold />
                </Link>
              </div>
              <div className="flex lg:grid lg:grid-cols-3 gap-4 overflow-x-auto lg:overflow-visible pb-2 -mx-5 px-5 lg:mx-0 lg:px-0 snap-x">
                {sermons.map((s) => (
                  <Link key={s._id} to="/sermons" className="snap-start shrink-0 w-64 lg:w-auto card overflow-hidden group">
                    <div className="relative overflow-hidden">
                      <img
                        src={s.thumbnail?.url || `https://img.youtube.com/vi/${s.youtubeVideoId}/hqdefault.jpg`}
                        alt={s.title}
                        className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-ink/20 group-hover:bg-ink/10 transition-colors flex items-center justify-center">
                        <span className="h-9 w-9 rounded-full bg-white/90 grid place-items-center">
                          <PiPlayFill className="text-ink ml-0.5" size={16} />
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="font-display font-semibold text-ink line-clamp-1">{s.title}</p>
                      <p className="text-xs text-ink-300 mt-1">{s.speaker}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Upcoming events */}
       {/* Upcoming Events */}
{!!events.length && (
  <section className="py-10">
    <div className="flex items-center justify-between mb-8">
      <div>
        <p className="text-candle-500 uppercase tracking-[0.2em] text-xs font-semibold">
          Join Us
        </p>

        <h2 className="section-title mt-2">
          Upcoming Events
        </h2>

        <p className="mt-2 text-ink-300 max-w-xl">
          Stay connected with our upcoming worship services, conferences,
          fellowships and special church events.
        </p>
      </div>

       <Link to="/events" className="text-sm font-semibold text-candle-500 flex items-center gap-1 shrink-0">
                See all <PiArrowRightBold />
              </Link>
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      {events.map((e) => (
        <motion.div
          key={e._id}
          whileHover={{
            y: -6,
            scale: 1.01,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 20,
          }}
          className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-candle-300 transition-all duration-300"
        >
          <div className="flex">

            {/* Date */}
<div className="w-24 self-stretch shrink-0 bg-[#F8F5EE] border-r border-[#E9E3D8] flex flex-col items-center justify-center px-4 py-6">    <div className="h-3 w-3 rounded-full bg-candle-400 mb-5"></div>

    <span className="text-5xl font-bold font-display leading-none text-ink">
        {new Date(e.startDate).getDate()}
    </span>

    <span className="mt-2 text-xs uppercase tracking-[0.25em] font-semibold text-candle-600">
        {new Date(e.startDate).toLocaleString("en-US", {
            month: "short",
        })}
    </span>
</div>

            {/* Details */}
            <div className="flex-1 p-6">

              <h3 className="font-display text-xl font-semibold text-slate-900 mb-5">
                {e.title}
              </h3>

              <div className="space-y-3">

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <PiCalendarBlankBold className="text-candle-500 shrink-0" />
                  <span>
                    {new Date(e.startDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <PiClockBold className="text-candle-500 shrink-0" />
                  <span>
                    {new Date(e.startDate).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <PiMapPinBold className="text-candle-500 shrink-0" />
                  <span className="line-clamp-1">
                    {e.location}
                  </span>
                </div>

              </div>

              {e.description && (
                <p className="mt-5 text-sm leading-6 text-slate-500 line-clamp-2">
                  {e.description}
                </p>
              )}

            </div>

          </div>
        </motion.div>
      ))}
    </div>
  </section>
)}

        {/* Sunday School */}
        <section className="py-10">
          <div className="rounded-app bg-ink text-parchment-100 p-8 sm:p-10 relative overflow-hidden sm:flex items-center justify-between gap-8">
            <div className="absolute inset-0 bg-candle-glow opacity-40 pointer-events-none" />
            <div className="relative flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-candle-500/15 text-candle-300 grid place-items-center shrink-0">
                <PiChalkboardTeacherBold size={24} />
              </div>
              <div>
                <p className="eyebrow !text-candle-300 mb-1">For Our Kids</p>
                <h2 className="font-display text-2xl font-semibold">Sunday School</h2>
                <p className="text-parchment-100/70 text-sm mt-2 max-w-md">
                  Beginners, Primary, Juniors and Seniors classes every Sunday — a fun, faith-filled hour just for
                  our children.
                </p>
              </div>
            </div>
            <Link to="/sunday-school" className="relative btn-gold mt-6 sm:mt-0 shrink-0 inline-flex">
              Learn More <PiArrowRightBold />
            </Link>
          </div>
        </section>

        {/* Gallery load */}

{!!gallery.length && (
<section className="py-8 md:py-12">

    <div className="flex items-start justify-between mb-6 md:mb-8 gap-4">

        <div>
            <p className="eyebrow">
                Our Church
            </p>

            <h2 className="section-title">
                Photo Gallery
            </h2>

            <p className="text-ink-300 mt-2 text-sm md:text-base">
                Moments of worship, fellowship and God's faithfulness.
            </p>
        </div>

        <Link 
            to="/gallery" 
            className="text-sm font-semibold text-candle-500 flex items-center gap-1 shrink-0 mt-2"
        >
            See all <PiArrowRightBold />
        </Link>

    </div>


    <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        md:grid-cols-3 
        gap-4 
        md:gap-5
    ">

        {gallery.map((item) => (

            <motion.div
                key={item._id}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.25 }}
                className="
                    group 
                    overflow-hidden 
                    rounded-2xl 
                    md:rounded-3xl 
                    shadow-soft 
                    cursor-pointer
                    aspect-[4/3]
                    md:aspect-[4/3]
                "
            >

                <img
                    src={item.image.url}
                    alt={item.title}
                    loading="lazy"
                    className="
                        w-full 
                        h-full 
                        object-cover 
                        group-hover:scale-110 
                        transition-transform 
                        duration-500
                    "
                />

            </motion.div>

        ))}

    </div>

</section>
)}

        {/* Call to action band */}
        <section className="py-10">
          <div className="rounded-app bg-sage-100 p-8 sm:p-10 text-center sm:text-left sm:flex items-center justify-between gap-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">New here? We'd love to meet you.</h2>
              <p className="text-ink-400 text-sm mt-2 max-w-md">
                Reach out and we'll help you find your place in our church family.
              </p>
            </div>
            <Link to="/contact" className="btn-primary mt-5 sm:mt-0 shrink-0 inline-flex">
              Get in Touch <PiArrowRightBold />
            </Link>
          </div>
        </section>



      
      </div>
    </div>
  );
}
