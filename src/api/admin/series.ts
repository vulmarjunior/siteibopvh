import express from 'express';
import type { Prisma, PrismaClient } from '@prisma/client';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';
import { extractYoutubeId } from '../../lib/editorial/service.js';
import { sanitizeEditorialHtml } from '../../lib/editorial/sanitizeContent.js';

const seriesInclude = {
  sections: { orderBy: { order: 'asc' as const } },
  messages: { include: { section: true, media: { orderBy: { order: 'asc' as const } }, materials: { orderBy: { order: 'asc' as const } }, readingPlan: { include: { days: { orderBy: { order: 'asc' as const } } } } }, orderBy: { scheduledFor: 'asc' as const } },
};
const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const optional = (value: unknown) => text(value) || null;

function messageData(body: any) {
  const title = text(body.title); const biblicalText = text(body.biblicalText); const scheduledFor = new Date(body.scheduledFor);
  const order = Number(body.order);
  if (!title || !biblicalText || !Number.isInteger(order) || order < 1 || Number.isNaN(scheduledFor.getTime())) throw new Error('Preencha número, título, data e texto bíblico.');
  const status = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'].includes(body.status) ? body.status : 'DRAFT';
  const videoUrl = text(body.videoUrl); const audioUrl = text(body.audioUrl); const materialUrl = text(body.materialUrl);
  const readingDays = Array.isArray(body.readingDays) ? body.readingDays.filter((day: any) => text(day.dayLabel) && text(day.biblicalText)) : [];
  return {
    core: {
      slug: text(body.slug) || slugify(title), order, title, subtitle: optional(body.subtitle),
      scheduledFor, biblicalText, speaker: optional(body.speaker), summary: optional(body.summary),
      description: optional(body.description), contentHtml: sanitizeEditorialHtml(body.contentHtml),
      sourceSystem: optional(body.sourceSystem), externalId: optional(body.externalId),
      status, publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
    media: [videoUrl ? { type: 'VIDEO' as const, title: 'Mensagem completa', url: videoUrl, provider: extractYoutubeId(videoUrl) ? 'youtube' : null, externalId: extractYoutubeId(videoUrl), order: 1 } : null, audioUrl ? { type: 'AUDIO' as const, title: 'Áudio', url: audioUrl, order: 2 } : null].filter(Boolean) as Prisma.EditorialMediaCreateWithoutMessageInput[],
    materials: materialUrl ? [{ title: text(body.materialTitle) || 'Material de apoio', type: text(body.materialType) || 'LINK', url: materialUrl, order: 1 }] : [],
    readingPlan: text(body.readingTheme) ? { theme: text(body.readingTheme), days: readingDays.map((day: any, index: number) => ({ order: index + 1, dayLabel: text(day.dayLabel), biblicalText: text(day.biblicalText), description: optional(day.description) })) } : null,
  };
}

export function createAdminSeriesRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(createAdminAuthMiddleware(prisma));
  router.use((req: AdminAuthenticatedRequest, res, next) => hasAdminPermission(req.adminUser!.role, 'series:edit') ? next() : res.status(403).json({ error: 'Sem permissão para editar séries.' }));

  router.get('/', async (_req, res) => res.json(await prisma.editorialSeries.findMany({ include: { _count: { select: { messages: true } } }, orderBy: { updatedAt: 'desc' } })));
  router.post('/', async (req: AdminAuthenticatedRequest, res) => {
    const title = text(req.body?.title); const slug = text(req.body?.slug) || slugify(title);
    if (!title || !slug) return res.status(400).json({ error: 'Informe o título da série.' });
    try {
      const created = await prisma.editorialSeries.create({ data: { title, slug, subtitle: optional(req.body.subtitle), description: optional(req.body.description), status: 'DRAFT', capabilities: req.body.capabilities ?? { video: true, audio: true, materials: true, readingPlan: true, sections: true } } });
      await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'CRIAR_SERIE', entidade: 'EditorialSeries', entidadeId: created.id, dados: { title, slug } } });
      res.status(201).json(created);
    } catch (error: any) { res.status(error?.code === 'P2002' ? 409 : 500).json({ error: error?.code === 'P2002' ? 'Este endereço já está em uso.' : 'Não foi possível criar a série.' }); }
  });
  router.get('/:id', async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const series = await prisma.editorialSeries.findUnique({ where: { id }, include: seriesInclude });
    if (!series) return res.status(404).json({ error: 'Série não encontrada.' }); res.json(series);
  });
  router.patch('/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const title = text(req.body.title); if (!title) return res.status(400).json({ error: 'Informe o título.' });
    const status = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ENDED', 'ARCHIVED'].includes(req.body.status) ? req.body.status : 'DRAFT';
    const before = await prisma.editorialSeries.findUnique({ where: { id }, select: { status: true } });
    if (!before) return res.status(404).json({ error: 'Série não encontrada.' });
    const changesPublicationState = status === 'PUBLISHED' || before.status === 'PUBLISHED';
    if (changesPublicationState && !hasAdminPermission(req.adminUser!.role, 'series:publish')) return res.status(403).json({ error: 'Sem permissão para alterar o estado de publicação da série.' });
    const updated = await prisma.editorialSeries.update({ where: { id }, data: { title, slug: text(req.body.slug) || slugify(title), subtitle: optional(req.body.subtitle), description: optional(req.body.description), status, startsAt: req.body.startsAt ? new Date(req.body.startsAt) : null, endsAt: req.body.endsAt ? new Date(req.body.endsAt) : null, publishedAt: status === 'PUBLISHED' ? new Date() : undefined, defaultThumbnailUrl: optional(req.body.defaultThumbnailUrl), capabilities: req.body.capabilities ?? {} } });
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'ATUALIZAR_SERIE', entidade: 'EditorialSeries', entidadeId: id, dados: { status } } });
    res.json(updated);
  });
  router.post('/:id/messages', async (req: AdminAuthenticatedRequest, res) => {
    const seriesId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      const data = messageData(req.body);
      console.info('[admin-series] creating message', { seriesId, contentHtmlLength: data.core.contentHtml?.length ?? 0 });
      if (data.core.status === 'PUBLISHED' && !hasAdminPermission(req.adminUser!.role, 'series:publish')) return res.status(403).json({ error: 'Sem permissão para publicar.' });
      const created = await prisma.editorialMessage.create({ data: { ...data.core, seriesId, media: { create: data.media }, materials: { create: data.materials }, readingPlan: data.readingPlan ? { create: { theme: data.readingPlan.theme, days: { create: data.readingPlan.days } } } : undefined }, include: seriesInclude.messages.include });
      await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'CRIAR_MENSAGEM', entidade: 'EditorialMessage', entidadeId: created.id, dados: { seriesId, status: created.status } } });
      res.status(201).json(created);
    } catch (error: any) { res.status(error?.code === 'P2002' ? 409 : 400).json({ error: error?.code === 'P2002' ? 'Número ou endereço já usado nesta série.' : error.message }); }
  });
  router.put('/:seriesId/messages/:messageId', async (req: AdminAuthenticatedRequest, res) => {
    const seriesId = Array.isArray(req.params.seriesId) ? req.params.seriesId[0] : req.params.seriesId;
    const messageId = Array.isArray(req.params.messageId) ? req.params.messageId[0] : req.params.messageId;
    try {
      const data = messageData(req.body);
      console.info('[admin-series] updating message', { messageId, contentHtmlLength: data.core.contentHtml?.length ?? 0 });
      const before = await prisma.editorialMessage.findFirst({ where: { id: messageId, seriesId }, select: { status: true } });
      if (!before) return res.status(404).json({ error: 'Mensagem não encontrada nesta série.' });
      const changesPublicationState = data.core.status === 'PUBLISHED' || before.status === 'PUBLISHED';
      if (changesPublicationState && !hasAdminPermission(req.adminUser!.role, 'series:publish')) return res.status(403).json({ error: 'Sem permissão para alterar o estado de publicação.' });
      const updated = await prisma.$transaction(async tx => {
        await tx.editorialMedia.deleteMany({ where: { messageId } }); await tx.editorialMaterial.deleteMany({ where: { messageId } }); await tx.editorialReadingPlan.deleteMany({ where: { messageId } });
        return tx.editorialMessage.update({ where: { id: messageId }, data: { ...data.core, media: { create: data.media }, materials: { create: data.materials }, readingPlan: data.readingPlan ? { create: { theme: data.readingPlan.theme, days: { create: data.readingPlan.days } } } : undefined }, include: seriesInclude.messages.include });
      });
      console.info('[admin-series] message persisted', { messageId, contentHtmlLength: (updated as { contentHtml?: string | null }).contentHtml?.length ?? 0 });
      await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'ATUALIZAR_MENSAGEM', entidade: 'EditorialMessage', entidadeId: messageId, dados: { status: updated.status } } });
      res.json(updated);
    } catch (error: any) { res.status(error?.code === 'P2002' ? 409 : 400).json({ error: error?.code === 'P2002' ? 'Número ou endereço já usado nesta série.' : error.message }); }
  });
  router.delete('/:id', async (req: AdminAuthenticatedRequest, res) => {
    if (!hasAdminPermission(req.adminUser!.role, 'series:delete')) return res.status(403).json({ error: 'Somente o administrador geral pode excluir uma série.' });
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const series = await prisma.editorialSeries.findUnique({ where: { id }, include: { _count: { select: { messages: true } } } });
    if (!series) return res.status(404).json({ error: 'Série não encontrada.' });
    if (series.status !== 'ARCHIVED') return res.status(409).json({ error: 'Arquive a série antes de excluí-la permanentemente.' });
    if (text(req.body?.confirmation) !== series.title) return res.status(400).json({ error: 'Digite o nome exato da série para confirmar a exclusão.' });
    await prisma.$transaction(async tx => {
      await tx.editorialSeries.delete({ where: { id } });
      await tx.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'EXCLUIR_SERIE', entidade: 'EditorialSeries', entidadeId: id, dados: { title: series.title, slug: series.slug, messageCount: series._count.messages } } });
    });
    res.json({ success: true });
  });
  return router;
}
