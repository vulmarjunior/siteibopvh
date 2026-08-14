import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import { ADMIN_REFRESH_COOKIE, ADMIN_SESSION_COOKIE, getAdminAuthToken, getAdminRefreshToken, isUnsafeCrossOriginRequest, parseCookieHeader } from '../authCookie';

function request(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    protocol: 'https',
    headers: {},
    get: (name: string) => name.toLowerCase() === 'host' ? 'admin.example.org' : undefined,
    ...overrides,
  } as Request;
}

describe('admin auth cookie', () => {
  it('parses encoded cookie values and ignores invalid entries', () => {
    expect(parseCookieHeader('foo=bar; token=a%2Eb; invalid')).toEqual({ foo: 'bar', token: 'a.b' });
  });

  it('prefers a valid bearer token during the migration period', () => {
    const req = request({ headers: { authorization: 'Bearer legacy.jwt', cookie: `${ADMIN_SESSION_COOKIE}=cookie.jwt` } });
    expect(getAdminAuthToken(req)).toEqual({ token: 'legacy.jwt', source: 'bearer' });
  });

  it('ignores Bearer null and falls back to the HttpOnly cookie', () => {
    const req = request({ headers: { authorization: 'Bearer null', cookie: `${ADMIN_SESSION_COOKIE}=cookie.jwt` } });
    expect(getAdminAuthToken(req)).toEqual({ token: 'cookie.jwt', source: 'cookie' });
  });

  it('reads a refresh token after the access cookie expires', () => {
    const req = request({ headers: { cookie: `${ADMIN_REFRESH_COOKIE}=refresh.token` } });
    expect(getAdminAuthToken(req)).toBeNull();
    expect(getAdminRefreshToken(req)).toBe('refresh.token');
  });

  it('blocks cross-site cookie mutations but permits same-origin requests', () => {
    const crossSite = request({ method: 'POST', headers: { origin: 'https://evil.example', host: 'admin.example.org' } });
    const sameOrigin = request({ method: 'POST', headers: { origin: 'https://admin.example.org', host: 'admin.example.org' } });
    expect(isUnsafeCrossOriginRequest(crossSite, 'cookie')).toBe(true);
    expect(isUnsafeCrossOriginRequest(sameOrigin, 'cookie')).toBe(false);
    expect(isUnsafeCrossOriginRequest(crossSite, 'bearer')).toBe(false);
  });
});
