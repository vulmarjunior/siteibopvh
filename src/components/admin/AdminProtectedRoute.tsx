import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';
import { clearAdminSession, getAdminAccessToken, saveAdminSession } from '../../lib/admin/session';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminCommandPalette from './AdminCommandPalette';

export default function AdminProtectedRoute() {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let active = true;
    async function validateSession() {
      const token = await getAdminAccessToken();
      try {
        const response = await fetch('/api/admin/auth/me', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!response.ok) {
          await clearAdminSession();
          if (active) setStatus('denied');
          return;
        }
        const user = await response.json();
        saveAdminSession(user);
        if (active) setStatus('allowed');
      } catch {
        if (active) setStatus('denied');
      }
    }
    validateSession();
    return () => { active = false; };
  }, []);

  function toggleSidebarCollapse() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  }

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'denied') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex">
      {/* Sidebar Navigation */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area with Header */}
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        <AdminHeader
          collapsed={sidebarCollapsed}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <AdminCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

