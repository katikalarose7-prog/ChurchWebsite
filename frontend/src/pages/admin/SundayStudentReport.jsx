import { useEffect, useMemo, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PiDownloadBold, PiPrinterBold, PiCalendarBold, PiTrophyBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const CLASSES = ['Beginners', 'Primary', 'Juniors', 'Seniors'];
const UNSPECIFIED_CLASS = 'Unspecified';
const POSITIONS = [
  "1st",
  "2nd",
  "3rd",
  "Consolation Prize",
];
// 'Boy' / 'Girl' are the only values the student/winner forms ever submit.
const GENDER_LABELS = { Boy: 'Boys', Girl: 'Girls' };

const FIELD_OPTIONS = [
  { key: 'name', label: 'Name', header: 'Name', always: true },
  { key: 'class', label: 'Class', header: 'Class', always: true },
  { key: 'gender', label: 'Gender', header: 'Gender', always: true },
  { key: 'phone', label: 'Phone', header: 'Phone' },
  { key: 'parentName', label: 'Parent/Guardian', header: 'Parent/Guardian' },
  { key: 'address', label: 'Address', header: 'Address' },
  { key: 'notes', label: 'Notes', header: 'Notes' },
  { key: 'status', label: 'Status', header: 'Status' },
  { key: 'attendance', label: 'Attendance', header: 'Attended' },
];

// Columns for the Competition Winners PDF/table. Class and Date are always
// included per row so a mixed list is still unambiguous at a glance.
const WINNER_COLUMNS = [
  { key: 'date', header: 'Date' },
  { key: 'competitionTitle', header: 'Competition' },
  { key: 'category', header: 'Category' },
  { key: 'studentName', header: 'Student' },
  { key: 'studentClass', header: 'Class' },
  { key: 'studentGender', header: 'Gender' },
  { key: 'position', header: 'Position' },
];

// Build a YYYY-MM-DD string from LOCAL date parts.
// Do NOT use date.toISOString().slice(0, 10) for calendar dates —
// toISOString() always converts to UTC first, which can shift the
// date backward or forward depending on the user's timezone offset
// (e.g. in IST, anytime before 5:30am local gets shifted to the
// previous day in UTC). That mismatch is what caused attendance
// saved on a Sunday to fall outside the "Sunday" range computed here,
// making the report say "No Sundays with saved attendance" even
// though attendance had been saved.
const toLocalISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayISO = () => toLocalISO(new Date());

const monthRange = (monthStr) => {
  // monthStr = 'YYYY-MM'
  const [y, m] = monthStr.split('-').map(Number);
  const from = new Date(y, m - 1, 1);
  const to = new Date(y, m, 0); // last day of month
  return { from: toLocalISO(from), to: toLocalISO(to) };
};

// Flatten winner records (one per competition, holding an array of student
// winners) into one row per student — that's the unit a PDF/table row
// actually represents. Falls back to the competition-level class when a
// student's own class wasn't recorded, and to 'Unspecified' if neither was.
const flattenWinnerRows = (winners) =>
  (winners || []).flatMap((w) =>
    (w.students || []).map((s) => ({
      date: w.date ? w.date.slice(0, 10) : '-',
      competitionTitle: w.competitionTitle || '-',
      category: w.category || '-',
      studentName: s.name || '-',
      studentClass: s.studentClass || w.class || UNSPECIFIED_CLASS,
      studentGender: s.gender || '-',
      position: s.position || '-',
    }))
  );

// Turns the 'all' | 'Boy' | 'Girl' filter into the bits every heading/filename needs.
const genderMeta = (genderFilter) => ({
  titleSuffix: genderFilter === 'all' ? '' : ` — ${GENDER_LABELS[genderFilter]}`,
  fileSuffix: genderFilter === 'all' ? '' : `-${GENDER_LABELS[genderFilter].toLowerCase()}`,
});

export default function SundayStudentsReport() {
  const [students, setStudents] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFields, setSelectedFields] = useState(['name', 'class', 'gender']);

  // Shared gender filter — applies to both the Students section and the
  // Competition Winners section, on screen and in the downloaded PDFs.
  const [genderFilter, setGenderFilter] = useState('all'); // 'all' | 'Boy' | 'Girl'

  // --- Attendance period selection ---
  const [periodMode, setPeriodMode] = useState('month'); // 'month' | 'range'
  const [month, setMonth] = useState(todayISO().slice(0, 7)); // 'YYYY-MM'
  const [rangeFrom, setRangeFrom] = useState(todayISO().slice(0, 8) + '01');
  const [rangeTo, setRangeTo] = useState(todayISO());

  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState(null); // { totalSundays, byStudentId }

  useEffect(() => {
    Promise.all([
      api.get('/sunday-school/students'),
      api.get('/sunday-school/settings'),
    ])
      .then(([studentsRes, settingsRes]) => {
        setStudents(studentsRes.data.data);
        setWinners(settingsRes.data.data?.winners || []);
      })
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  const activePeriod = useMemo(() => {
    if (periodMode === 'month') return monthRange(month);
    return { from: rangeFrom, to: rangeTo };
  }, [periodMode, month, rangeFrom, rangeTo]);

  const fetchAttendanceSummary = async () => {
    const { from, to } = activePeriod;
    if (!from || !to) {
      toast.error('Please choose a valid period');
      return;
    }
    if (new Date(from) > new Date(to)) {
      toast.error('"From" date must be before "To" date');
      return;
    }
    setAttendanceLoading(true);
    try {
      const { data } = await api.get('/sunday-school/attendance/summary', { params: { from, to } });
      const byStudentId = {};
      (data.data || []).forEach((row) => {
        byStudentId[row.studentId] = row.presentCount;
      });
      setAttendanceSummary({ totalSundays: data.totalSundays || 0, byStudentId });
      if (!selectedFields.includes('attendance')) {
        setSelectedFields((prev) => [...prev, 'attendance']);
      }
      if (!data.totalSundays) {
        toast('No Sundays with saved attendance in this period yet', { icon: 'ℹ️' });
      } else {
        toast.success(`Loaded attendance for ${data.totalSundays} Sunday${data.totalSundays === 1 ? '' : 's'}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load attendance summary');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const toggleField = (key) => {
    if (key === 'attendance' && !attendanceSummary) {
      toast.error('Load an attendance period first');
      return;
    }
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const getValue = (s, key) => {
    if (key === 'status') return s.isActive === false ? 'Inactive' : 'Active';
    if (key === 'gender') return s.gender || '-';
    if (key === 'attendance') {
      if (!attendanceSummary) return '-';
      const present = attendanceSummary.byStudentId[s._id] || 0;
      return `${present}/${attendanceSummary.totalSundays}`;
    }
    return s[key] || '-';
  };

  const activeFields = FIELD_OPTIONS.filter((f) => f.always || selectedFields.includes(f.key));

  const buildRows = (list) => list.map((s) => activeFields.map((f) => getValue(s, f.key)));

  const periodLabel = attendanceSummary
    ? `Attendance: ${activePeriod.from} → ${activePeriod.to} (${attendanceSummary.totalSundays} Sunday${attendanceSummary.totalSundays === 1 ? '' : 's'})`
    : null;

  const filterByGender = (list) => (genderFilter === 'all' ? list : list.filter((s) => s.gender === genderFilter));

  const downloadPdf = (list, title, filename) => {
    if (!list.length) {
      toast.error('No students to include');
      return;
    }
    const doc = new jsPDF({ orientation: activeFields.length > 3 ? 'landscape' : 'portrait' });
    doc.setFontSize(14);
    doc.text(title, 14, 15);
    doc.setFontSize(9);
    doc.text(
      `Generated ${new Date().toLocaleDateString()} · ${list.length} student${list.length === 1 ? '' : 's'}`,
      14,
      21
    );
    if (periodLabel && activeFields.some((f) => f.key === 'attendance')) {
      doc.text(periodLabel, 14, 26);
    }
    autoTable(doc, {
      startY: periodLabel && activeFields.some((f) => f.key === 'attendance') ? 31 : 26,
      head: [activeFields.map((f) => f.header)],
      body: buildRows(list),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [180, 130, 40] },
    });
    doc.save(filename);
  };
const downloadClassGenderPdf = (list, className) => {
  if (!list.length) {
    toast.error("No students to include");
    return;
  }

  const girls = list
    .filter((s) => s.gender === "Girl")
    .map((s) => s.name);

  const boys = list
    .filter((s) => s.gender === "Boy")
    .map((s) => s.name);

  const maxRows = Math.max(girls.length, boys.length);

  const body = [];

  for (let i = 0; i < maxRows; i++) {
    body.push([
      girls[i] || "",
      boys[i] || "",
    ]);
  }

  const doc = new jsPDF();
const pageWidth = doc.internal.pageSize.getWidth();

doc.setFont("helvetica", "bold");
doc.setFontSize(15);
doc.text("Sunday School", pageWidth / 2, 15, {
  align: "center",
});

doc.setFontSize(24);
doc.text(`${className}`, pageWidth / 2, 24, {
  align: "center",
});

doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.text(
  `Girls: ${girls.length}    Boys: ${boys.length}`,
  pageWidth / 2,
  32,
  {
    align: "center",
  }
);

  autoTable(doc, {
  startY: 35,

  head: [["Girls", "Boys"]],

  body,

  theme: "grid", // Draws borders around every cell

  tableWidth: 140, // Narrower table
  margin: {
    left: (210 - 140) / 2, // Center table on A4
    right: (210 - 140) / 2,
  },

  styles: {
    halign: "center",      // Center all text horizontally
    valign: "middle",      // Center vertically
    fontSize: 11,
    cellPadding: 4,
    lineWidth: 0.2,        // Border thickness
    lineColor: [120, 120, 120],
  },

  headStyles: {
    fillColor: [180, 130, 40],
    textColor: 255,
    fontStyle: "bold",
    halign: "center",
    valign: "middle",
  },

  columnStyles: {
    0: {
      halign: "center",
      cellWidth: 70,
    },
    1: {
      halign: "center",
      cellWidth: 70,
    },
  },
});

  doc.save(`sunday-school-${className.toLowerCase()}.pdf`);
};
  const downloadAll = () => {
    const { titleSuffix, fileSuffix } = genderMeta(genderFilter);
    downloadPdf(
      filterByGender(students),
      `Sunday School — All Students${titleSuffix}`,
      `sunday-school-students-all${fileSuffix}.pdf`
    );
  };

 const downloadClass = (cls) => {
  const list = students.filter(
    (s) => s.class === cls
  );

  downloadClassGenderPdf(list, cls);
};

  // ---------- Competition Winners ----------
  const winnerRows = useMemo(() => flattenWinnerRows(winners), [winners]);

  const filteredWinnerRows = useMemo(
    () => (genderFilter === 'all' ? winnerRows : winnerRows.filter((r) => r.studentGender === genderFilter)),
    [winnerRows, genderFilter]
  );

  const winnerGroups = useMemo(() => {
    const groups = {};
    filteredWinnerRows.forEach((row) => {
      const key = row.studentClass;
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    // Known classes first (in the fixed order), then anything else (e.g. Unspecified)
    const orderedKeys = [
      ...CLASSES.filter((c) => groups[c]),
      ...Object.keys(groups).filter((k) => !CLASSES.includes(k)),
    ];
    return orderedKeys.map((cls) => {
      const rows = groups[cls];
      // Within a class, cluster rows by competition (title + date + category)
      // so the class card reads as "Competition A: winners... Competition B:
      // winners..." instead of one flat, repetitive table.
      const competitions = [];
      const byKey = {};
      rows.forEach((row) => {
        const compKey = `${row.competitionTitle}__${row.category}__${row.date}`;
        if (!byKey[compKey]) {
          byKey[compKey] = {
            competitionTitle: row.competitionTitle,
            category: row.category,
            date: row.date,
            rows: [],
          };
          competitions.push(byKey[compKey]);
        }
        byKey[compKey].rows.push(row);
      });
      // Order competitions chronologically (oldest first) within the class
      competitions.sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));
      return { cls, rows, competitions };
    });
  }, [filteredWinnerRows]);

  // Renders the Competition Winners PDF directly from the already-grouped
  // class/competition data (the same `winnerGroups` shape used on screen),
  // instead of re-deriving grouping from scratch. This is what fixes the
  // mapping bug: the old version looped over the fixed CLASSES array only,
  // which silently dropped any group outside Beginners/Primary/Juniors/
  // Seniors (e.g. "Unspecified") from the PDF even though it showed on
  // screen. Keeping a single source of truth means the PDF always matches
  // what's rendered on the page.
  const downloadWinnersPdf = (groups, title, filename) => {
    const hasRows = groups.some((g) => g.competitions.length);
    if (!hasRows) {
      toast.error('No winners');
      return;
    }

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(16);
    doc.text(title, 14, 12);

    groups.forEach(({ cls, competitions }) => {
      if (!competitions.length) return;

      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(15);
      doc.text(cls, 14, y);
      y += 8;

      competitions.forEach((comp) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(11);
        doc.text(
          `${comp.competitionTitle}${comp.category !== '-' ? ` • ${comp.category}` : ''}${
            comp.date !== '-' ? ` • ${comp.date}` : ''
          }`,
          14,
          y
        );
        y += 4;

        const body = POSITIONS.map((position) => {
          const girl = comp.rows.find((r) => r.studentGender === 'Girl' && r.position === position);
          const boy = comp.rows.find((r) => r.studentGender === 'Boy' && r.position === position);
          const row = [position];
          if (genderFilter !== 'Boy') row.push(girl?.studentName || '—');
          if (genderFilter !== 'Girl') row.push(boy?.studentName || '—');
          return row;
        });

        const head = [['Position']];
        if (genderFilter !== 'Boy') head[0].push('Girls');
        if (genderFilter !== 'Girl') head[0].push('Boys');

        autoTable(doc, {
          startY: y,
          head,
          body,
          styles: { fontSize: 9, cellPadding: 2 },
          headStyles: { fillColor: [180, 130, 40] },
        });

        y = doc.lastAutoTable.finalY + 10;
      });
    });

    doc.save(filename);
  };

  const downloadAllWinners = () => {
    const { titleSuffix, fileSuffix } = genderMeta(genderFilter);
    downloadWinnersPdf(
      winnerGroups,
      `Sunday School — Competition Winners — All Classes${titleSuffix}`,
      `sunday-school-winners-all${fileSuffix}.pdf`
    );
  };

  const downloadClassWinners = (cls) => {
    const { titleSuffix, fileSuffix } = genderMeta(genderFilter);
    const group = winnerGroups.find((g) => g.cls === cls);
    downloadWinnersPdf(
      group ? [group] : [],
      `Sunday School — Competition Winners — ${cls}${titleSuffix}`,
      `sunday-school-winners-${cls.toLowerCase()}${fileSuffix}.pdf`
    );
  };

  if (loading) return <Loader />;
  if (!students.length) return <EmptyState title="No students yet" />;

  const genderedStudents = filterByGender(students);
  const grouped = CLASSES.map((cls) => ({
    cls,
    list: genderedStudents.filter((s) => s.class === cls),
  })).filter((g) => g.list.length);

  const showAttendanceColumn = activeFields.some((f) => f.key === 'attendance');
  const { titleSuffix: genderTitleSuffix } = genderMeta(genderFilter);

  return (
    <div>
      <PageHeader eyebrow="Sunday School" title="Students Report" subtitle="Full roster, by class or all together" />

      <div className="page-container space-y-8">
        {/* Gender filter — drives both sections below, on screen and in PDFs */}
        <div className="card p-5 print:hidden">
          <p className="label-field mb-2">Gender</p>
          <div className="flex flex-wrap items-center gap-3">
            {[
              { value: 'all', label: 'All' },
              { value: 'Boy', label: 'Boys' },
              { value: 'Girl', label: 'Girls' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={genderFilter === opt.value}
                  onChange={() => setGenderFilter(opt.value)}
                  className="accent-candle-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Attendance period picker */}
        <div className="card p-5 print:hidden">
          <p className="label-field mb-2 flex items-center gap-1.5">
            <PiCalendarBold /> Attendance Period (Sundays only)
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                checked={periodMode === 'month'}
                onChange={() => setPeriodMode('month')}
                className="accent-candle-500"
              />
              By Month
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                checked={periodMode === 'range'}
                onChange={() => setPeriodMode('range')}
                className="accent-candle-500"
              />
              Custom Range
            </label>
          </div>

          {periodMode === 'month' ? (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="label-field">Month</label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="input-field !w-auto"
                />
              </div>
              <button onClick={fetchAttendanceSummary} disabled={attendanceLoading} className="btn-gold">
                {attendanceLoading ? 'Loading...' : 'Load Attendance'}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="label-field">From</label>
                <input
                  type="date"
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  className="input-field !w-auto"
                />
              </div>
              <div>
                <label className="label-field">To</label>
                <input
                  type="date"
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                  className="input-field !w-auto"
                />
              </div>
              <button onClick={fetchAttendanceSummary} disabled={attendanceLoading} className="btn-gold">
                {attendanceLoading ? 'Loading...' : 'Load Attendance'}
              </button>
            </div>
          )}

          {periodLabel && <p className="text-xs text-ink-300 mt-3">{periodLabel}</p>}
        </div>

        <div className="card p-5 print:hidden">
          <p className="label-field mb-2">Fields to include in PDF</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {FIELD_OPTIONS.map((f) => (
              <label
                key={f.key}
                className={`flex items-center gap-1.5 text-sm ${
                  f.always ? 'text-ink-300' : 'text-ink cursor-pointer'
                } ${f.key === 'attendance' && !attendanceSummary ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={f.always || selectedFields.includes(f.key)}
                  disabled={f.always}
                  onChange={() => toggleField(f.key)}
                  className="accent-candle-500"
                />
                {f.label}
                {f.always && <span className="text-xs">(always included)</span>}
                {f.key === 'attendance' && !attendanceSummary && (
                  <span className="text-xs">(load a period first)</span>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <button onClick={downloadAll} className="btn-gold flex items-center gap-1.5">
            <PiDownloadBold /> Download All (PDF)
          </button>
          <button onClick={() => window.print()} className="btn-outline flex items-center gap-1.5">
            <PiPrinterBold /> Print
          </button>
        </div>

        {grouped.map(({ cls, list }) => (
          <div key={cls} className="card p-5">
            <div className="flex items-center justify-between mb-3 print:hidden">
              <h2 className="section-title !text-lg">
                {cls}
                {genderTitleSuffix} <span className="text-ink-300 font-normal text-sm">({list.length})</span>
              </h2>
              <button onClick={() => downloadClass(cls)} className="btn-outline-sm flex items-center gap-1">
                <PiDownloadBold size={14} /> Download {cls}
              </button>
            </div>
            <div className="hidden print:block font-display font-semibold text-lg mb-2">
              {cls}
              {genderTitleSuffix} ({list.length})
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-ink-100 text-ink-300">
                    <th className="py-2 pr-3">Name</th>
                    <th className="py-2 pr-3">Gender</th>
                    <th className="py-2 pr-3">Phone</th>
                    <th className="py-2 pr-3">Parent/Guardian</th>
                    <th className="py-2 pr-3">Address</th>
                    <th className="py-2 pr-3">Notes</th>
                    <th className="py-2 pr-3">Status</th>
                    {showAttendanceColumn && <th className="py-2 pr-3">Attended</th>}
                  </tr>
                </thead>
                <tbody>
                  {list.map((s) => (
                    <tr key={s._id} className="border-b border-ink-50">
                      <td className="py-2 pr-3 font-medium text-ink">{s.name}</td>
                      <td className="py-2 pr-3">{s.gender || '—'}</td>
                      <td className="py-2 pr-3">{s.phone || '—'}</td>
                      <td className="py-2 pr-3">{s.parentName || '—'}</td>
                      <td className="py-2 pr-3">{s.address || '—'}</td>
                      <td className="py-2 pr-3">{s.notes || '—'}</td>
                      <td className="py-2 pr-3">
                        {s.isActive === false ? (
                          <span className="text-red-500">Inactive</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                      </td>
                      {showAttendanceColumn && (
                        <td className="py-2 pr-3 font-medium text-candle-700">{getValue(s, 'attendance')}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Competition Winners */}
        {filteredWinnerRows.length > 0 && (
          <>
            <div className="flex items-center justify-between print:hidden">
              <h2 className="section-title !text-lg flex items-center gap-1.5">
                <PiTrophyBold /> Competition Winners{genderTitleSuffix}
              </h2>
              <button onClick={downloadAllWinners} className="btn-gold flex items-center gap-1.5">
                <PiDownloadBold /> Download All Winners (PDF)
              </button>
            </div>

            {winnerGroups.map(({ cls, rows, competitions }) => (
              <div key={cls} className="card p-5 space-y-5">
                <div className="flex items-center justify-between print:hidden">
                  <h3 className="section-title !text-lg">
                    {cls} <span className="text-ink-300 font-normal text-sm">({rows.length})</span>
                  </h3>
                  <button
                    onClick={() => downloadClassWinners(cls)}
                    className="btn-outline-sm flex items-center gap-1"
                  >
                    <PiDownloadBold size={14} /> Download {cls} Winners
                  </button>
                </div>
                <div className="hidden print:block font-display font-semibold text-lg">
                  {cls} — Competition Winners{genderTitleSuffix} ({rows.length})
                </div>

                {/* One sub-table per competition, so all winners for a given
                    competition sit together before moving to the next. */}
                {competitions.map((comp, ci) => (
                  <div key={ci}>
                    <p className="text-sm font-semibold text-ink mb-1">
                      {comp.competitionTitle}
                      {comp.category !== '-' && <span className="text-ink-300 font-normal"> · {comp.category}</span>}
                      {comp.date !== '-' && <span className="text-ink-300 font-normal"> · {comp.date}</span>}
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b border-ink-100 text-ink-300">
                            <th className="py-2 pr-3">Position</th>

                            {genderFilter !== "Boy" && (
                              <th className="py-2 pr-3">Girls</th>
                            )}

                            {genderFilter !== "Girl" && (
                              <th className="py-2 pr-3">Boys</th>
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {POSITIONS.map((position) => {
                            const girl = comp.rows.find(
                              (r) =>
                                r.studentGender === "Girl" &&
                                r.position === position
                            );

                            const boy = comp.rows.find(
                              (r) =>
                                r.studentGender === "Boy" &&
                                r.position === position
                            );

                            return (
                              <tr key={position} className="border-b border-ink-50">
                                <td className="py-2 pr-3 font-medium">
                                  {position}
                                </td>

                                {genderFilter !== "Boy" && (
                                  <td className="py-2 pr-3">
                                    {girl?.studentName || "—"}
                                  </td>
                                )}

                                {genderFilter !== "Girl" && (
                                  <td className="py-2 pr-3">
                                    {boy?.studentName || "—"}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}