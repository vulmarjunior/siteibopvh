import express from 'express';
import type { PrismaClient } from '@prisma/client';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';

function csvCell(value: unknown): string {
  const raw = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function createAdminEbfRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(createAdminAuthMiddleware(prisma));
  router.use((req: AdminAuthenticatedRequest, res, next) => {
    if (!req.adminUser || !hasAdminPermission(req.adminUser.role, 'ebf:manage')) return res.status(403).json({ error: 'Sem permissão para consultar a EBF' });
    next();
  });

  router.get('/editions', async (_req, res) => {
    const editions = await prisma.siteEdition.findMany({
      where: { moduleId: 'ebf' },
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, slug: true, name: true, year: true, status: true, startsAt: true, endsAt: true, _count: { select: { ebfRegistrations: true } } },
    });
    res.json(editions.map(({ _count, ...edition }) => ({ ...edition, registrationCount: _count.ebfRegistrations })));
  });

  router.get('/editions/:editionId/registrations', async (req, res) => {
    const editionId = Array.isArray(req.params.editionId) ? req.params.editionId[0] : req.params.editionId;
    const edition = await prisma.siteEdition.findFirst({ where: { id: editionId, moduleId: 'ebf' }, select: { id: true } });
    if (!edition) return res.status(404).json({ error: 'Edição da EBF não encontrada' });
    const rows = await prisma.ebfRegistration.findMany({ where: { editionId, cancelledAt: null }, orderBy: { createdAt: 'desc' } });
    res.json(rows);
  });

  router.delete('/editions/:editionId/registrations/:id', async (req: AdminAuthenticatedRequest, res) => {
    const editionId = Array.isArray(req.params.editionId) ? req.params.editionId[0] : req.params.editionId;
    const idValue = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const id = Number.parseInt(idValue, 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Inscrição inválida' });
    const existing = await prisma.ebfRegistration.findFirst({ where: { id, editionId }, select: { id: true } });
    if (!existing) return res.status(404).json({ error: 'Inscrição não encontrada nesta edição' });
    await prisma.ebfRegistration.update({ where: { id }, data: { cancelledAt: new Date() } });
    const user = req.adminUser!;
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'CANCELAR_INSCRICAO_EBF', entidade: 'EbfRegistration', entidadeId: String(id), dados: { editionId } } });
    res.json({ success: true });
  });

  router.get('/editions/:editionId/export.csv', async (req, res) => {
    const editionId = Array.isArray(req.params.editionId) ? req.params.editionId[0] : req.params.editionId;
    const edition = await prisma.siteEdition.findFirst({ where: { id: editionId, moduleId: 'ebf' }, select: { slug: true } });
    if (!edition) return res.status(404).json({ error: 'Edição da EBF não encontrada' });
    const rows = await prisma.ebfRegistration.findMany({ where: { editionId, cancelledAt: null }, orderBy: { createdAt: 'asc' } });
    const content = rows.map((item) => [item.id, item.childName, item.age, item.colorGroup, item.guardianName, item.phone, item.visitor ? 'Sim' : 'Não', item.createdAt.toISOString()].map(csvCell).join(','));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="inscricoes-ebf-${edition.slug}.csv"`);
    res.send(`\uFEFFID,Crianca,Idade,Grupo,Responsavel,Telefone,Visitante,Data\n${content.join('\n')}`);
  });

  return router;
}
