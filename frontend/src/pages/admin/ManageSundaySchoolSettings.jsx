import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PiPlusBold, PiTrashBold } from 'react-icons/pi';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';

const CLASS_NAMES = ['Beginners', 'Primary', 'Juniors', 'Seniors'];
const EVENT_TYPES = ['competition', 'event', 'celebration'];
const POSITIONS = ['1st', '2nd', '3rd', 'Consolation Prize'];

// Small reusable image picker: shows a preview (new file if picked, else the
// already-saved url) plus a file input. Nothing is uploaded until the whole
// form is submitted — the File object just rides along in local state.
function ImagePicker({ file, existingUrl, onPick, label }) {
  const previewSrc = file ? URL.createObjectURL(file) : existingUrl;
  return (
    <div className="flex items-center gap-3">
      {previewSrc && <img src={previewSrc} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />}
      <div className="flex-1">
        {label && <label className="label-field">{label}</label>}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onPick(e.target.files[0] || null)}
          className="input-field !py-2 text-xs"
        />
      </div>
    </div>
  );
}

export default function ManageSundaySchoolSettings() {
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
const [studentList, setStudentList] = useState([]);
 useEffect(() => {
  Promise.all([
    api.get('/sunday-school/settings'),
    api.get('/sunday-school/students'),
  ])
    .then(([settingsRes, studentsRes]) => {
      setStudentList(studentsRes.data.data || []);

     const data = res.data.data || {};
setForm({
  classes: (data.classes || []).filter(Boolean),
  schedule: { day: '', time: '', note: '', ...data.schedule },
  events: (data.events || []).filter(Boolean),
  winners: (data.winners || []).filter(Boolean).map((w) => ({
    ...w,
    students: (w.students || []).filter(Boolean),
  })),
  christmas: {
    title: '',
    date: '',
    description: '',
    ...data.christmas,
    images: (data.christmas?.images || []).filter(Boolean),
  },
  gallery: (data.gallery || []).filter(Boolean),
  title: data.title,
  description: data.description,
  image: data.image,
})
    })
    .finally(() => setLoading(false));
}, []);

  if (loading || !form) return <Loader />;

  // ---------- Classes ----------
  const updateClass = (i, key, value) => {
    const classes = [...form.classes];
    classes[i] = { ...classes[i], [key]: value };
    setForm((f) => ({ ...f, classes }));
  };
  const addClass = () => setForm((f) => ({ ...f, classes: [...f.classes, { name: '', ageRange: '', time: '' }] }));
  const removeClass = (i) => setForm((f) => ({ ...f, classes: f.classes.filter((_, idx) => idx !== i) }));

  // ---------- Schedule ----------
  const updateSchedule = (key, value) =>
    setForm((f) => ({ ...f, schedule: { ...f.schedule, [key]: value } }));

  // ---------- Events ----------
  const updateEvent = (i, key, value) => {
    const events = [...form.events];
    events[i] = { ...events[i], [key]: value };
    setForm((f) => ({ ...f, events }));
  };
  const addEvent = () =>
    setForm((f) => ({
      ...f,
      events: [...f.events, { title: '', date: '', type: 'event', class: '', description: '', image: {}, _file: null }],
    }));
  const removeEvent = (i) => setForm((f) => ({ ...f, events: f.events.filter((_, idx) => idx !== i) }));

  // ---------- Winners ----------
  const updateWinner = (i, key, value) => {
    const winners = [...form.winners];
    winners[i] = { ...winners[i], [key]: value };
    setForm((f) => ({ ...f, winners }));
  };
  const addWinner = () =>
    setForm((f) => ({
      ...f,
      winners: [
        ...f.winners,
        { competitionTitle: '', category: '',  gender: '', date: '', class: '', groupImage: {}, _groupImageFile: null, students: [] },
      ],
    }));
  const removeWinner = (i) => setForm((f) => ({ ...f, winners: f.winners.filter((_, idx) => idx !== i) }));

  const updateWinnerStudent = (wi, si, key, value) => {
    const winners = [...form.winners];
    const students = [...(winners[wi].students || [])];
    students[si] = { ...students[si], [key]: value };
    winners[wi] = { ...winners[wi], students };
    setForm((f) => ({ ...f, winners }));
  };
  const handleWinnerStudentSelect = (wi, si, studentId) => {

  const student = studentList.find(s => s._id === studentId);

  if (!student) return;

  const winners = [...form.winners];
  const students = [...winners[wi].students];

  students[si] = {
    ...students[si],
    studentId: student._id,
    name: student.name,
    studentClass: student.class,
    gender: student.gender,
  };

  winners[wi].students = students;

  setForm(f => ({
    ...f,
    winners,
  }));
};
  const addWinnerStudent = (wi) => {
    const winners = [...form.winners];
    winners[wi] = {
      ...winners[wi],
      students: [
        ...(winners[wi].students || []),
        { name: '', studentClass: '',   gender: '', position: 'Consolation Prize', image: {}, _file: null },
      ],
    };
    setForm((f) => ({ ...f, winners }));
  };
  const removeWinnerStudent = (wi, si) => {
    const winners = [...form.winners];
    winners[wi] = { ...winners[wi], students: winners[wi].students.filter((_, idx) => idx !== si) };
    setForm((f) => ({ ...f, winners }));
  };

  // ---------- Christmas ----------
  const updateChristmas = (key, value) =>
    setForm((f) => ({ ...f, christmas: { ...f.christmas, [key]: value } }));

  const updateChristmasImage = (i, key, value) => {
    const images = [...(form.christmas.images || [])];
    images[i] = { ...images[i], [key]: value };
    setForm((f) => ({ ...f, christmas: { ...f.christmas, images } }));
  };
  const addChristmasImage = () =>
    setForm((f) => ({
      ...f,
      christmas: { ...f.christmas, images: [...(f.christmas.images || []), { url: '', caption: '', _file: null }] },
    }));
  const removeChristmasImage = (i) =>
    setForm((f) => ({
      ...f,
      christmas: { ...f.christmas, images: f.christmas.images.filter((_, idx) => idx !== i) },
    }));

  // ---------- Gallery ----------
  const updateGalleryItem = (i, key, value) => {
    const gallery = [...form.gallery];
    gallery[i] = { ...gallery[i], [key]: value };
    setForm((f) => ({ ...f, gallery }));
  };
  const addGalleryItem = () =>
    setForm((f) => ({ ...f, gallery: [...f.gallery, { url: '', caption: '', event: '', _file: null }] }));
  const removeGalleryItem = (i) => setForm((f) => ({ ...f, gallery: f.gallery.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title || '');
      fd.append('description', form.description || '');
      fd.append('classes', JSON.stringify(form.classes || []));
      fd.append('schedule', JSON.stringify(form.schedule || {}));

      // Events: strip transient _file before stringify, attach the actual file separately
      const cleanEvents = (form.events || []).map(({ _file, ...rest }) => rest);
      fd.append('events', JSON.stringify(cleanEvents));
      (form.events || []).forEach((ev, i) => {
        if (ev._file) fd.append(`eventImage_${i}`, ev._file);
      });

      // Winners
      const cleanWinners = (form.winners || []).map(({ _groupImageFile, students, ...rest }) => ({
        ...rest,
        students: (students || []).map(({ _file, ...srest }) => srest),
      }));
      fd.append('winners', JSON.stringify(cleanWinners));
      (form.winners || []).forEach((w, wi) => {
        if (w._groupImageFile) fd.append(`winnerGroupImage_${wi}`, w._groupImageFile);
        (w.students || []).forEach((s, si) => {
          if (s._file) fd.append(`winnerStudentImage_${wi}_${si}`, s._file);
        });
      });

      // Christmas
      const cleanChristmasImages = (form.christmas?.images || []).map(({ _file, ...rest }) => rest);
      fd.append('christmas', JSON.stringify({ ...form.christmas, images: cleanChristmasImages }));
      (form.christmas?.images || []).forEach((img, i) => {
        if (img._file) fd.append(`christmasImage_${i}`, img._file);
      });

      // Gallery
      const cleanGallery = (form.gallery || []).map(({ _file, ...rest }) => rest);
      fd.append('gallery', JSON.stringify(cleanGallery));
      (form.gallery || []).forEach((img, i) => {
        if (img._file) fd.append(`galleryImage_${i}`, img._file);
      });

      if (file) fd.append('image', file);

      const { data } = await api.put('/sunday-school/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({
        classes: [],
        schedule: { day: '', time: '', note: '' },
        events: [],
        winners: [],
        christmas: { title: '', date: '', description: '', images: [] },
        gallery: [],
        ...data.data,
      });
      setFile(null);
      toast.success('Sunday School page updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink mb-2">Sunday School Page</h1>
      <p className="text-sm text-ink-300 mb-6">Controls the public "/sunday-school" page content.</p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <p className="eyebrow">Basic Info</p>
          <div>
            <label className="label-field">Title</label>
            <input value={form.title || ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="label-field">Description</label>
            <textarea
              value={form.description || ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
              className="input-field resize-none"
            />
          </div>
          <ImagePicker label="Banner Image" file={file} existingUrl={form.image?.url} onPick={setFile} />
        </div>

        {/* Schedule */}
        <div className="card p-6 space-y-4">
          <p className="eyebrow">Schedule</p>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="label-field">Day</label>
              <input
                placeholder="e.g. Every Sunday"
                value={form.schedule?.day || ''}
                onChange={(e) => updateSchedule('day', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Time</label>
              <input
                placeholder="e.g. 9:00 AM – 10:00 AM"
                value={form.schedule?.time || ''}
                onChange={(e) => updateSchedule('time', e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">Note / Location</label>
              <input
                placeholder="e.g. Main Hall"
                value={form.schedule?.note || ''}
                onChange={(e) => updateSchedule('note', e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Classes */}
        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Classes</p>
            <button type="button" onClick={addClass} className="text-xs font-semibold text-candle-600 flex items-center gap-1">
              <PiPlusBold /> Add Class
            </button>
          </div>
          {form.classes.length === 0 && <p className="text-sm text-ink-300">No classes added yet.</p>}
          {form.classes.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input placeholder="Name (e.g. Juniors)" value={c.name || ''} onChange={(e) => updateClass(i, 'name', e.target.value)} className="input-field" />
              <input placeholder="Age Range" value={c.ageRange || ''} onChange={(e) => updateClass(i, 'ageRange', e.target.value)} className="input-field" />
              <input placeholder="Time" value={c.time || ''} onChange={(e) => updateClass(i, 'time', e.target.value)} className="input-field" />
              <button type="button" onClick={() => removeClass(i)} className="h-11 w-11 shrink-0 grid place-items-center rounded-xl bg-red-50 text-red-500">
                <PiTrashBold size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Events & Competitions */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Events &amp; Competitions</p>
            <button type="button" onClick={addEvent} className="text-xs font-semibold text-candle-600 flex items-center gap-1">
              <PiPlusBold /> Add Event
            </button>
          </div>
          {form.events.length === 0 && <p className="text-sm text-ink-300">No events added yet.</p>}
          {form.events.map((ev, i) => (
            <div key={i} className="border border-ink-100 rounded-xl p-4 space-y-3">
              <div className="flex justify-end">
                <button type="button" onClick={() => removeEvent(i)} className="text-red-500 text-xs flex items-center gap-1">
                  <PiTrashBold size={14} /> Remove
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <input placeholder="Title" value={ev.title || ''} onChange={(e) => updateEvent(i, 'title', e.target.value)} className="input-field" />
                <input type="date" value={ev.date ? ev.date.slice(0, 10) : ''} onChange={(e) => updateEvent(i, 'date', e.target.value)} className="input-field" />
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <select value={ev.type || 'event'} onChange={(e) => updateEvent(i, 'type', e.target.value)} className="input-field">
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t[0].toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
                <select value={ev.class || ''} onChange={(e) => updateEvent(i, 'class', e.target.value)} className="input-field">
                  <option value="">All Classes</option>
                  {CLASS_NAMES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                placeholder="Description"
                value={ev.description || ''}
                onChange={(e) => updateEvent(i, 'description', e.target.value)}
                rows={2}
                className="input-field resize-none"
              />
              <ImagePicker file={ev._file} existingUrl={ev.image?.url} onPick={(f) => updateEvent(i, '_file', f)} label="Event Image" />
            </div>
          ))}
        </div>

        {/* Winners */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Competition Winners</p>
            <button type="button" onClick={addWinner} className="text-xs font-semibold text-candle-600 flex items-center gap-1">
              <PiPlusBold /> Add Competition
            </button>
          </div>
          {form.winners.length === 0 && <p className="text-sm text-ink-300">No winners added yet.</p>}
          {form.winners.map((w, wi) => (
            <div key={wi} className="border border-ink-100 rounded-xl p-4 space-y-3">
              <div className="flex justify-end">
                <button type="button" onClick={() => removeWinner(wi)} className="text-red-500 text-xs flex items-center gap-1">
                  <PiTrashBold size={14} /> Remove Competition
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <input
                  placeholder="Competition Title"
                  value={w.competitionTitle || ''}
                  onChange={(e) => updateWinner(wi, 'competitionTitle', e.target.value)}
                  className="input-field"
                />
                <input
                  placeholder="Category"
                  value={w.category || ''}
                  onChange={(e) => updateWinner(wi, 'category', e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <input type="date" value={w.date ? w.date.slice(0, 10) : ''} onChange={(e) => updateWinner(wi, 'date', e.target.value)} className="input-field" />
                <select value={w.class || ''} onChange={(e) => updateWinner(wi, 'class', e.target.value)} className="input-field">
                  <option value="">All Classes</option>
                  {CLASS_NAMES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <ImagePicker
                file={w._groupImageFile}
                existingUrl={w.groupImage?.url}
                onPick={(f) => updateWinner(wi, '_groupImageFile', f)}
                label="Group Photo"
              />

              <div className="pl-3 border-l-2 border-candle-100 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink-300">Students</p>
                  <button
                    type="button"
                    onClick={() => addWinnerStudent(wi)}
                    className="text-xs font-semibold text-candle-600 flex items-center gap-1"
                  >
                    <PiPlusBold size={12} /> Add Student
                  </button>
                </div>
                {(w.students || []).map((s, si) => (
                  <div key={si} className="border border-ink-50 rounded-lg p-3 space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <select
  value={s.studentId || ''}
  onChange={(e) =>
      handleWinnerStudentSelect(
          wi,
          si,
          e.target.value
      )
  }
  className="input-field !w-52"
>
  <option value="">Select Student</option>

  {studentList
      .sort((a,b)=>a.name.localeCompare(b.name))
      .map(student=>(
          <option
              key={student._id}
              value={student._id}
          >
              {student.name}
          </option>
      ))}
</select>

<select>
  <input
  value={s.gender || ""}
  readOnly
  className="input-field !w-24"/>

</select>
<select>
                        
<input
  value={s.studentClass || ""}
  readOnly
  className="input-field !w-32"
/>
                      </select>
                      <select
                        value={s.position || 'Consolation Prize'}
                        onChange={(e) => updateWinnerStudent(wi, si, 'position', e.target.value)}
                        className="input-field !w-28"
                      >
                        {POSITIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeWinnerStudent(wi, si)}
                        className="h-9 w-9 shrink-0 grid place-items-center rounded-xl bg-red-50 text-red-500"
                      >
                        <PiTrashBold size={14} />
                      </button>
                    </div>
                    <ImagePicker
                      file={s._file}
                      existingUrl={s.image?.url}
                      onPick={(f) => updateWinnerStudent(wi, si, '_file', f)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Christmas */}
        <div className="card p-6 space-y-4">
          <p className="eyebrow">Christmas</p>
          <div className="grid sm:grid-cols-2 gap-2">
            <input
              placeholder="Title"
              value={form.christmas?.title || ''}
              onChange={(e) => updateChristmas('title', e.target.value)}
              className="input-field"
            />
            <input
              type="date"
              value={form.christmas?.date ? form.christmas.date.slice(0, 10) : ''}
              onChange={(e) => updateChristmas('date', e.target.value)}
              className="input-field"
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.christmas?.description || ''}
            onChange={(e) => updateChristmas('description', e.target.value)}
            rows={3}
            className="input-field resize-none"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-ink-300">Photos</p>
              <button type="button" onClick={addChristmasImage} className="text-xs font-semibold text-candle-600 flex items-center gap-1">
                <PiPlusBold size={12} /> Add Photo
              </button>
            </div>
            {(form.christmas?.images || []).map((img, i) => (
              <div key={i} className="border border-ink-50 rounded-lg p-3 space-y-2">
                <ImagePicker file={img._file} existingUrl={img.url} onPick={(f) => updateChristmasImage(i, '_file', f)} />
                <div className="flex gap-2">
                  <input
                    placeholder="Caption (optional)"
                    value={img.caption || ''}
                    onChange={(e) => updateChristmasImage(i, 'caption', e.target.value)}
                    className="input-field"
                  />
                  <button type="button" onClick={() => removeChristmasImage(i)} className="h-11 w-11 shrink-0 grid place-items-center rounded-xl bg-red-50 text-red-500">
                    <PiTrashBold size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Gallery</p>
            <button type="button" onClick={addGalleryItem} className="text-xs font-semibold text-candle-600 flex items-center gap-1">
              <PiPlusBold /> Add Photo
            </button>
          </div>
          {form.gallery.length === 0 && <p className="text-sm text-ink-300">No gallery photos added yet.</p>}
          {form.gallery.map((img, i) => (
            <div key={i} className="border border-ink-50 rounded-lg p-3 space-y-2">
              <ImagePicker file={img._file} existingUrl={img.url} onPick={(f) => updateGalleryItem(i, '_file', f)} />
              <div className="flex gap-2">
                <input placeholder="Caption" value={img.caption || ''} onChange={(e) => updateGalleryItem(i, 'caption', e.target.value)} className="input-field" />
                <input placeholder="Event (optional)" value={img.event || ''} onChange={(e) => updateGalleryItem(i, 'event', e.target.value)} className="input-field" />
                <button type="button" onClick={() => removeGalleryItem(i)} className="h-11 w-11 shrink-0 grid place-items-center rounded-xl bg-red-50 text-red-500">
                  <PiTrashBold size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={saving} className="btn-gold w-full">
          {saving ? 'Saving...' : 'Save Sunday School Page'}
        </button>
      </form>
    </div>
  );
}