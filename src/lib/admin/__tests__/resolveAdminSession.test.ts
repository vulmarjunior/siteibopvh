import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_REFRESH_COOKIE, ADMIN_SESSION_COOKIE } from '../authCookie';
import { resolveAdminSession } from '../resolveAdminSession';

const authMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  refreshSession: vi.fn(),
}));

vi.mock('../../veredas/supabaseServer.js', () => ({
  getSupabaseServer: () => ({ auth: authMocks }),
}));

function request(cookie: string): Request {
  return { method: 'POST', headers: { cookie } } as Request;
}

function response(): Response {
  return { append: vi.fn() } as unknown as Response;
}

describe('resolveAdminSession', () => {
  beforeEach(() => vi.clearAllMocks());

  it('refreshes an expired access token and continues the original request', async () => {
    authMocks.getUser
      .mockResolvedValueOnce({ data: { user: null }, error: new Error('expired') })
      .mockResolvedValueOnce({ data: { user: { id: 'user-1' } }, error: null });
    authMocks.refreshSession.mockResolvedValue({
      data: { session: { access_token: 'new-access', refresh_token: 'new-refresh', expires_at: 2_000_000_000 } },
      error: null,
    });
    const res = response();

    const result = await resolveAdminSession(
      request(`${ADMIN_SESSION_COOKIE}=old-access; ${ADMIN_REFRESH_COOKIE}=valid-refresh`),
      res,
    );

    expect(result).toMatchObject({ user: { id: 'user-1' }, auth: { token: 'new-access', source: 'cookie' } });
    expect(authMocks.refreshSession).toHaveBeenCalledWith({ refresh_token: 'valid-refresh' });
    expect(authMocks.getUser).toHaveBeenNthCalledWith(2, 'new-access');
    expect(res.append).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining(`${ADMIN_REFRESH_COOKIE}=new-refresh`));
  });

  it('clears the session only after refresh also fails', async () => {
    authMocks.getUser.mockResolvedValue({ data: { user: null }, error: new Error('expired') });
    authMocks.refreshSession.mockResolvedValue({ data: { session: null }, error: new Error('invalid refresh') });
    const res = response();

    const result = await resolveAdminSession(
      request(`${ADMIN_SESSION_COOKIE}=old-access; ${ADMIN_REFRESH_COOKIE}=invalid-refresh`),
      res,
    );

    expect(result).toEqual({ user: null, error: 'Sessão inválida ou expirada. Entre novamente.' });
    expect(res.append).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining(`${ADMIN_SESSION_COOKIE}=;`));
    expect(res.append).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining(`${ADMIN_REFRESH_COOKIE}=;`));
  });
});
