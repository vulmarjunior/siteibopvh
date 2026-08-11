import { supabaseClient } from '../veredas/supabaseClient';

export const ADMIN_TOKEN_KEY = 'ibo_admin_access_token';
export const ADMIN_USER_KEY = 'ibo_admin_user';

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string | null;
  role: import('./permissions').AdminRole;
}

export async function getAdminAccessToken(): Promise<string | null> {
  const stored = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (stored) return stored;
  return (await supabaseClient.auth.getSession()).data.session?.access_token ?? null;
}

export function saveAdminSession(token: string, user: AdminSessionUser): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export async function clearAdminSession(): Promise<void> {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  await supabaseClient.auth.signOut().catch(() => undefined);
}
