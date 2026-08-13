import type { Request, Response } from 'express';

export const ADMIN_SESSION_COOKIE = 'ibo_admin_session';
export type AdminAuthSource = 'bearer' | 'cookie';

export interface AdminAuthToken { token: string; source: AdminAuthSource }

export function parseCookieHeader(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(header.split(';').flatMap((part) => {
    const separator = part.indexOf('=');
    if (separator < 1) return [];
    try { return [[part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())]]; }
    catch { return []; }
  }));
}

export function getAdminAuthToken(req: Request): AdminAuthToken | null {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith('Bearer ')) {
    const token = authorization.slice(7).trim();
    if (token && token !== 'null' && token !== 'undefined') return { token, source: 'bearer' };
  }
  const token = parseCookieHeader(req.headers.cookie)[ADMIN_SESSION_COOKIE];
  return token ? { token, source: 'cookie' } : null;
}

export function setAdminSessionCookie(res: Response, token: string, expiresAt?: number): void {
  const remainingSeconds = expiresAt ? expiresAt - Math.floor(Date.now() / 1000) : 3600;
  const maxAge = Math.max(0, Math.min(remainingSeconds, 86400));
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.append('Set-Cookie', `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`);
}

export function clearAdminSessionCookie(res: Response): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.append('Set-Cookie', `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`);
}

export function isUnsafeCrossOriginRequest(req: Request, source: AdminAuthSource): boolean {
  if (source !== 'cookie' || ['GET', 'HEAD', 'OPTIONS'].includes(req.method.toUpperCase())) return false;
  if (req.headers['sec-fetch-site'] === 'cross-site') return true;
  const origin = req.headers.origin;
  if (!origin) return false;
  const protocol = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim() || req.protocol;
  const host = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim() || req.get('host');
  if (!host) return true;
  try { return new URL(origin).origin !== `${protocol}://${host}`; }
  catch { return true; }
}
