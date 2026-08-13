import express from 'express';
import type { PrismaClient } from '@prisma/client';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { hasAdminPermission, mapLegacyCuradoriaRole, toPersistedAdminRole, type AdminRole } from '../../lib/admin/permissions.js';
import { getSupabaseServer } from '../../lib/veredas/supabaseServer.js';

const ADMIN_ROLES: AdminRole[] = ['ADMIN_GERAL', 'EDITOR', 'CURADOR_VEREDAS', 'OPERADOR'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createAdminUsersRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(createAdminAuthMiddleware(prisma));
  router.use((req: AdminAuthenticatedRequest, res, next) => {
    if (!req.adminUser || !hasAdminPermission(req.adminUser.role, 'users:manage')) return res.status(403).json({ error: 'Somente o administrador geral pode gerenciar usuários.' });
    next();
  });

  router.get('/', async (_req, res) => {
    const users = await prisma.curadoriaUsuario.findMany({ orderBy: [{ ativo: 'desc' }, { email: 'asc' }] });
    res.json(users.map((user) => ({ id: user.id, email: user.email, name: user.nome, role: mapLegacyCuradoriaRole(user.papel), active: user.ativo, lastAccessAt: user.ultimoAcessoEm, createdAt: user.criadoEm })));
  });

  router.post('/invite', async (req: AdminAuthenticatedRequest, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const name = String(req.body?.name || '').trim() || null;
    const role = req.body?.role as AdminRole;
    if (!emailPattern.test(email) || !ADMIN_ROLES.includes(role)) return res.status(400).json({ error: 'Informe e-mail e papel válidos.' });
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(503).json({ error: 'Convites exigem SUPABASE_SERVICE_ROLE_KEY no servidor.' });

    const existing = await prisma.curadoriaUsuario.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Este e-mail já possui um perfil administrativo.' });

    const redirectTo = `${process.env.APP_URL || 'https://www.ibopvh.com.br'}/admin/definir-senha`;
    const { data, error } = await getSupabaseServer().auth.admin.inviteUserByEmail(email, { redirectTo, data: name ? { name } : undefined });
    if (error || !data.user) return res.status(502).json({ error: error?.message || 'Não foi possível enviar o convite.' });

    try {
      const user = await prisma.$transaction(async (tx) => {
        const created = await tx.curadoriaUsuario.create({ data: { id: data.user.id, email, nome: name, papel: toPersistedAdminRole(role), ativo: true } });
        await tx.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'CONVIDAR_USUARIO', entidade: 'CuradoriaUsuario', entidadeId: created.id, dados: { email, role } } });
        return created;
      });
      res.status(201).json({ id: user.id, email: user.email, name: user.nome, role, active: user.ativo });
    } catch (databaseError) {
      await getSupabaseServer().auth.admin.deleteUser(data.user.id).catch(() => undefined);
      throw databaseError;
    }
  });

  router.patch('/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = String(req.params.id);
    const role = req.body?.role as AdminRole;
    const active = req.body?.active;
    if (!ADMIN_ROLES.includes(role) || typeof active !== 'boolean') return res.status(400).json({ error: 'Papel ou situação inválidos.' });
    const before = await prisma.curadoriaUsuario.findUnique({ where: { id } });
    if (!before) return res.status(404).json({ error: 'Usuário não encontrado.' });
    if (id === req.adminUser!.id && (!active || role !== 'ADMIN_GERAL')) return res.status(409).json({ error: 'Você não pode suspender ou remover seu próprio acesso de administrador.' });
    if (before.papel === 'ADMIN' && (!active || role !== 'ADMIN_GERAL')) {
      const activeAdmins = await prisma.curadoriaUsuario.count({ where: { papel: 'ADMIN', ativo: true } });
      if (activeAdmins <= 1) return res.status(409).json({ error: 'A Central precisa manter pelo menos um administrador geral ativo.' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.curadoriaUsuario.update({ where: { id }, data: { papel: toPersistedAdminRole(role), ativo: active } });
      await tx.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'ATUALIZAR_USUARIO', entidade: 'CuradoriaUsuario', entidadeId: id, dados: { roleBefore: mapLegacyCuradoriaRole(before.papel), roleAfter: role, activeBefore: before.ativo, activeAfter: active } } });
      return user;
    });
    res.json({ id: updated.id, email: updated.email, name: updated.nome, role, active: updated.ativo });
  });

  return router;
}
