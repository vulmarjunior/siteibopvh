import express from 'express';
import type { PrismaClient } from '@prisma/client';
import type { Resend } from 'resend';
import { isModulePublicOperationOpen } from '../admin/modules.js';
import { consumeRateLimit } from '../../lib/server/rateLimit.js';

const ebfColor = (age: number) => age <= 5 ? 'Amarelo' : age <= 7 ? 'Verde' : age <= 9 ? 'Azul' : 'Vermelho';
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

export function createPublicEbfRouter(prisma: PrismaClient, getResend: () => Resend | null) {
  const router = express.Router();
  router.post('/registrations', async (req, res) => {
    const rateLimit = await consumeRateLimit(prisma, req, { scope: 'ebf-registration', limit: 6, windowMs: 60 * 60 * 1000 });
    if (!rateLimit.allowed) { res.setHeader('Retry-After', rateLimit.retryAfterSeconds); return res.status(429).json({ error: 'Limite de inscrições atingido. Tente novamente mais tarde.' }); }
    if (!(await isModulePublicOperationOpen(prisma, 'ebf'))) return res.status(410).json({ error: 'As inscrições para a EBF estão encerradas.' });
    const childName = String(req.body.childName || '').trim();
    const guardianName = String(req.body.guardianName || '').trim();
    const phone = String(req.body.phone || '').replace(/\D/g, '');
    const age = Number(req.body.age);
    const visitor = req.body.visitor;
    if (childName.length < 3 || guardianName.length < 3 || !Number.isInteger(age) || age < 3 || age > 12 || phone.length < 10 || phone.length > 11 || typeof visitor !== 'boolean') return res.status(400).json({ error: 'Revise os dados informados.' });
    try {
      const edition = await prisma.siteEdition.findFirst({ where: { moduleId: 'ebf', status: 'ACTIVE' }, orderBy: [{ year: 'desc' }, { createdAt: 'desc' }], select: { id: true, name: true } });
      if (!edition) return res.status(409).json({ error: 'Nenhuma edição ativa da EBF foi configurada.' });
      const colorGroup = ebfColor(age);
      const registration = await prisma.ebfRegistration.create({ data: { editionId: edition.id, childName, age, colorGroup, guardianName, phone, visitor } });
      const resend = getResend();
      if (resend) void resend.emails.send({ from: 'EBF IBO <contato@ibopvh.com.br>', to: 'contato@ibopvh.com.br', subject: `Nova inscrição EBF — ${childName}`, html: `<h2>${escapeHtml(edition.name)}</h2><p><b>Criança:</b> ${escapeHtml(childName)}</p><p><b>Idade:</b> ${age} anos</p><p><b>Grupo:</b> ${escapeHtml(colorGroup)}</p><p><b>Responsável:</b> ${escapeHtml(guardianName)}</p><p><b>Telefone:</b> ${escapeHtml(phone)}</p><p><b>Visitante:</b> ${visitor ? 'Sim' : 'Não'}</p>` }).catch((error) => console.error('EBF email error:', error));
      res.status(201).json({ success: true, id: registration.id, colorGroup });
    } catch (error) { console.error('EBF registration error:', error); res.status(500).json({ error: 'Não foi possível concluir a inscrição.' }); }
  });
  return router;
}
