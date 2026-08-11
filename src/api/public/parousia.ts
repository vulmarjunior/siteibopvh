import crypto from 'crypto';
import express from 'express';
import type { PrismaClient } from '@prisma/client';
import type { Resend } from 'resend';
import { isModulePublicOperationOpen } from '../admin/modules.js';
import { currentReadingDay, selectCurrentWeeklyReading } from '../../lib/editorial/weeklyReading.js';

export function createPublicParousiaRouter(prisma: PrismaClient, getResend: () => Resend | null) {
  const router = express.Router();
  async function sendWelcomeEmail(email: string, subscriberToken: string) {
    try {
      const { buildWeeklyReadingEmail } = await import('../../lib/email-templates/weekly-reading.js');
      const reading = await selectCurrentWeeklyReading(prisma);
      const resend = getResend();
      if (!reading || !resend) return;
      const siteUrl = process.env.APP_URL || 'https://www.ibopvh.com.br';
      await resend.emails.send({ from: 'IBO Parousia <contato@ibopvh.com.br>', to: email, subject: `Leitura da Semana — #${reading.number} ${reading.title}`, html: buildWeeklyReadingEmail({ sermoeNumero: reading.number, sermoeTitulo: reading.title, tema: reading.theme, dias: reading.days, unsubscribeUrl: `${siteUrl}/api/parousia/unsubscribe?token=${subscriberToken}`, siteUrl }) });
    } catch (error) { console.error('[parousia] Welcome email failed:', error); }
  }

  router.post('/subscribe', async (req, res) => {
    if (!(await isModulePublicOperationOpen(prisma, 'parousia'))) return res.status(410).json({ error: 'As inscrições para esta série estão fechadas neste momento.' });
    const email = String(req.body.email || '').trim().toLowerCase();
    const name = req.body.name ? String(req.body.name).trim() : null;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'E-mail inválido.' });
    try {
      const existing = await prisma.readingSubscriber.findUnique({ where: { email } });
      if (existing?.active) return res.json({ success: true, message: 'Este e-mail já está inscrito.' });
      let subscriberToken: string;
      if (existing) {
        await prisma.readingSubscriber.update({ where: { email }, data: { active: true, unsubscribedAt: null, name: name || existing.name } });
        subscriberToken = existing.token;
      } else {
        subscriberToken = crypto.randomBytes(32).toString('hex');
        await prisma.readingSubscriber.create({ data: { email, name, token: subscriberToken } });
      }
      res.json({ success: true, message: existing ? 'Inscrição reativada com sucesso!' : 'Inscrição realizada com sucesso!' });
      void sendWelcomeEmail(email, subscriberToken);
    } catch (error) { console.error('Parousia subscription error:', error); res.status(500).json({ error: 'Não foi possível concluir a inscrição.' }); }
  });

  router.get('/unsubscribe', async (req, res) => {
    const token = String(req.query.token || '');
    if (!token) return res.status(400).send('<html><body><h1>Token inválido</h1></body></html>');
    try {
      const subscriber = await prisma.readingSubscriber.findUnique({ where: { token } });
      if (!subscriber) return res.status(404).send('<html><body><h1>Assinatura não encontrada</h1></body></html>');
      await prisma.readingSubscriber.update({ where: { token }, data: { active: false, unsubscribedAt: new Date() } });
      res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Inscrição cancelada</title><style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#0f1115;color:#d4af37}.box{text-align:center;padding:3rem}.box p{color:#9ca3af}</style></head><body><div class="box"><h1>Inscrição cancelada</h1><p>Você não receberá mais e-mails com as leituras semanais.</p><p><a href="/da-ascensao-a-parousia" style="color:#d4af37">Voltar ao hotsite</a></p></div></body></html>');
    } catch (error) { console.error('Parousia unsubscribe error:', error); res.status(500).send('<html><body><h1>Erro ao cancelar inscrição</h1></body></html>'); }
  });

  router.get('/today', async (_req, res) => {
    try {
      const now = new Date();
      const reading = await selectCurrentWeeklyReading(prisma, now);
      if (!reading) return res.json({ message: 'Nenhuma leitura disponível para hoje.' });
      const { dayLabel, reading: dayReading } = currentReadingDay(reading, now);
      res.json({ sermoe: { numero: reading.number, titulo: reading.title }, tema: reading.theme, dia: dayLabel, leitura: dayReading });
    } catch (error) { console.error('Current reading error:', error); res.status(500).json({ error: 'Erro ao buscar leitura do dia.' }); }
  });
  return router;
}
