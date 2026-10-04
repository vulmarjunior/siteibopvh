import express from 'express';
import type { PrismaClient } from '@prisma/client';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { ensureChildrensDaySchema } from '../childrens-schema.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';

const MODULE_ID = 'criancas';

function csvCell(value: unknown): string {
  const raw = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function toParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] : (value ?? '');
}

export function createAdminChildrensRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(async (_req, _res, next) => {
    await ensureChildrensDaySchema(prisma);
    next();
  });
  router.use(createAdminAuthMiddleware(prisma));
  router.use((req: AdminAuthenticatedRequest, res, next) => {
    if (!req.adminUser || !hasAdminPermission(req.adminUser.role, 'criancas:manage')) return res.status(403).json({ error: 'Sem permissão para consultar as inscrições do Dia das Crianças' });
    next();
  });

  router.get('/editions', async (_req, res) => {
    const editions = await prisma.siteEdition.findMany({
      where: { moduleId: MODULE_ID },
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, slug: true, name: true, year: true, status: true, startsAt: true, endsAt: true, _count: { select: { childrensDayRegistrations: true } } },
    });
    res.json(editions.map(({ _count, ...edition }) => ({ ...edition, registrationCount: _count.childrensDayRegistrations })));
  });

  router.get('/editions/:editionId/registrations', async (req, res) => {
    const editionId = toParam(req.params.editionId);
    const edition = await prisma.siteEdition.findFirst({ where: { id: editionId, moduleId: MODULE_ID }, select: { id: true } });
    if (!edition) return res.status(404).json({ error: 'Edição do Dia das Crianças não encontrada' });
    const rows = await prisma.childrensDayRegistration.findMany({
      where: { editionId, cancelledAt: null },
      orderBy: { createdAt: 'desc' },
      include: { members: { orderBy: [{ kind: 'asc' }, { name: 'asc' }] } },
    });
    res.json(rows);
  });

  router.delete('/editions/:editionId/registrations/:id', async (req: AdminAuthenticatedRequest, res) => {
    const editionId = toParam(req.params.editionId);
    const id = Number.parseInt(toParam(req.params.id), 10);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Inscrição inválida' });
    const existing = await prisma.childrensDayRegistration.findFirst({ where: { id, editionId }, select: { id: true } });
    if (!existing) return res.status(404).json({ error: 'Inscrição não encontrada nesta edição' });
    await prisma.childrensDayRegistration.update({ where: { id }, data: { cancelledAt: new Date() } });
    const user = req.adminUser!;
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'CANCELAR_INSCRICAO_DIA_DAS_CRIANCAS', entidade: 'ChildrensDayRegistration', entidadeId: String(id), dados: { editionId } } });
    res.json({ success: true });
  });

  router.get('/editions/:editionId/export.csv', async (req, res) => {
    const editionId = toParam(req.params.editionId);
    const edition = await prisma.siteEdition.findFirst({ where: { id: editionId, moduleId: MODULE_ID }, select: { slug: true } });
    if (!edition) return res.status(404).json({ error: 'Edição do Dia das Crianças não encontrada' });
    const rows = await prisma.childrensDayRegistration.findMany({
      where: { editionId, cancelledAt: null },
      orderBy: { createdAt: 'asc' },
      include: { members: { orderBy: [{ kind: 'asc' }, { name: 'asc' }] } },
    });
    const content = rows.flatMap((registration) => {
      const common = [registration.id, registration.guardianName, registration.phone, registration.email ?? ''];
      const logistics = [
        registration.bringsBreakfast ? 'Sim' : 'Não',
        registration.breakfastItems ?? '',
        registration.bringsSideDish ? 'Sim' : 'Não',
        registration.sideDishItems ?? '',
        registration.bringsDrink ? 'Sim' : 'Não',
        registration.notes ?? '',
        registration.createdAt.toISOString(),
      ];
      const guardianRow = [...common, 'Responsável', registration.guardianName, '', ...logistics].map(csvCell).join(',');
      const memberRows = registration.members.map((member) => [
        ...common,
        member.kind === 'CRIANCA' ? 'Criança' : 'Familiar',
        member.name,
        member.age,
        ...logistics,
      ].map(csvCell).join(','));
      return [guardianRow, ...memberRows];
    });
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="inscricoes-dia-das-criancas-${edition.slug}.csv"`);
    res.send(`\uFEFFFamilia,Responsavel,Telefone,Email,Papel,Nome,Idade,CafeDaManha,CafeItens,Acompanhamento,AcompanhamentoItens,Refrigerante,Observacoes,Data\n${content.join('\n')}`);
  });

  return router;
}
