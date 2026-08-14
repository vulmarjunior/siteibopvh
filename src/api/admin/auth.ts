import express, { NextFunction, Request, Response } from 'express';
import type { CuradoriaUsuario, PrismaClient } from '@prisma/client';
import { getSupabaseServer } from '../../lib/veredas/supabaseServer.js';
import { mapLegacyCuradoriaRole, type AdminRole } from '../../lib/admin/permissions.js';
import { consumeRateLimit } from '../../lib/server/rateLimit.js';
import { clearAdminSessionCookie, getAdminAuthToken, getAdminRefreshToken, isUnsafeCrossOriginRequest, setAdminRefreshCookie, setAdminSessionCookie } from '../../lib/admin/authCookie.js';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
}

export interface AdminAuthenticatedRequest extends Request {
  adminUser?: AdminUser;
}

function toAdminUser(user: CuradoriaUsuario): AdminUser {
  return { id: user.id, email: user.email, name: user.nome, role: mapLegacyCuradoriaRole(user.papel) };
}

export function createAdminAuthMiddleware(prisma: PrismaClient) {
  return async (req: AdminAuthenticatedRequest, res: Response, next: NextFunction) => {
    let auth = getAdminAuthToken(req);
    if (isUnsafeCrossOriginRequest(req, auth?.source || 'cookie')) return res.status(403).json({ error: 'Origem da requisição não autorizada' });

    try {
      const supabase = getSupabaseServer();
      if (!auth) {
        const refreshToken = getAdminRefreshToken(req);
        if (refreshToken) {
          const refreshed = await supabase.auth.refreshSession({ refresh_token: refreshToken });
          if (!refreshed.error && refreshed.data.session) {
            setAdminSessionCookie(res, refreshed.data.session.access_token, refreshed.data.session.expires_at);
            setAdminRefreshCookie(res, refreshed.data.session.refresh_token);
            auth = { token: refreshed.data.session.access_token, source: 'cookie' };
          }
        }
      }
      if (!auth) return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
      const { data: { user }, error } = await supabase.auth.getUser(auth.token);
      if (error || !user) {
        if (auth.source === 'cookie') clearAdminSessionCookie(res);
        return res.status(401).json({ error: 'Sessão inválida ou expirada' });
      }

      const legacyUser = await prisma.curadoriaUsuario.findUnique({ where: { id: user.id } });
      if (!legacyUser || !legacyUser.ativo) return res.status(403).json({ error: 'Usuário sem acesso à Central Administrativa' });

      req.adminUser = toAdminUser(legacyUser);
      if (auth.source === 'bearer') setAdminSessionCookie(res, auth.token);
      next();
    } catch (error) {
      console.error('Admin authentication error:', error);
      return res.status(500).json({ error: 'Falha ao validar autenticação' });
    }
  };
}

export function createAdminAuthRouter(prisma: PrismaClient) {
  const router = express.Router();
  const authenticate = createAdminAuthMiddleware(prisma);

  router.post('/login', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    const rateLimit = await consumeRateLimit(prisma, req, { scope: 'admin-login', limit: 8, windowMs: 15 * 60 * 1000, discriminator: email.toLowerCase() });
    if (!rateLimit.allowed) { res.setHeader('Retry-After', rateLimit.retryAfterSeconds); return res.status(429).json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' }); }

    try {
      const { data, error } = await getSupabaseServer().auth.signInWithPassword({ email, password });
      if (error || !data.session) return res.status(401).json({ error: 'E-mail ou senha incorretos' });

      const legacyUser = await prisma.curadoriaUsuario.findUnique({ where: { id: data.session.user.id } });
      if (!legacyUser || !legacyUser.ativo) return res.status(403).json({ error: 'Usuário sem acesso à Central Administrativa' });

      const user = toAdminUser(legacyUser);
      await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'LOGIN', entidade: 'AdminSession', entidadeId: user.id } }).catch((auditError) => console.error('Admin login audit error:', auditError));
      setAdminSessionCookie(res, data.session.access_token, data.session.expires_at);
      setAdminRefreshCookie(res, data.session.refresh_token);
      return res.json({ user });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ error: 'Erro no servidor de autenticação' });
    }
  });

  router.get('/me', authenticate, (req: AdminAuthenticatedRequest, res) => res.json(req.adminUser));
  router.post('/logout', authenticate, async (req: AdminAuthenticatedRequest, res) => {
    const user = req.adminUser!;
    const auth = getAdminAuthToken(req);
    if (auth) await getSupabaseServer().auth.admin.signOut(auth.token, 'local').catch((logoutError) => console.error('Supabase logout error:', logoutError));
    clearAdminSessionCookie(res);
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'LOGOUT', entidade: 'AdminSession', entidadeId: user.id } }).catch((auditError) => console.error('Admin logout audit error:', auditError));
    return res.json({ success: true });
  });

  return router;
}

