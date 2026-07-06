import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { AnnouncementBanner } from './Header/AnnouncementBanner';
import { Header } from './Header/Header';

export function Layout() {
  return (
    <div className="min-h-screen relative flex flex-col bg-slate-900 text-slate-100 font-sans">
      
      {/* Premium Header System */}
      <AnnouncementBanner />
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
