import express from 'express';
import type { PrismaClient } from '@prisma/client';
import type { Resend } from 'resend';
import crypto from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import 'dayjs/locale/pt-br.js';
import { consumeRateLimit } from '../../lib/server/rateLimit.js';
import { isModulePublicOperationOpen } from '../admin/modules.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const TZ = 'America/Porto_Velho';
const escapeHtml = (value: unknown) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!
  );

const DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function createPublicPrayerSentinelRouter(
  prisma: PrismaClient,
  getResend: () => Resend | null
) {
  const router = express.Router();

  // Helper para obter informações da data atual no fuso de Porto Velho
  const getChurchCurrentInfo = () => {
    const now = dayjs().tz(TZ);
    return {
      now,
      dayOfWeek: now.day(), // 0 = Dom, 1 = Seg ... 6 = Sáb
      dateStr: now.format('YYYY-MM-DD'),
      formattedDate: now.locale('pt-br').format('dddd, DD [de] MMMM'),
    };
  };

  // 1. Obter a grade dos 7 dias da semana (com navegação por startDate)
  router.get('/semana', async (req, res) => {
    try {
      const churchNow = getChurchCurrentInfo();
      const requestedDate = typeof req.query.startDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.query.startDate)
        ? dayjs.tz(req.query.startDate, TZ)
        : churchNow.now;

      // Iniciar a semana na Segunda-feira (padrão brasileiro/eclesial de escala)
      const startOfWeek = requestedDate.startOf('isoWeek'); // Segunda-feira
      const endOfWeek = requestedDate.endOf('isoWeek'); // Domingo

      const [sentinels, capacityConfig, weekHandovers] = await Promise.all([
        prisma.prayerSentinel.findMany({
          where: { active: true, cancelledAt: null },
          select: {
            id: true,
            dayOfWeek: true,
            name: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
        prisma.config.findUnique({ where: { key: 'sentinel_capacity' } }),
        prisma.prayerHandover.findMany({
          where: {
            date: {
              gte: startOfWeek.format('YYYY-MM-DD'),
              lte: endOfWeek.format('YYYY-MM-DD'),
            },
          },
          select: { id: true, date: true, dayOfWeek: true, authorName: true, completedAt: true },
        }),
      ]);

      const parsedCapacity = Number.parseInt(capacityConfig?.value || '4', 10);
      const capacity = Number.isInteger(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : 4;

      // Construir os 7 dias da semana (Segunda=1 a Domingo=0/7)
      const days = [];
      for (let i = 0; i < 7; i++) {
        const currentDayDate = startOfWeek.add(i, 'day');
        const dayOfWeekIndex = currentDayDate.day(); // 0 a 6
        const dateStr = currentDayDate.format('YYYY-MM-DD');

        // Filtrar intercessores alocados neste dia da semana
        const daySentinels = sentinels
          .filter((s) => s.dayOfWeek === dayOfWeekIndex)
          .map((s) => ({ id: s.id, name: s.name.split(' ')[0] || s.name }));

        // Handovers completados nesta data específica da semana
        const dayHandovers = weekHandovers.filter((h) => h.date === dateStr);

        const isToday = dateStr === churchNow.dateStr;
        const isPast = dateStr < churchNow.dateStr;

        days.push({
          dayOfWeek: dayOfWeekIndex,
          dayName: DAY_NAMES[dayOfWeekIndex],
          shortDayName: DAY_NAMES[dayOfWeekIndex]?.split('-')[0] || '',
          dateStr,
          formattedDate: currentDayDate.locale('pt-br').format('DD/MMM'),
          dayNumber: currentDayDate.date(),
          sentinels: daySentinels,
          count: daySentinels.length,
          isFull: daySentinels.length >= capacity,
          openSlots: Math.max(0, capacity - daySentinels.length),
          isToday,
          isPast,
          isCompleted: dayHandovers.length > 0,
        });
      }

      res.json({
        days,
        capacity,
        currentDayOfWeek: churchNow.dayOfWeek,
        currentDateStr: churchNow.dateStr,
        startDate: startOfWeek.format('YYYY-MM-DD'),
        endDate: endOfWeek.format('YYYY-MM-DD'),
        formattedRange: `${startOfWeek.locale('pt-br').format('DD [de] MMMM')} a ${endOfWeek.locale('pt-br').format('DD [de] MMMM [de] YYYY')}`,
        totalSentinels: sentinels.length,
      });
    } catch (error) {
      console.error('Erro ao buscar semana da escala:', error);
      res.status(500).json({ error: 'Falha ao carregar escala semanal' });
    }
  });

  // 2. Inscrever-se como intercessor recorrente em um dia da semana
  router.post('/inscrever', async (req, res) => {
    const rateLimit = await consumeRateLimit(prisma, req, {
      scope: 'sentinel-subscription',
      limit: 6,
      windowMs: 60 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', rateLimit.retryAfterSeconds);
      return res.status(429).json({ error: 'Muitas inscrições recentes. Tente novamente mais tarde.' });
    }

    if (!(await isModulePublicOperationOpen(prisma, 'relogio'))) {
      return res.status(410).json({ error: 'As inscrições do Relógio de Oração estão temporariamente pausadas.' });
    }

    const dayOfWeek = Number.parseInt(String(req.body?.dayOfWeek), 10);
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : null;

    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      return res.status(400).json({ error: 'Dia da semana inválido (deve ser entre 0 e 6).' });
    }
    if (name.length < 2 || name.length > 120) {
      return res.status(400).json({ error: 'Por favor, informe seu nome completo.' });
    }
    if (!email.includes('@') || email.length > 254) {
      return res.status(400).json({ error: 'Por favor, informe um e-mail válido.' });
    }

    try {
      const cancelToken = crypto.randomBytes(32).toString('hex');
      const dayName = DAY_NAMES[dayOfWeek];

      const sentinel = await prisma.$transaction(async (tx) => {
        const capacityConfig = await tx.config.findUnique({ where: { key: 'sentinel_capacity' } });
        const parsedCapacity = Number.parseInt(capacityConfig?.value || '4', 10);
        const capacity = Number.isInteger(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : 4;

        // Verificar vagas no dia da semana
        const existingCount = await tx.prayerSentinel.count({
          where: { dayOfWeek, active: true, cancelledAt: null },
        });

        if (existingCount >= capacity) {
          throw Object.assign(new Error(`${dayName} já atingiu a capacidade máxima de intercessores.`), { statusCode: 409 });
        }

        // Verificar duplicata (mesmo email no mesmo dia da semana)
        const duplicate = await tx.prayerSentinel.findFirst({
          where: { dayOfWeek, email, active: true, cancelledAt: null },
        });
        if (duplicate) {
          throw Object.assign(new Error(`Você já está cadastrado(a) para orar toda(o) ${dayName}.`), { statusCode: 400 });
        }

        return tx.prayerSentinel.create({
          data: {
            dayOfWeek,
            name,
            email,
            phone,
            cancelToken,
            active: true,
          },
        });
      });

      // Envio de e-mail de confirmação via Resend
      const resend = getResend();
      const appUrl = process.env.APP_URL || 'https://ibopvh.com.br';
      const cancelUrl = `${appUrl}/relogio?cancelToken=${cancelToken}`;

      if (resend) {
        try {
          await resend.emails.send({
            from: 'Relógio de Oração IBO <contato@ibopvh.com.br>',
            to: [email],
            subject: `Escala de Intercessão: Toda ${dayName} — Igreja Batista Olaria`,
            html: `
              <div style="font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 16px; overflow: hidden; border: 1px solid rgba(245, 158, 11, 0.2);">
                <div style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 36px 28px; text-align: center; border-bottom: 2px solid #f59e0b;">
                  <span style="color: #f59e0b; text-transform: uppercase; letter-spacing: 3px; font-size: 11px; font-weight: bold;">Igreja Batista Olaria</span>
                  <h1 style="color: #ffffff; font-family: 'Cinzel', Georgia, serif; font-size: 24px; margin: 12px 0 6px 0;">Ministério de Oração & Intercessão</h1>
                  <p style="color: #a8a29e; font-size: 14px; margin: 0;">"Perseverai na oração, vigiando com ações de graças." — Cl 4:2</p>
                </div>
                <div style="padding: 28px; line-height: 1.6;">
                  <p style="font-size: 16px; margin-top: 0;">Graça e paz, <strong>${escapeHtml(name)}</strong>!</p>
                  <p>Seu compromisso na escala semanal de intercessão da nossa igreja foi registrado com sucesso.</p>
                  <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 18px; border-radius: 8px; margin: 24px 0;">
                    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #f59e0b; font-weight: bold;">Seu Dia de Oração</div>
                    <div style="font-size: 22px; font-weight: bold; color: #ffffff; margin-top: 4px;">Toda ${dayName}</div>
                    <p style="font-size: 13px; color: #a8a29e; margin: 6px 0 0 0;">Ao longo deste dia, em seus momentos devocionais, dedique-se a orar pela fidelidade doutrinária, pela pregação da Palavra, pelos nossos missionários e pelas famílias da congregação.</p>
                  </div>
                  <p style="font-size: 14px; color: #d6d3d1;">No seu dia de intercessão, acesse o portal da igreja para consultar o <strong>Guia Pastoral de Oração da Semana</strong> e registrar a realização da sua oração.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${appUrl}/relogio" style="display: inline-block; background: #f59e0b; color: #1c1917; font-weight: bold; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 15px; letter-spacing: 0.5px;">Acessar o Relógio de Oração</a>
                  </div>
                  <hr style="border: none; border-top: 1px solid #292524; margin: 24px 0;" />
                  <p style="font-size: 12px; color: #78716c; text-align: center;">Caso precise alterar ou cancelar seu compromisso, <a href="${cancelUrl}" style="color: #f59e0b; text-decoration: underline;">clique aqui para cancelar</a>.</p>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Erro ao enviar e-mail de confirmação de intercessor:', emailErr);
        }
      }

      res.status(201).json({
        success: true,
        sentinel: {
          id: sentinel.id,
          dayOfWeek: sentinel.dayOfWeek,
          dayName,
          name: sentinel.name,
        },
      });
    } catch (error: any) {
      console.error('Erro na inscrição de intercessor:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ error: error.message || 'Erro ao processar inscrição' });
    }
  });

  // 3. Cancelar compromisso via token
  router.post('/cancelar', async (req, res) => {
    const token = String(req.body?.token ?? '').trim();
    if (!token || token.length < 16) {
      return res.status(400).json({ error: 'Token de cancelamento inválido' });
    }

    try {
      const sentinel = await prisma.prayerSentinel.findUnique({
        where: { cancelToken: token },
      });

      if (!sentinel || !sentinel.active) {
        return res.status(404).json({ error: 'Registro não encontrado ou já cancelado.' });
      }

      await prisma.prayerSentinel.update({
        where: { id: sentinel.id },
        data: { active: false, cancelledAt: new Date() },
      });

      res.json({ success: true, message: 'Seu compromisso na escala de oração foi cancelado com sucesso.' });
    } catch (error) {
      console.error('Erro ao cancelar intercessor:', error);
      res.status(500).json({ error: 'Falha ao processar cancelamento' });
    }
  });

  // 4. Transmissão Fraterna / Registrar cumprimento da oração de hoje
  router.post('/passar-bastao', async (req, res) => {
    const rateLimit = await consumeRateLimit(prisma, req, {
      scope: 'sentinel-handover',
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', rateLimit.retryAfterSeconds);
      return res.status(429).json({ error: 'Você acabou de registrar uma oração. Aguarde um momento.' });
    }

    const churchNow = getChurchCurrentInfo();
    const authorName = String(req.body?.authorName ?? '').trim();
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : null;
    const verse = typeof req.body?.verse === 'string' ? req.body.verse.trim() : null;

    if (authorName.length < 2 || authorName.length > 100) {
      return res.status(400).json({ error: 'Por favor, informe seu nome.' });
    }
    if (message && message.length > 500) {
      return res.status(400).json({ error: 'A mensagem não pode exceder 500 caracteres.' });
    }
    if (verse && verse.length > 200) {
      return res.status(400).json({ error: 'O versículo não pode exceder 200 caracteres.' });
    }

    try {
      const handover = await prisma.prayerHandover.create({
        data: {
          dayOfWeek: churchNow.dayOfWeek,
          date: churchNow.dateStr,
          authorName,
          message,
          verse,
        },
      });

      // Calcular o próximo dia da semana (0 a 6)
      const nextDayOfWeek = (churchNow.dayOfWeek + 1) % 7;
      const nextDayName = DAY_NAMES[nextDayOfWeek];

      // Buscar os intercessores do próximo dia da semana que possuem e-mail
      const nextSentinels = await prisma.prayerSentinel.findMany({
        where: { dayOfWeek: nextDayOfWeek, active: true, cancelledAt: null, email: { not: null } },
        select: { email: true, name: true },
      });

      // Disparar e-mail fraterno aos intercessores do próximo dia
      const resend = getResend();
      const appUrl = process.env.APP_URL || 'https://ibopvh.com.br';

      const validEmails = nextSentinels.map((s) => s.email).filter(Boolean) as string[];

      if (resend && validEmails.length > 0) {
        try {
          await resend.emails.send({
            from: 'Relógio de Oração IBO <contato@ibopvh.com.br>',
            to: validEmails,
            subject: `Escala de Intercessão: ${nextDayName} — Igreja Batista Olaria`,
            html: `
              <div style="font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 16px; overflow: hidden; border: 1px solid rgba(245, 158, 11, 0.2);">
                <div style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #f59e0b;">
                  <span style="color: #f59e0b; text-transform: uppercase; letter-spacing: 3px; font-size: 11px; font-weight: bold;">Comunhão dos Intercessores</span>
                  <h1 style="color: #ffffff; font-family: 'Cinzel', Georgia, serif; font-size: 22px; margin: 10px 0 4px 0;">Escala de Oração — ${nextDayName}</h1>
                  <p style="color: #a8a29e; font-size: 14px; margin: 0;">"Com toda oração e súplica, orando em todo tempo..." — Ef 6:18</p>
                </div>
                <div style="padding: 28px; line-height: 1.6;">
                  <p style="font-size: 15px; margin-top: 0;">Irmãos da escala de <strong>${nextDayName}</strong>,</p>
                  <p>O irmão <strong>${escapeHtml(authorName)}</strong> concluiu seus momentos de oração hoje e compartilhou a seguinte saudação fraterna:</p>
                  <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 18px; border-radius: 8px; margin: 20px 0;">
                    <p style="font-style: italic; color: #f5f5f4; font-size: 15px; margin: 0;">"${escapeHtml(message || 'Intercedemos com alegria e gratidão pelo rebanho e pela proclamação do Evangelho. Que o Senhor fortaleça a escala de amanhã!')}"</p>
                    ${verse ? `<p style="color: #f59e0b; font-size: 13px; font-weight: bold; margin: 10px 0 0 0;">— ${escapeHtml(verse)}</p>` : ''}
                  </div>
                  <p style="font-size: 14px; color: #d6d3d1;">Acesse o portal da igreja para consultar os <strong>Motivos de Oração da Semana</strong> e permanecer perseverante em súplicas e ações de graças.</p>
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${appUrl}/relogio" style="display: inline-block; background: #f59e0b; color: #1c1917; font-weight: bold; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 15px;">Acessar Guia de Oração</a>
                  </div>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Erro ao enviar e-mail de transmissão fraterna:', emailErr);
        }
      }

      res.status(201).json({
        success: true,
        handover,
        nextDayOfWeek,
        nextDayName,
        notifiedSentinelsCount: validEmails.length,
      });
    } catch (error) {
      console.error('Erro ao registrar transmissão de oração:', error);
      res.status(500).json({ error: 'Falha ao registrar oração' });
    }
  });

  // 5. Obter o estado atual da intercessão (hoje)
  router.get('/bastao-atual', async (_req, res) => {
    try {
      const churchNow = getChurchCurrentInfo();

      const [todaySentinels, todayHandovers, recentHandovers] = await Promise.all([
        prisma.prayerSentinel.findMany({
          where: { dayOfWeek: churchNow.dayOfWeek, active: true, cancelledAt: null },
          select: { id: true, name: true },
        }),
        prisma.prayerHandover.findMany({
          where: { date: churchNow.dateStr },
          orderBy: { completedAt: 'desc' },
        }),
        prisma.prayerHandover.findMany({
          orderBy: { completedAt: 'desc' },
          take: 6,
        }),
      ]);

      res.json({
        today: {
          dayOfWeek: churchNow.dayOfWeek,
          dayName: DAY_NAMES[churchNow.dayOfWeek],
          dateStr: churchNow.dateStr,
          formattedDate: churchNow.formattedDate,
          sentinels: todaySentinels.map((s) => ({ id: s.id, name: s.name.split(' ')[0] || s.name })),
          handovers: todayHandovers,
          isCompleted: todayHandovers.length > 0,
        },
        recentHandovers,
      });
    } catch (error) {
      console.error('Erro ao buscar estado da intercessão:', error);
      res.status(500).json({ error: 'Falha ao carregar estado de hoje' });
    }
  });

  // 6. Motivos de Oração da Semana
  router.get('/motivos', async (_req, res) => {
    try {
      const topics = await prisma.prayerTopic.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      });
      res.json(topics);
    } catch (error) {
      console.error('Erro ao buscar motivos de oração:', error);
      res.status(500).json({ error: 'Falha ao carregar motivos de oração' });
    }
  });

  // 7. Registrar clique em "Intercedi por este motivo"
  router.post('/motivos/:id/orar', async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID do motivo inválido' });
    }

    const rateLimit = await consumeRateLimit(prisma, req, {
      scope: `pray-topic:${id}`,
      limit: 10,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Intercessão já registrada. Obrigado por suas orações!' });
    }

    try {
      const topic = await prisma.prayerTopic.update({
        where: { id },
        data: { prayedCount: { increment: 1 } },
        select: { id: true, prayedCount: true },
      });
      res.json({ success: true, prayedCount: topic.prayedCount });
    } catch (error) {
      console.error('Erro ao incrementar oração do motivo:', error);
      res.status(500).json({ error: 'Falha ao registrar oração' });
    }
  });

  // 8. Mural de Ações de Graças / Testemunhos
  router.get('/testemunhos', async (_req, res) => {
    try {
      const praises = await prisma.prayerPraise.findMany({
        where: { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        take: 20,
      });
      res.json(praises);
    } catch (error) {
      console.error('Erro ao buscar testemunhos:', error);
      res.status(500).json({ error: 'Falha ao carregar testemunhos' });
    }
  });

  return router;
}
