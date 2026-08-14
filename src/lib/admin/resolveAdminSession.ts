import type { Request, Response } from 'express';
import type { User } from '@supabase/supabase-js';
import { getSupabaseServer } from '../veredas/supabaseServer.js';
import {
  clearAdminSessionCookie,
  getAdminAuthToken,
  getAdminRefreshToken,
  setAdminRefreshCookie,
  setAdminSessionCookie,
  type AdminAuthToken,
} from './authCookie.js';

export type AdminSessionResolution =
  | { user: User; auth: AdminAuthToken }
  | { user: null; error: string };

export async function resolveAdminSession(req: Request, res: Response): Promise<AdminSessionResolution> {
  const supabase = getSupabaseServer();
  const refreshToken = getAdminRefreshToken(req);
  let auth = getAdminAuthToken(req);

  const refresh = async (): Promise<AdminAuthToken | null> => {
    if (!refreshToken) return null;
    const refreshed = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (refreshed.error || !refreshed.data.session) return null;

    setAdminSessionCookie(res, refreshed.data.session.access_token, refreshed.data.session.expires_at);
    setAdminRefreshCookie(res, refreshed.data.session.refresh_token);
    return { token: refreshed.data.session.access_token, source: 'cookie' };
  };

  if (!auth) auth = await refresh();

  if (auth) {
    let validated = await supabase.auth.getUser(auth.token);

    // The browser can still send an access cookie at the expiry boundary. Refresh
    // and continue the original request instead of forcing the user to sign in again.
    if ((validated.error || !validated.data.user) && refreshToken) {
      const refreshedAuth = await refresh();
      if (refreshedAuth) {
        auth = refreshedAuth;
        validated = await supabase.auth.getUser(auth.token);
      }
    }

    if (!validated.error && validated.data.user) {
      if (auth.source === 'bearer') setAdminSessionCookie(res, auth.token);
      return { user: validated.data.user, auth };
    }
  }

  clearAdminSessionCookie(res);
  return { user: null, error: 'Sessão inválida ou expirada. Entre novamente.' };
}
