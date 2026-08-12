import express, { NextFunction, Request, Response } from 'express';
import type { CuradoriaUsuario, PrismaClient } from '@prisma/client';
import { getSupabaseServer } from '../../lib/veredas/supabaseServer.js';
import { mapLegacyCuradoriaRole, type AdminRole } from '../../lib/admin/permissions.js';

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
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    try {
      const token = authorization.slice(7).trim();
      const { data: { user }, error } = await getSupabaseServer().auth.getUser(token);
      if (error || !user) return res.status(401).json({ error: 'Sessão inválida ou expirada' });

      const legacyUser = await prisma.curadoriaUsuario.findUnique({ where: { id: user.id } });
      if (!legacyUser || !legacyUser.ativo) return res.status(403).json({ error: 'Usuário sem acesso à Central Administrativa' });

      req.adminUser = toAdminUser(legacyUser);
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

    try {
      const { data, error } = await getSupabaseServer().auth.signInWithPassword({ email, password });
      if (error || !data.session) return res.status(401).json({ error: 'E-mail ou senha incorretos' });

      const legacyUser = await prisma.curadoriaUsuario.findUnique({ where: { id: data.session.user.id } });
      if (!legacyUser || !legacyUser.ativo) return res.status(403).json({ error: 'Usuário sem acesso à Central Administrativa' });

      const user = toAdminUser(legacyUser);
      await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'LOGIN', entidade: 'AdminSession', entidadeId: user.id } }).catch((auditError) => console.error('Admin login audit error:', auditError));
      return res.json({ access_token: data.session.access_token, user });
    } catch (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ error: 'Erro no servidor de autenticação' });
    }
  });

  router.get('/me', authenticate, (req: AdminAuthenticatedRequest, res) => res.json(req.adminUser));
  router.post('/logout', authenticate, async (req: AdminAuthenticatedRequest, res) => {
    const user = req.adminUser!;
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'LOGOUT', entidade: 'AdminSession', entidadeId: user.id } }).catch((auditError) => console.error('Admin logout audit error:', auditError));
    return res.json({ success: true });
  });

  return router;
}

