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
  return null;
}

export function saveAdminSession(user: AdminSessionUser): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function getStoredAdminUser(): AdminSessionUser | null {
  try {
    const stored = localStorage.getItem(ADMIN_USER_KEY);
    return stored ? JSON.parse(stored) as AdminSessionUser : null;
  } catch {
    return null;
  }
}

export async function clearAdminSession(): Promise<void> {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  await supabaseClient.auth.signOut().catch(() => undefined);
}
