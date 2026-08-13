import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';
import { clearAdminSession, getAdminAccessToken, saveAdminSession } from '../../lib/admin/session';
import AdminGlobalNavigation from './AdminGlobalNavigation';

export default function AdminProtectedRoute() {
  const [status, setStatus] = useState<'loading' | 'allowed' | 'denied'>('loading');
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

  if (status === 'loading') return <LoadingSpinner />;
  if (status === 'denied') return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <>
    <AdminGlobalNavigation />
    <Outlet />
  </>;
}
