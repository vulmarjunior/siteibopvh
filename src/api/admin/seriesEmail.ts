import express from 'express';
import type { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';
import { selectCurrentWeeklyReading } from '../../lib/editorial/weeklyReading.js';
import { buildWeeklyReadingEmail } from '../../lib/email-templates/weekly-reading.js';
import runWeeklyReading from '../../../netlify/functions/weekly-reading.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createAdminSeriesEmailRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(createAdminAuthMiddleware(prisma));
  router.use((req: AdminAuthenticatedRequest, res, next) => hasAdminPermission(req.adminUser!.role, 'email:manage') ? next() : res.status(403).json({ error: 'Somente o administrador geral pode gerenciar e-mails.' }));

  router.get('/:seriesId', async (req, res) => {
    const seriesId = String(req.params.seriesId);
    let series = await prisma.editorialSeries.findUnique({ where: { id: seriesId }, select: { id: true, slug: true, title: true, emailEnabled: true } }).catch(() => null);

    // Fallback se a série procurada não for encontrada por id (ex: se foi passada por slug)
    if (!series) {
      series = await prisma.editorialSeries.findFirst({ where: { slug: seriesId }, select: { id: true, slug: true, title: true, emailEnabled: true } }).catch(() => null);
    }

    if (!series) {
      // Fallback virtual para a série padrão caso ainda não esteja semeada no banco
      series = {
        id: seriesId,
        slug: 'da-ascensao-a-parousia',
        title: 'Da Ascensão à Parousia',
        emailEnabled: true,
      };
    }

    const [selection, subscribers, runs] = await Promise.all([
      selectCurrentWeeklyReading(prisma, new Date(), series.slug),
      prisma.readingSubscriber.findMany({ select: { id: true, email: true, name: true, active: true, subscribedAt: true, unsubscribedAt: true }, orderBy: { subscribedAt: 'desc' } }).catch(() => []),
      prisma.editorialEmailRun.findMany({ where: { seriesId: series.id }, include: { message: { select: { order: true, title: true } } }, orderBy: { startedAt: 'desc' }, take: 20 }).catch(() => []),
    ]);

    const automation = {
      schedule: 'Toda segunda-feira às 07:00 (Porto Velho)',
      resendConfigured: Boolean(process.env.RESEND_API_KEY),
      cronSecretConfigured: Boolean(process.env.CRON_SECRET),
      appUrl: process.env.APP_URL || 'https://www.ibopvh.com.br',
    };

    res.json({ series, selection, subscribers, runs, automation });
  });

  router.patch('/:seriesId/config', async (req: AdminAuthenticatedRequest, res) => {
    const seriesId = String(req.params.seriesId);
    const emailEnabled = Boolean(req.body?.emailEnabled);

    let updated = await prisma.editorialSeries.update({
      where: { id: seriesId },
      data: { emailEnabled },
      select: { id: true, emailEnabled: true },
    }).catch(() => null);

    // Se a série ainda não existia por id, tenta atualizar por slug ou criar
    if (!updated) {
      updated = await prisma.editorialSeries.upsert({
        where: { slug: 'da-ascensao-a-parousia' },
        create: {
          slug: 'da-ascensao-a-parousia',
          title: 'Da Ascensão à Parousia',
          status: 'PUBLISHED',
          emailEnabled,
        },
        update: { emailEnabled },
        select: { id: true, emailEnabled: true },
      }).catch(() => ({ id: seriesId, emailEnabled }));
    }

    await prisma.curadoriaAuditoria.create({
      data: {
        usuarioId: req.adminUser!.id,
        usuarioEmail: req.adminUser!.email,
        acao: 'CONFIGURAR_EMAIL_SERIE',
        entidade: 'EditorialSeries',
        entidadeId: seriesId,
        dados: { emailEnabled },
      },
    }).catch(() => null);

    res.json(updated);
  });

  router.patch('/:seriesId/subscribers/:subscriberId', async (req: AdminAuthenticatedRequest, res) => {
    const subscriberId = Number(req.params.subscriberId);
    if (!Number.isInteger(subscriberId)) return res.status(400).json({ error: 'Assinante inválido.' });
    const active = Boolean(req.body?.active);
    const updated = await prisma.readingSubscriber.update({ where: { id: subscriberId }, data: { active, unsubscribedAt: active ? null : new Date() }, select: { id: true, active: true, unsubscribedAt: true } });
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: active ? 'REATIVAR_ASSINANTE' : 'DESATIVAR_ASSINANTE', entidade: 'ReadingSubscriber', entidadeId: String(subscriberId), dados: { seriesId: req.params.seriesId } } }).catch(() => null);
    res.json(updated);
  });

  router.get('/:seriesId/preview', async (req, res) => {
    const series = await prisma.editorialSeries.findUnique({ where: { id: String(req.params.seriesId) }, select: { slug: true } }).catch(() => null);
    const slug = series?.slug || 'da-ascensao-a-parousia';
    const selection = await selectCurrentWeeklyReading(prisma, new Date(), slug);
    if (!selection) return res.status(404).json({ error: 'Nenhuma leitura publicada está disponível para esta semana.' });
    const siteUrl = process.env.APP_URL || 'https://www.ibopvh.com.br';
    res.json({ selection, html: buildWeeklyReadingEmail({ sermoeNumero: selection.number, sermoeTitulo: selection.title, tema: selection.theme, dias: selection.days, unsubscribeUrl: '#preview', siteUrl }) });
  });

  router.post('/:seriesId/test', async (req: AdminAuthenticatedRequest, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!emailPattern.test(email)) return res.status(400).json({ error: 'Informe um e-mail válido.' });
    if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'RESEND_API_KEY não configurada no ambiente.' });

    const series = await prisma.editorialSeries.findUnique({ where: { id: String(req.params.seriesId) }, select: { id: true, slug: true } }).catch(() => null);
    const slug = series?.slug || 'da-ascensao-a-parousia';
    const selection = await selectCurrentWeeklyReading(prisma, new Date(), slug);
    if (!selection) return res.status(404).json({ error: 'Nenhuma leitura publicada está disponível para teste.' });

    const siteUrl = process.env.APP_URL || 'https://www.ibopvh.com.br';
    const html = buildWeeklyReadingEmail({ sermoeNumero: selection.number, sermoeTitulo: selection.title, tema: selection.theme, dias: selection.days, unsubscribeUrl: '#teste', siteUrl });
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send(
      {
        from: 'IBO Parousia <contato@ibopvh.com.br>',
        to: email,
        subject: `[TESTE] Leitura da Semana — #${selection.number} ${selection.title}`,
        html,
      },
      { idempotencyKey: `weekly-test/${series?.id || 'parousia'}/${selection.messageId}/${Date.now()}` }
    );

    if (error) return res.status(502).json({ error: error.message });

    await prisma.curadoriaAuditoria.create({
      data: {
        usuarioId: req.adminUser!.id,
        usuarioEmail: req.adminUser!.email,
        acao: 'ENVIAR_TESTE_EMAIL_SERIE',
        entidade: 'EditorialSeries',
        entidadeId: series?.id || 'da-ascensao-a-parousia',
        dados: { recipient: email, providerId: data?.id, messageId: selection.messageId },
      },
    }).catch(() => null);

    res.json({ success: true, providerId: data?.id, message: `Teste enviado com sucesso para ${email}.` });
  });

  // Rota para testar a automação sob demanda diretamente da Central
  router.post('/:seriesId/trigger-cron', async (req: AdminAuthenticatedRequest, res) => {
    try {
      const result = await runWeeklyReading();
      await prisma.curadoriaAuditoria.create({
        data: {
          usuarioId: req.adminUser!.id,
          usuarioEmail: req.adminUser!.email,
          acao: 'DISPARAR_CRON_EMAIL_SERIE',
          entidade: 'EditorialSeries',
          entidadeId: String(req.params.seriesId),
          dados: result as any,
        },
      }).catch(() => null);
      res.json({ success: true, result });
    } catch (err) {
      console.error('[seriesEmail] Erro ao disparar cron manualmente:', err);
      res.status(500).json({ error: err instanceof Error ? err.message : 'Falha ao executar rotina automatizada' });
    }
  });

  return router;
}
