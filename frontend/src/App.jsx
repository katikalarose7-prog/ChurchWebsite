import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import PrayerRequests from './pages/PrayerRequests.jsx';
import PrayerSchedule from './pages/PrayerSchedule.jsx';
import WeeklyWord from './pages/WeeklyWord.jsx';
import Sermons from './pages/Sermons.jsx';
import Events from './pages/Events.jsx';
import Gallery from './pages/Gallery.jsx';
import Contact from './pages/Contact.jsx';
import Give from './pages/Give.jsx';
import SundaySchool from './pages/SundaySchool.jsx';
import FreshFire from './pages/FreshFire.jsx';
import More from './pages/More.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManagePrayerRequests from './pages/admin/ManagePrayerRequests.jsx';
import ManageSongs from './pages/admin/ManageSongs.jsx';
import ManageSchedule from './pages/admin/ManageSchedule.jsx';
import ManageWord from './pages/admin/ManageWord.jsx';
import ManageSermons from './pages/admin/ManageSermons.jsx';
import ManageEvents from './pages/admin/ManageEvents.jsx';
import ManageGallery from './pages/admin/ManageGallery.jsx';
import ManageAdmins from './pages/admin/ManageAdmins.jsx';
import ManageHomepage from './pages/admin/ManageHomepage.jsx';
import ManageAbout from './pages/admin/ManageAbout.jsx';
import ManageContactMessages from './pages/admin/ManageContactMessages.jsx';
import ManageGivingSettings from './pages/admin/ManageGivingSettings.jsx';
import ManageOfferings from './pages/admin/ManageOfferings.jsx';
import ManageSundayStudents from './pages/admin/ManageSundayStudents.jsx';
import ManageSundayAttendance from './pages/admin/ManageSundayAttendance.jsx';
import ManageSundayPrayerRequests from './pages/admin/ManageSundayPrayerRequests.jsx';
import ManageSundayFinance from './pages/admin/ManageSundayFinance.jsx';
import ManageSundaySchoolSettings from './pages/admin/ManageSundaySchoolSettings.jsx';
import ManageSundaySchoolOverview from './pages/admin/ManageSundaySchoolOverview.jsx';
import SundayStudentsReport from './pages/admin/SundayStudentReport.jsx';

import ManageFreshFire from './pages/admin/ManageFreshFire.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/prayer-requests" element={<PrayerRequests />} />
        <Route path="/prayer-schedule" element={<PrayerSchedule />} />
        <Route path="/weekly-word" element={<WeeklyWord />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/give" element={<Give />} />
        <Route path="/sunday-school" element={<SundaySchool />} />
        <Route path="/fresh-fire" element={<FreshFire />} />
        <Route path="/more" element={<More />} />
      </Route>

      {/* Admin auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Admin panel (protected) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Super Admin only */}
        <Route
          path="prayer-requests"
          element={
            <ProtectedRoute roles={['super_admin']}>
              <ManagePrayerRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="contact-messages"
          element={
            <ProtectedRoute roles={['super_admin']}>
              <ManageContactMessages />
            </ProtectedRoute>
          }
        />
        <Route
          path="admins"
          element={
            <ProtectedRoute roles={['super_admin']} requireOwner>
              <ManageAdmins />
            </ProtectedRoute>
          }
        />
        <Route
          path="offerings"
          element={
            <ProtectedRoute roles={['super_admin']} requireOwner>
              <ManageOfferings />
            </ProtectedRoute>
          }
        />
        <Route
          path="giving-settings"
          element={
            <ProtectedRoute roles={['super_admin']} requireOwner>
              <ManageGivingSettings />
            </ProtectedRoute>
          }
        />

        {/* Sunday School — isolated to its own role + Super Admin */}
        <Route
          path="sunday-school/students"
          element={
            <ProtectedRoute ownerOrRoles={['sunday_school_admin']}>
              <ManageSundayStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="sunday-school/attendance"
          element={
            <ProtectedRoute ownerOrRoles={['sunday_school_admin']}>
              <ManageSundayAttendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="sunday-school/prayer-requests"
          element={
            <ProtectedRoute ownerOrRoles={['sunday_school_admin']}>
              <ManageSundayPrayerRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="sunday-school/finance"
          element={
            <ProtectedRoute ownerOrRoles={['sunday_school_admin']}>
              <ManageSundayFinance />
            </ProtectedRoute>
          }
        />
        <Route
          path="sunday-school/settings"
          element={
            <ProtectedRoute ownerOrRoles={['sunday_school_admin']}>
              <ManageSundaySchoolSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="sunday-school/overview"
          element={
            <ProtectedRoute roles={['super_admin', 'sunday_school_admin']}>
              <ManageSundaySchoolOverview />
            </ProtectedRoute>
          }
        />

        <Route
          path="sunday-school/report"
          element={
            <ProtectedRoute roles={['super_admin', 'sunday_school_admin']}>
              <SundayStudentsReport />
            </ProtectedRoute>
          }
        />
        {/* Super Admin + Content Admin */}
        <Route
          path="songs"
          element={
            <ProtectedRoute roles={['super_admin', 'content_admin']}>
              <ManageSongs />
            </ProtectedRoute>
          }
        />
        <Route
          path="prayer-schedule"
          element={
            <ProtectedRoute roles={['super_admin', 'content_admin']}>
              <ManageSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="weekly-word"
          element={
            <ProtectedRoute roles={['super_admin', 'content_admin']}>
              <ManageWord />
            </ProtectedRoute>
          }
        />
        <Route
          path="sermons"
          element={
            <ProtectedRoute roles={['super_admin', 'content_admin']}>
              <ManageSermons />
            </ProtectedRoute>
          }
        />
        <Route
          path="fresh-fire"
          element={
            <ProtectedRoute roles={['super_admin', 'content_admin']}>
              <ManageFreshFire />
            </ProtectedRoute>
          }
        />
        <Route
          path="events"
          element={
            <ProtectedRoute roles={['super_admin', 'content_admin']}>
              <ManageEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="gallery"
          element={
            <ProtectedRoute roles={['super_admin', 'content_admin']}>
              <ManageGallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="homepage"
          element={
            <ProtectedRoute roles={['super_admin', 'content_admin']}>
              <ManageHomepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="about"
          element={
            <ProtectedRoute roles={['super_admin', 'content_admin']}>
              <ManageAbout />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
