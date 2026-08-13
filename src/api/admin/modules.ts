import express from 'express';
import type { PrismaClient, SiteDirectAccessPolicy, SiteModuleStatus } from '@prisma/client';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';

const STATUSES: SiteModuleStatus[] = ['DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'ARCHIVED'];
const ACCESS: SiteDirectAccessPolicy[] = ['AVAILABLE', 'CLOSING_PAGE', 'UNAVAILABLE'];

export async function isModulePublicOperationOpen(prisma: PrismaClient, moduleId: string): Promise<boolean> {
  try {
    const module = await prisma.siteModule.findUnique({ where: { id: moduleId }, select: { status: true, publicOperationsOpen: true } });
    return module?.status === 'ACTIVE' && module.publicOperationsOpen;
  } catch (error) {
    console.error(`Module operation check failed for ${moduleId}:`, error);
    return false;
  }
}

export function createAdminModulesRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(createAdminAuthMiddleware(prisma));

  router.get('/', async (_req, res) => {
    const modules = await prisma.siteModule.findMany({ include: { editions: { orderBy: [{ year: 'desc' }, { createdAt: 'desc' }] } }, orderBy: { name: 'asc' } });
    res.json(modules);
  });

  router.patch('/:id', async (req: AdminAuthenticatedRequest, res) => {
    const user = req.adminUser!;
    const moduleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!hasAdminPermission(user.role, 'modules:manage')) return res.status(403).json({ error: 'Sem permissão para gerenciar módulos' });
    const { status, visibleOnHome, visibleInNavigation, directAccess, publicOperationsOpen } = req.body ?? {};
    if (!STATUSES.includes(status) || !ACCESS.includes(directAccess)) return res.status(400).json({ error: 'Estado ou política de acesso inválidos' });

    const before = await prisma.siteModule.findUnique({ where: { id: moduleId } });
    if (!before) return res.status(404).json({ error: 'Módulo não encontrado' });
    if (before.permanent && ['ENDED', 'ARCHIVED'].includes(status)) {
      return res.status(409).json({ error: 'Módulos permanentes não podem ser encerrados ou arquivados' });
    }
    if (status !== 'ACTIVE' && Boolean(publicOperationsOpen)) {
      return res.status(409).json({ error: 'Operações públicas só podem permanecer abertas em módulos ativos' });
    }
    const updated = await prisma.siteModule.update({
      where: { id: moduleId },
      data: { status, visibleOnHome: Boolean(visibleOnHome), visibleInNavigation: Boolean(visibleInNavigation), directAccess, publicOperationsOpen: Boolean(publicOperationsOpen) },
    });
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'ATUALIZAR_MODULO', entidade: 'SiteModule', entidadeId: updated.id, dados: { before, after: updated } } });
    res.json(updated);
  });

  return router;
}

export function createPublicModulesRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.get('/', async (_req, res) => {
    try {
      const modules = await prisma.siteModule.findMany({ select: { id: true, name: true, path: true, status: true, visibleOnHome: true, visibleInNavigation: true, directAccess: true, publicOperationsOpen: true, updatedAt: true } });
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
      res.json({ modules });
    } catch {
      res.status(503).json({ modules: [], safeFallback: true });
    }
  });
  return router;
}
