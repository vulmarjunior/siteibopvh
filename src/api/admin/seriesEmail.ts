import express from 'express';
import type { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';
import { selectCurrentWeeklyReading } from '../../lib/editorial/weeklyReading.js';
import { buildWeeklyReadingEmail } from '../../lib/email-templates/weekly-reading.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createAdminSeriesEmailRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(createAdminAuthMiddleware(prisma));
  router.use((req: AdminAuthenticatedRequest, res, next) => hasAdminPermission(req.adminUser!.role, 'email:manage') ? next() : res.status(403).json({ error: 'Somente o administrador geral pode gerenciar e-mails.' }));

  router.get('/:seriesId', async (req, res) => {
    const seriesId = String(req.params.seriesId);
    const series = await prisma.editorialSeries.findUnique({ where: { id: seriesId }, select: { id: true, slug: true, title: true, emailEnabled: true } });
    if (!series) return res.status(404).json({ error: 'Série não encontrada.' });
    const [selection, subscribers, runs] = await Promise.all([
      selectCurrentWeeklyReading(prisma, new Date(), series.slug),
      prisma.readingSubscriber.findMany({ select: { id: true, email: true, name: true, active: true, subscribedAt: true, unsubscribedAt: true }, orderBy: { subscribedAt: 'desc' } }),
      prisma.editorialEmailRun.findMany({ where: { seriesId }, include: { message: { select: { order: true, title: true } } }, orderBy: { startedAt: 'desc' }, take: 20 }),
    ]);
    res.json({ series, selection, subscribers, runs });
  });

  router.patch('/:seriesId/config', async (req: AdminAuthenticatedRequest, res) => {
    const seriesId = String(req.params.seriesId);
    const updated = await prisma.editorialSeries.update({ where: { id: seriesId }, data: { emailEnabled: Boolean(req.body?.emailEnabled) }, select: { id: true, emailEnabled: true } });
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'CONFIGURAR_EMAIL_SERIE', entidade: 'EditorialSeries', entidadeId: seriesId, dados: { emailEnabled: updated.emailEnabled } } });
    res.json(updated);
  });

  router.patch('/:seriesId/subscribers/:subscriberId', async (req: AdminAuthenticatedRequest, res) => {
    const subscriberId = Number(req.params.subscriberId);
    if (!Number.isInteger(subscriberId)) return res.status(400).json({ error: 'Assinante inválido.' });
    const active = Boolean(req.body?.active);
    const updated = await prisma.readingSubscriber.update({ where: { id: subscriberId }, data: { active, unsubscribedAt: active ? null : new Date() }, select: { id: true, active: true, unsubscribedAt: true } });
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: active ? 'REATIVAR_ASSINANTE' : 'DESATIVAR_ASSINANTE', entidade: 'ReadingSubscriber', entidadeId: String(subscriberId), dados: { seriesId: req.params.seriesId } } });
    res.json(updated);
  });

  router.get('/:seriesId/preview', async (req, res) => {
    const series = await prisma.editorialSeries.findUnique({ where: { id: String(req.params.seriesId) }, select: { slug: true } });
    if (!series) return res.status(404).json({ error: 'Série não encontrada.' });
    const selection = await selectCurrentWeeklyReading(prisma, new Date(), series.slug);
    if (!selection) return res.status(404).json({ error: 'Nenhuma leitura publicada está disponível.' });
    const siteUrl = process.env.APP_URL || 'https://www.ibopvh.com.br';
    res.json({ selection, html: buildWeeklyReadingEmail({ sermoeNumero: selection.number, sermoeTitulo: selection.title, tema: selection.theme, dias: selection.days, unsubscribeUrl: '#preview', siteUrl }) });
  });

  router.post('/:seriesId/test', async (req: AdminAuthenticatedRequest, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!emailPattern.test(email)) return res.status(400).json({ error: 'Informe um e-mail válido.' });
    if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'RESEND_API_KEY não configurada.' });
    const series = await prisma.editorialSeries.findUnique({ where: { id: String(req.params.seriesId) }, select: { id: true, slug: true } });
    if (!series) return res.status(404).json({ error: 'Série não encontrada.' });
    const selection = await selectCurrentWeeklyReading(prisma, new Date(), series.slug);
    if (!selection) return res.status(404).json({ error: 'Nenhuma leitura publicada está disponível.' });
    const siteUrl = process.env.APP_URL || 'https://www.ibopvh.com.br';
    const html = buildWeeklyReadingEmail({ sermoeNumero: selection.number, sermoeTitulo: selection.title, tema: selection.theme, dias: selection.days, unsubscribeUrl: '#teste', siteUrl });
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({ from: 'IBO Parousia <contato@ibopvh.com.br>', to: email, subject: `[TESTE] Leitura da Semana — #${selection.number} ${selection.title}`, html }, { idempotencyKey: `weekly-test/${series.id}/${selection.messageId}/${Date.now()}` });
    if (error) return res.status(502).json({ error: error.message });
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'ENVIAR_TESTE_EMAIL_SERIE', entidade: 'EditorialSeries', entidadeId: series.id, dados: { recipient: email, providerId: data?.id, messageId: selection.messageId } } });
    res.json({ success: true, providerId: data?.id, message: `Teste enviado para ${email}.` });
  });

  return router;
}
