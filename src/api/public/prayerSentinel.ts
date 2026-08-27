import express from 'express';
import type { PrismaClient } from '@prisma/client';
import type { Resend } from 'resend';
import crypto from 'crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import 'dayjs/locale/pt-br.js';
import { consumeRateLimit } from '../../lib/server/rateLimit.js';
import { isModulePublicOperationOpen } from '../admin/modules.js';

dayjs.extend(utc);
dayjs.extend(timezone);

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

export function createPublicPrayerSentinelRouter(
  prisma: PrismaClient,
  getResend: () => Resend | null
) {
  const router = express.Router();

  // Helper para obter o dia do mês atual no fuso de Porto Velho
  const getChurchCurrentDay = () => {
    const now = dayjs().tz(TZ);
    return {
      dayOfMonth: now.date(),
      dateStr: now.format('YYYY-MM-DD'),
      formattedDate: now.locale('pt-br').format('DD [de] MMMM'),
    };
  };

  // 1. Obter a grade completa dos 31 dias do mês com sentinelas
  router.get('/mes', async (_req, res) => {
    try {
      const [sentinels, capacityConfig, handoversToday] = await Promise.all([
        prisma.prayerSentinel.findMany({
          where: { active: true, cancelledAt: null },
          select: {
            id: true,
            dayOfMonth: true,
            name: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
        prisma.config.findUnique({ where: { key: 'sentinel_capacity' } }),
        (async () => {
          const { dateStr } = getChurchCurrentDay();
          return prisma.prayerHandover.findMany({
            where: { date: dateStr },
            select: { id: true, authorName: true, completedAt: true },
          });
        })(),
      ]);

      const parsedCapacity = Number.parseInt(capacityConfig?.value || '4', 10);
      const capacity = Number.isInteger(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : 4;

      // Agrupar sentinelas por dia (1 a 31)
      const daysMap: Record<
        number,
        {
          sentinels: { id: number; name: string }[];
          count: number;
          isFull: boolean;
        }
      > = {};

      for (let d = 1; d <= 31; d++) {
        daysMap[d] = {
          sentinels: [],
          count: 0,
          isFull: false,
        };
      }

      sentinels.forEach((s) => {
        if (daysMap[s.dayOfMonth]) {
          // Apenas primeiro nome ou nome curto para privacidade na visão pública
          const firstName = s.name.split(' ')[0] || s.name;
          daysMap[s.dayOfMonth].sentinels.push({ id: s.id, name: firstName });
          daysMap[s.dayOfMonth].count++;
        }
      });

      for (let d = 1; d <= 31; d++) {
        daysMap[d].isFull = daysMap[d].count >= capacity;
      }

      const churchNow = getChurchCurrentDay();

      // Estatísticas gerais do mês
      const totalSentinels = sentinels.length;
      const coveredDaysCount = Object.values(daysMap).filter((d) => d.count > 0).length;

      res.json({
        days: daysMap,
        capacity,
        currentDayOfMonth: churchNow.dayOfMonth,
        currentDateStr: churchNow.dateStr,
        totalSentinels,
        coveredDaysCount,
        todayHandoversCount: handoversToday.length,
      });
    } catch (error) {
      console.error('Erro ao buscar dados do mês dos sentinelas:', error);
      res.status(500).json({ error: 'Falha ao carregar grade de sentinelas' });
    }
  });

  // 2. Inscrever-se como sentinela em um dia do mês
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

    const dayOfMonth = Number.parseInt(String(req.body?.dayOfMonth), 10);
    const name = String(req.body?.name ?? '').trim();
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const phone = typeof req.body?.phone === 'string' ? req.body.phone.trim() : null;

    if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
      return res.status(400).json({ error: 'Dia do mês inválido (deve ser entre 1 e 31).' });
    }
    if (name.length < 2 || name.length > 120) {
      return res.status(400).json({ error: 'Por favor, informe seu nome completo.' });
    }
    if (!email.includes('@') || email.length > 254) {
      return res.status(400).json({ error: 'Por favor, informe um e-mail válido.' });
    }

    try {
      const cancelToken = crypto.randomBytes(32).toString('hex');

      const sentinel = await prisma.$transaction(async (tx) => {
        const capacityConfig = await tx.config.findUnique({ where: { key: 'sentinel_capacity' } });
        const parsedCapacity = Number.parseInt(capacityConfig?.value || '4', 10);
        const capacity = Number.isInteger(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : 4;

        // Verificar vagas no dia
        const existingCount = await tx.prayerSentinel.count({
          where: { dayOfMonth, active: true, cancelledAt: null },
        });

        if (existingCount >= capacity) {
          throw Object.assign(new Error(`O Dia ${dayOfMonth} já atingiu a capacidade máxima de sentinelas.`), { statusCode: 409 });
        }

        // Verificar duplicata (mesmo email no mesmo dia)
        const duplicate = await tx.prayerSentinel.findFirst({
          where: { dayOfMonth, email, active: true, cancelledAt: null },
        });
        if (duplicate) {
          throw Object.assign(new Error(`Você já está cadastrado(a) como sentinela no Dia ${dayOfMonth}.`), { statusCode: 400 });
        }

        return tx.prayerSentinel.create({
          data: {
            dayOfMonth,
            name,
            email,
            phone,
            cancelToken,
            active: true,
          },
        });
      });

      // Envio de e-mail de confirmação via Resend (não bloqueia resposta em caso de falha)
      const resend = getResend();
      const appUrl = process.env.APP_URL || 'https://ibopvh.com.br';
      const cancelUrl = `${appUrl}/relogio?cancelToken=${cancelToken}`;

      if (resend) {
        try {
          await resend.emails.send({
            from: 'Relógio de Oração IBO <contato@ibopvh.com.br>',
            to: [email],
            subject: `🛡️ Você agora é Sentinela do Dia ${dayOfMonth} — Relógio de Oração IBO`,
            html: `
              <div style="font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 16px; overflow: hidden; border: 1px solid rgba(245, 158, 11, 0.2);">
                <div style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 36px 28px; text-align: center; border-bottom: 2px solid #f59e0b;">
                  <span style="color: #f59e0b; text-transform: uppercase; letter-spacing: 3px; font-size: 11px; font-weight: bold;">Igreja Batista Olaria</span>
                  <h1 style="color: #ffffff; font-family: 'Cinzel', Georgia, serif; font-size: 26px; margin: 12px 0 6px 0;">Posto de Sentinela Confirmado</h1>
                  <p style="color: #a8a29e; font-size: 15px; margin: 0;">"Sobre os teus muros, pus guardas..." — Isaías 62:6</p>
                </div>
                <div style="padding: 28px; line-height: 1.6;">
                  <p style="font-size: 16px; margin-top: 0;">Olá, <strong>${escapeHtml(name)}</strong>!</p>
                  <p>Seu compromisso na vigília contínua da IBO foi registrado com sucesso.</p>
                  <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 18px; border-radius: 8px; margin: 24px 0;">
                    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #f59e0b; font-weight: bold;">Seu Dia de Vigília</div>
                    <div style="font-size: 24px; font-weight: bold; color: #ffffff; margin-top: 4px;">Todo Dia ${dayOfMonth} de cada mês</div>
                    <p style="font-size: 13px; color: #a8a29e; margin: 6px 0 0 0;">Ao longo deste dia, em seus momentos devocionais, sustente a nossa igreja, nossos missionários e as famílias da congregação em oração.</p>
                  </div>
                  <p style="font-size: 14px; color: #d6d3d1;">No seu dia de oração, acesse a página do Relógio para ver os <strong>Motivos da Semana</strong> e registrar o cumprimento da sua guarda passando o bastão para os próximos sentinelas.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${appUrl}/relogio" style="display: inline-block; background: #f59e0b; color: #1c1917; font-weight: bold; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 15px; letter-spacing: 0.5px;">Acessar o Relógio de Oração</a>
                  </div>
                  <hr style="border: none; border-top: 1px solid #292524; margin: 24px 0;" />
                  <p style="font-size: 12px; color: #78716c; text-align: center;">Caso precise cancelar seu compromisso no futuro, <a href="${cancelUrl}" style="color: #f59e0b; text-decoration: underline;">clique aqui para cancelar</a>.</p>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Erro ao enviar e-mail de confirmação de sentinela:', emailErr);
        }
      }

      res.status(201).json({
        success: true,
        sentinel: {
          id: sentinel.id,
          dayOfMonth: sentinel.dayOfMonth,
          name: sentinel.name,
        },
      });
    } catch (error: any) {
      console.error('Erro na inscrição de sentinela:', error);
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

      res.json({ success: true, message: 'Seu compromisso de sentinela foi cancelado com sucesso.' });
    } catch (error) {
      console.error('Erro ao cancelar sentinela:', error);
      res.status(500).json({ error: 'Falha ao processar cancelamento' });
    }
  });

  // 4. Passar o Bastão / Registrar cumprimento da vigília de hoje
  router.post('/passar-bastao', async (req, res) => {
    const rateLimit = await consumeRateLimit(prisma, req, {
      scope: 'sentinel-handover',
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!rateLimit.allowed) {
      res.setHeader('Retry-After', rateLimit.retryAfterSeconds);
      return res.status(429).json({ error: 'Você acabou de registrar uma passagem de guarda. Aguarde um momento.' });
    }

    const churchNow = getChurchCurrentDay();
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
          dayOfMonth: churchNow.dayOfMonth,
          date: churchNow.dateStr,
          authorName,
          message,
          verse,
        },
      });

      // Calcular o próximo dia (1 a 31)
      const nextDay = churchNow.dayOfMonth === 31 ? 1 : churchNow.dayOfMonth + 1;

      // Buscar os sentinelas do próximo dia para notificação
      const nextSentinels = await prisma.prayerSentinel.findMany({
        where: { dayOfMonth: nextDay, active: true, cancelledAt: null },
        select: { email: true, name: true },
      });

      // Disparar e-mail de transmissão de guarda aos sentinelas do próximo dia
      const resend = getResend();
      const appUrl = process.env.APP_URL || 'https://ibopvh.com.br';

      if (resend && nextSentinels.length > 0) {
        const nextEmails = nextSentinels.map((s) => s.email);
        try {
          await resend.emails.send({
            from: 'Relógio de Oração IBO <contato@ibopvh.com.br>',
            to: nextEmails,
            subject: `🛡️ O Bastão da Vigília Chegou a Você — Sentinelas do Dia ${nextDay}`,
            html: `
              <div style="font-family: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #1c1917; color: #f5f5f4; border-radius: 16px; overflow: hidden; border: 1px solid rgba(245, 158, 11, 0.2);">
                <div style="background: linear-gradient(135deg, #1c1917 0%, #292524 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #f59e0b;">
                  <span style="color: #f59e0b; text-transform: uppercase; letter-spacing: 3px; font-size: 11px; font-weight: bold;">Troca de Sentinelas</span>
                  <h1 style="color: #ffffff; font-family: 'Cinzel', Georgia, serif; font-size: 24px; margin: 10px 0 4px 0;">O Bastão da Vigília está com Você</h1>
                  <p style="color: #a8a29e; font-size: 14px; margin: 0;">A guarda do Dia ${churchNow.dayOfMonth} foi sustentada com fé.</p>
                </div>
                <div style="padding: 28px; line-height: 1.6;">
                  <p style="font-size: 15px; margin-top: 0;">Irmãos sentinelas do <strong>Dia ${nextDay}</strong>,</p>
                  <p>O sentinela <strong>${escapeHtml(authorName)}</strong> cumpriu sua vigília no Dia ${churchNow.dayOfMonth} e transmitiu o bastão com a seguinte palavra para a sua guarda:</p>
                  <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 18px; border-radius: 8px; margin: 20px 0;">
                    <p style="font-style: italic; color: #f5f5f4; font-size: 15px; margin: 0;">"${escapeHtml(message || 'Oramos com gratidão pela nossa igreja e famílias. Sejam fortalecidos no Senhor!')}"</p>
                    ${verse ? `<p style="color: #f59e0b; font-size: 13px; font-weight: bold; margin: 10px 0 0 0;">— ${escapeHtml(verse)}</p>` : ''}
                  </div>
                  <p style="font-size: 14px; color: #d6d3d1;">Acesse o portal da igreja para consultar os <strong>Motivos de Oração da Semana</strong> e permanecer firme na brecha.</p>
                  <div style="text-align: center; margin: 28px 0;">
                    <a href="${appUrl}/relogio" style="display: inline-block; background: #f59e0b; color: #1c1917; font-weight: bold; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-size: 15px;">Acessar Motivos & Relatório</a>
                  </div>
                </div>
              </div>
            `,
          });
        } catch (emailErr) {
          console.error('Erro ao enviar e-mail de transmissão do bastão:', emailErr);
        }
      }

      res.status(201).json({
        success: true,
        handover,
        nextDay,
        notifiedSentinelsCount: nextSentinels.length,
      });
    } catch (error) {
      console.error('Erro ao passar o bastão:', error);
      res.status(500).json({ error: 'Falha ao registrar passagem do bastão' });
    }
  });

  // 5. Obter o estado atual da torre de guarda (hoje e ontem)
  router.get('/bastao-atual', async (_req, res) => {
    try {
      const churchNow = getChurchCurrentDay();
      const yesterdayDate = dayjs().tz(TZ).subtract(1, 'day').format('YYYY-MM-DD');

      const [todaySentinels, todayHandovers, recentHandovers] = await Promise.all([
        prisma.prayerSentinel.findMany({
          where: { dayOfMonth: churchNow.dayOfMonth, active: true, cancelledAt: null },
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
          dayOfMonth: churchNow.dayOfMonth,
          dateStr: churchNow.dateStr,
          formattedDate: churchNow.formattedDate,
          sentinels: todaySentinels.map((s) => ({ id: s.id, name: s.name.split(' ')[0] || s.name })),
          handovers: todayHandovers,
          isCompleted: todayHandovers.length > 0,
        },
        recentHandovers,
      });
    } catch (error) {
      console.error('Erro ao buscar bastão atual:', error);
      res.status(500).json({ error: 'Falha ao carregar estado da torre de guarda' });
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

  // 7. Registrar clique em "Já orei por este motivo"
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
      return res.status(429).json({ error: 'Obrigado por suas orações! Registrado com sucesso.' });
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

  // 8. Mural de Testemunhos / Orações Respondidas
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
