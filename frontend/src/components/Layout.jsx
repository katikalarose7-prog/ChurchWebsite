import { Outlet } from 'react-router-dom';
import TopNav from './TopNav.jsx';
import BottomNav from './BottomNav.jsx';
import Footer from './Footer.jsx';
import InstallPrompt from './InstallPrompt.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-parchment">
      <TopNav />
      <main className="flex-1 pb-28 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
