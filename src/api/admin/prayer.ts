import express from 'express';
import type { PrismaClient } from '@prisma/client';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';

function idParam(value: string | string[]): number | null {
  const parsed = Number.parseInt(Array.isArray(value) ? value[0] : value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function csvCell(value: unknown): string {
  const raw = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

const PRAYER_CONFIG_KEYS = new Set(['slot_capacity', 'email_encouragement']);

function validatePrayerConfig(key: string, value: string): string | null {
  if (!PRAYER_CONFIG_KEYS.has(key)) return 'Configuração não permitida';
  if (key === 'slot_capacity') {
    const capacity = Number(value);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100) return 'A capacidade deve ser um inteiro entre 1 e 100';
  }
  if (key === 'email_encouragement' && value.length > 5000) return 'O texto de encorajamento excede 5.000 caracteres';
  return null;
}

export function createAdminPrayerRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(createAdminAuthMiddleware(prisma));
  router.use((req: AdminAuthenticatedRequest, res, next) => {
    if (!req.adminUser || !hasAdminPermission(req.adminUser.role, 'prayer:manage')) {
      return res.status(403).json({ error: 'Sem permissão para gerenciar o Relógio de Oração' });
    }
    next();
  });

  router.get('/reservations', async (req: AdminAuthenticatedRequest, res) => {
    const date = typeof req.query.date === 'string' ? req.query.date : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: 'Data inválida' });
    const canReadPersonalRequests = hasAdminPermission(req.adminUser!.role, 'prayer:personal-requests');
    const reservations = await prisma.reservation.findMany({
      where: { date, cancelledAt: null },
      orderBy: { timeStart: 'asc' },
      select: { id: true, date: true, timeStart: true, timeEnd: true, name: true, email: true, prayerThemes: true, personalRequest: canReadPersonalRequests, reservedAt: true },
    });
    res.json({ reservations, permissions: { canReadPersonalRequests } });
  });

  router.patch('/reservations/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = idParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Reserva inválida' });
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim();
    if (name.length < 2 || !email.includes('@')) return res.status(400).json({ error: 'Nome ou e-mail inválido' });
    const before = await prisma.reservation.findUnique({ where: { id } });
    if (!before) return res.status(404).json({ error: 'Reserva não encontrada' });
    const canEditPersonalRequests = hasAdminPermission(req.adminUser!.role, 'prayer:personal-requests');
    const prayerThemes = Array.isArray(req.body?.prayerThemes) ? req.body.prayerThemes.map(String).slice(0, 20) : [];
    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        name,
        email,
        prayerThemes: JSON.stringify(prayerThemes),
        ...(canEditPersonalRequests && typeof req.body?.personalRequest === 'string' ? { personalRequest: req.body.personalRequest.trim() || null } : {}),
      },
    });
    const user = req.adminUser!;
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'ATUALIZAR_RESERVA_ORACAO', entidade: 'Reservation', entidadeId: String(id), dados: { nameChanged: before.name !== updated.name, emailChanged: before.email !== updated.email, themesChanged: before.prayerThemes !== updated.prayerThemes, personalRequestChanged: before.personalRequest !== updated.personalRequest } } });
    res.json({ success: true });
  });

  router.delete('/reservations/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = idParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Reserva inválida' });
    const existing = await prisma.reservation.findUnique({ where: { id }, select: { id: true, date: true, timeStart: true } });
    if (!existing) return res.status(404).json({ error: 'Reserva não encontrada' });
    await prisma.reservation.delete({ where: { id } });
    const user = req.adminUser!;
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'EXCLUIR_RESERVA_ORACAO', entidade: 'Reservation', entidadeId: String(id), dados: { date: existing.date, timeStart: existing.timeStart } } });
    res.json({ success: true });
  });

  router.get('/export.csv', async (_req, res) => {
    const reservations = await prisma.reservation.findMany({ where: { cancelledAt: null }, orderBy: [{ date: 'desc' }, { timeStart: 'asc' }], select: { id: true, date: true, timeStart: true, timeEnd: true, name: true, email: true, prayerThemes: true, reservedAt: true } });
    const rows = reservations.map((item) => [item.id, item.date, item.timeStart, item.timeEnd, item.name, item.email, item.prayerThemes, item.reservedAt.toISOString()].map(csvCell).join(','));
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="reservas_relogio.csv"');
    res.send(`\uFEFFID,Data,Inicio,Fim,Nome,Email,Temas,ReservadoEm\n${rows.join('\n')}`);
  });

  router.get('/config', async (_req, res) => res.json(await prisma.config.findMany({ where: { key: { in: [...PRAYER_CONFIG_KEYS] } }, orderBy: { key: 'asc' } })));
  router.put('/config/:key', async (req: AdminAuthenticatedRequest, res) => {
    const key = Array.isArray(req.params.key) ? req.params.key[0] : req.params.key;
    const value = String(req.body?.value ?? '');
    const validationError = validatePrayerConfig(key, value);
    if (validationError) return res.status(400).json({ error: validationError });
    const updated = await prisma.config.upsert({ where: { key }, update: { value }, create: { key, value } });
    const user = req.adminUser!;
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'ATUALIZAR_CONFIG_ORACAO', entidade: 'Config', entidadeId: key } });
    res.json(updated);
  });

  router.get('/themes', async (_req, res) => res.json(await prisma.prayerTheme.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] })));
  router.post('/themes', async (req: AdminAuthenticatedRequest, res) => {
    const label = String(req.body?.label ?? '').trim();
    if (label.length < 2 || label.length > 120) return res.status(400).json({ error: 'Tema inválido' });
    const theme = await prisma.prayerTheme.create({ data: { label, active: true, order: Number.isInteger(req.body?.order) ? req.body.order : 0 } });
    const user = req.adminUser!;
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'CRIAR_TEMA_ORACAO', entidade: 'PrayerTheme', entidadeId: String(theme.id) } });
    res.status(201).json(theme);
  });
  router.patch('/themes/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = idParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Tema inválido' });
    const data: { label?: string; active?: boolean; order?: number } = {};
    if (typeof req.body?.label === 'string') data.label = req.body.label.trim();
    if (typeof req.body?.active === 'boolean') data.active = req.body.active;
    if (Number.isInteger(req.body?.order)) data.order = req.body.order;
    if (data.label !== undefined && (data.label.length < 2 || data.label.length > 120)) return res.status(400).json({ error: 'Tema inválido' });
    const theme = await prisma.prayerTheme.update({ where: { id }, data });
    const user = req.adminUser!;
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'ATUALIZAR_TEMA_ORACAO', entidade: 'PrayerTheme', entidadeId: String(id) } });
    res.json(theme);
  });
  router.delete('/themes/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = idParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Tema inválido' });
    await prisma.prayerTheme.delete({ where: { id } });
    const user = req.adminUser!;
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: user.id, usuarioEmail: user.email, acao: 'EXCLUIR_TEMA_ORACAO', entidade: 'PrayerTheme', entidadeId: String(id) } });
    res.json({ success: true });
  });

  return router;
}
