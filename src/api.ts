import express from "express";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import ical, { ICalAlarmType } from "ical-generator";
import crypto from "crypto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import "dayjs/locale/pt-br.js";
import { createVeredasRouter } from "./api/veredas/router.js";
import { createAdminAuthRouter } from "./api/admin/auth.js";
import { createAdminModulesRouter, createPublicModulesRouter, isModulePublicOperationOpen } from "./api/admin/modules.js";
import { createEditorialSeriesRouter } from "./api/editorial.js";
import { createAdminSeriesRouter } from "./api/admin/series.js";
import { createAdminSeriesEmailRouter } from "./api/admin/seriesEmail.js";
import { createAdminPrayerRouter } from "./api/admin/prayer.js";
import { createAdminEbfRouter } from "./api/admin/ebf.js";
import { createAdminUsersRouter } from "./api/admin/users.js";
import { createAdminHomeBannersRouter, createPublicHomeBannersRouter } from "./api/admin/homeBanners.js";
import { createPublicEbfRouter } from "./api/public/ebf.js";
import { createPublicParousiaRouter } from "./api/public/parousia.js";
import { consumeRateLimit } from "./lib/server/rateLimit.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "America/Porto_Velho";
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

let prismaClient: PrismaClient | null = null;

function getPrisma() {
  if (!prismaClient) {
    try {
      prismaClient = new PrismaClient();
    } catch (error) {
      console.error("Failed to initialize Prisma Client:", error);
      throw error;
    }
  }
  return prismaClient;
}

const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const client = getPrisma();
    return (client as any)[prop];
  }
});

let resendClient: Resend | null = null;
function getResend() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      resendClient = new Resend(apiKey);
    }
  }
  return resendClient;
}

export const apiRouter = express.Router();
apiRouter.use("/admin/auth", createAdminAuthRouter(prisma));
apiRouter.use("/admin/modules", createAdminModulesRouter(prisma));
apiRouter.use("/admin/series", createAdminSeriesRouter(prisma));
apiRouter.use("/admin/series-email", createAdminSeriesEmailRouter(prisma));
apiRouter.use("/admin/prayer", createAdminPrayerRouter(prisma));
apiRouter.use("/admin/ebf", createAdminEbfRouter(prisma));
apiRouter.use("/admin/users", createAdminUsersRouter(prisma));
apiRouter.use("/admin/home-banners", createAdminHomeBannersRouter(prisma));
apiRouter.use("/ebf", createPublicEbfRouter(prisma, getResend));
apiRouter.use("/parousia", createPublicParousiaRouter(prisma, getResend));
apiRouter.use("/modules", createPublicModulesRouter(prisma));
apiRouter.use("/home-banners", createPublicHomeBannersRouter(prisma));
apiRouter.use("/series", createEditorialSeriesRouter(prisma));

export async function seed() {
  console.log("Starting database seeding check...");
  try {
    const themesCount = await prisma.prayerTheme.count();
    console.log(`Current prayer themes count: ${themesCount}`);
    if (themesCount === 0) {
      console.log("No themes found, creating default themes...");
      const defaultThemes = [
        { label: 'Missões e Evangelismo', order: 1 },
        { label: 'Famílias da Congregação', order: 2 },
        { label: 'Autoridades e Governo', order: 3 },
        { label: 'Enfermos e Enlutados', order: 4 },
        { label: 'Avivamento e Crescimento', order: 5 },
        { label: 'Liderança Pastoral', order: 6 },
      ];
      for (const theme of defaultThemes) {
        await prisma.prayerTheme.create({ data: { ...theme, active: true } });
      }
      console.log("Default themes created successfully.");
    }

    const capacityConfig = await prisma.config.findUnique({ where: { key: 'slot_capacity' } });
    if (!capacityConfig) {
      console.log("No capacity config found, creating default...");
      await prisma.config.create({ data: { key: 'slot_capacity', value: '4' } });
      console.log("Default capacity config created.");
    }
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}

// API Routes
apiRouter.use("/veredas", createVeredasRouter(prisma));

apiRouter.get("/youtube-proxy", async (req, res) => {
  const channelId = req.query.channelId;
  if (!channelId) {
    return res.status(400).json({ error: "channelId is required" });
  }
  try {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: `YouTube RSS returned ${response.status}` });
    }
    const xml = await response.text();
    res.set("Content-Type", "text/xml");
    res.send(xml);
  } catch (error) {
    console.error("YouTube Proxy Error:", error);
    res.status(500).json({ error: "Failed to fetch YouTube RSS" });
  }
});

apiRouter.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Get slots for a specific date
apiRouter.get("/relogio/slots", async (req, res) => {
  const { date } = req.query;
  if (!date || typeof date !== "string") {
    return res.status(400).json({ error: "Date is required" });
  }

  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        date,
        cancelledAt: null,
      },
      select: {
        id: true,
        timeStart: true,
        name: true,
      },
    });

    // Group by timeStart
    const slots: Record<string, string[]> = {};
    reservations.forEach((r) => {
      if (!slots[r.timeStart]) {
        slots[r.timeStart] = [];
      }
      slots[r.timeStart].push(r.name.split(" ")[0]); // Only first name
    });

    res.json(slots);
  } catch (error) {
    console.error("Error fetching slots:", error);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
});

// Create a reservation
apiRouter.post("/relogio/reserve", async (req, res) => {
  const rateLimit = await consumeRateLimit(prisma, req, { scope: 'prayer-reservation', limit: 12, windowMs: 60 * 60 * 1000 });
  if (!rateLimit.allowed) { res.setHeader('Retry-After', rateLimit.retryAfterSeconds); return res.status(429).json({ error: 'Limite de reservas atingido. Tente novamente mais tarde.' }); }
  if (!(await isModulePublicOperationOpen(prisma, "relogio"))) {
    return res.status(410).json({ error: "As reservas do Relógio de Oração estão fechadas neste momento." });
  }
  const { date, timeStart, timeEnd, name, email, prayerThemes, personalRequest, repeatDays = 1 } = req.body;

  if (!date || !timeStart || !timeEnd || !name || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const numDays = Math.min(Math.max(1, parseInt(repeatDays)), 7);

  try {
    // Check if the first slot is in the past
    const now = dayjs().tz(TZ);
    const firstSlotDate = dayjs.tz(`${date} ${timeStart}`, "YYYY-MM-DD HH:mm", TZ);
    
    if (firstSlotDate.isBefore(now)) {
      return res.status(400).json({ error: "Não é possível reservar um horário que já passou." });
    }

    const startDate = dayjs.tz(date, TZ);
    const datesToReserve: string[] = [];

    for (let i = 0; i < numDays; i++) {
      const current = startDate.add(i, 'day');
      datesToReserve.push(current.format("YYYY-MM-DD"));
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const reservations = await prisma.$transaction(async (tx) => {
      const capacityConfig = await tx.config.findUnique({ where: { key: "slot_capacity" } });
      const parsedCapacity = Number.parseInt(capacityConfig?.value || "4", 10);
      const capacity = Number.isInteger(parsedCapacity) && parsedCapacity > 0 ? parsedCapacity : 4;

      // Serialize reservations for each date/time slot. The transaction-level
      // advisory lock prevents concurrent requests from accepting the same last vacancy.
      for (const currentDate of datesToReserve) {
        const lockKey = `prayer-slot:${currentDate}:${timeStart}`;
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

        const [existingCount, duplicate] = await Promise.all([
          tx.reservation.count({ where: { date: currentDate, timeStart, cancelledAt: null } }),
          tx.reservation.findFirst({ where: { date: currentDate, timeStart, email: normalizedEmail, cancelledAt: null }, select: { id: true } }),
        ]);

        if (existingCount >= capacity) {
          throw new Error(`SLOT_FULL:${currentDate}`);
        }
        if (duplicate) {
          throw new Error(`DUPLICATE_SLOT:${currentDate}`);
        }
      }

      const created = [];
      for (const currentDate of datesToReserve) {
        created.push(await tx.reservation.create({
          data: {
            date: currentDate,
            timeStart,
            timeEnd,
            name: String(name).trim(),
            email: normalizedEmail,
            prayerThemes: JSON.stringify(prayerThemes || []),
            personalRequest,
            cancelToken: crypto.randomBytes(32).toString("hex"),
          },
        }));
      }
      return created;
    }).catch((transactionError) => {
      const message = transactionError instanceof Error ? transactionError.message : '';
      const [code, failedDate] = message.split(':');
      if (code === 'SLOT_FULL') {
        throw Object.assign(new Error(`O horário ${timeStart} está lotado no dia ${dayjs(failedDate).format('DD/MM/YYYY')}.`), { statusCode: 409 });
      }
      if (code === 'DUPLICATE_SLOT') {
        throw Object.assign(new Error(`Você já reservou o horário ${timeStart} no dia ${dayjs(failedDate).format('DD/MM/YYYY')}.`), { statusCode: 409 });
      }
      throw transactionError;
    });

    // Send email for the first one (or a summary)
    const resend = getResend();
    if (resend && reservations.length > 0) {
      try {
        const calendar = ical({ 
          name: "Relógio de Oração IBO"
        });

        // Get encouragement word from config
        const encouragementConfig = await prisma.config.findUnique({ where: { key: "email_encouragement" } });
        const encouragementWord = encouragementConfig?.value || `"A oração eficaz do justo pode muito." — Tiago 5.16b\n\nVocê está prestes a fazer algo de valor eterno.\nQuando você se separar esse momento para oração às ${timeStart}, saiba que não está só — a igreja toda estará representada na sua oração.\n\nOre com fé. Ore com perseverança. Ore com expectativa.`;
        
        reservations.forEach(r => {
          // Use floating time to ensure the hour selected is the hour shown in the calendar
          // regardless of timezone settings. This avoids the "4 hours ahead" issue
          // caused by incorrect UTC conversion in some calendar apps.
          const sDate = dayjs.utc(`${r.date} ${r.timeStart}`, "YYYY-MM-DD HH:mm");
          const eDate = dayjs.utc(`${r.date} ${r.timeEnd}`, "YYYY-MM-DD HH:mm");

          calendar.createEvent({
            start: sDate.toDate(),
            end: eDate.toDate(),
            floating: true,
            summary: `Oração — Igreja Batista Olaria · ${r.timeStart}`,
            description: encouragementWord.substring(0, 100) + "...",
            location: "Onde você estiver",
            alarms: [{ type: ICalAlarmType.display, trigger: 900 }],
          });
        });

        const dateRange = numDays > 1 
          ? `${dayjs(datesToReserve[0]).format('DD/MM/YYYY')} até ${dayjs(datesToReserve[numDays-1]).format('DD/MM/YYYY')}`
          : dayjs(datesToReserve[0]).format('DD/MM/YYYY');

        const baseUrl = process.env.APP_URL || "http://localhost:3000";
        
        const cancelLinksHtml = reservations.map(r => {
          const dateFormatted = dayjs(r.date).format('DD/MM/YYYY');
          return `<li>${dateFormatted}: <a href="${baseUrl}/api/relogio/cancel?token=${r.cancelToken}">Cancelar este dia</a></li>`;
        }).join("");

        // Get others in the same slot
        const othersCount = reservations.length > 0 ? await prisma.reservation.count({
          where: {
            date: reservations[0].date,
            timeStart,
            cancelledAt: null,
            NOT: { email }
          }
        }) : 0;

        const formattedDate = dayjs.tz(reservations[0].date, TZ).locale('pt-br').format('dddd, D [de] MMMM [de] YYYY');
        const diaDaSemana = dayjs.tz(reservations[0].date, TZ).locale('pt-br').format('dddd');

        const themesHtml = (prayerThemes || []).map((t: string) => `<li>✦ <strong>${escapeHtml(t)}</strong></li>`).join("");
        
        const personalRequestHtml = personalRequest ? `
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3 style="color: #111; font-size: 16px; margin-bottom: 10px;">💬 SEU PEDIDO PESSOAL</h3>
            <p style="font-style: italic; color: #555;">"${escapeHtml(personalRequest)}"</p>
            <p style="font-size: 14px; color: #666;">Que o Senhor ouça e responda segundo a Sua perfeita vontade.</p>
          </div>
        ` : "";

        await resend.emails.send({
          from: "IBO Relógio <contato@ibopvh.com.br>",
          to: email,
          subject: `✝️ Seu horário de oração está confirmado — Igreja Batista Olaria`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; background-color: #fff;">
              <div style="background-color: #f59e0b; padding: 40px 20px; text-align: center;">
                <h1 style="color: #000; margin: 0; font-size: 28px; font-family: Georgia, serif;">Igreja Batista Olaria</h1>
                <p style="color: #000; margin: 10px 0 0; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 12px;">Relógio de Oração</p>
              </div>
              
              <div style="padding: 40px 30px; line-height: 1.6;">
                <p style="font-size: 18px; margin-bottom: 20px;">Querido(a) <strong>${escapeHtml(name.split(" ")[0])}</strong>,</p>
                
                <p style="font-style: italic; color: #666; margin-bottom: 20px;">"Não cessamos de orar por vós." — Colossenses 1.9</p>
                
                <p>Seu compromisso de oração foi registrado. A Igreja Batista Olaria agradece a sua dedicação.</p>
                
                <div style="margin-top: 40px; border-top: 2px solid #f59e0b; padding-top: 20px;">
                  <h3 style="color: #111; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">📅 SEU HORÁRIO DE ORAÇÃO</h3>
                  <p style="margin: 5px 0;"><strong>Data:</strong> ${formattedDate}</p>
                  <p style="margin: 5px 0;"><strong>Horário:</strong> ${timeStart} às ${timeEnd}</p>
                  <p style="margin: 5px 0;"><strong>Dia da semana:</strong> ${diaDaSemana}</p>
                  
                  <p style="margin-top: 15px; font-size: 14px; color: #555;">
                    Você não estará sozinho(a) neste horário. 
                    ${othersCount > 0 
                      ? `Outros <strong>${othersCount}</strong> irmão(s) também assumiram este mesmo momento diante de Deus.` 
                      : `A igreja toda estará representada no seu clamor.`}
                  </p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <h3 style="color: #111; font-size: 16px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px;">🙏 SUA PAUTA DE ORAÇÃO</h3>
                  <p style="font-size: 14px; margin-bottom: 10px;">Estes são os temas que você escolheu interceder neste horário:</p>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    ${themesHtml}
                  </ul>
                </div>

                ${personalRequestHtml}

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                  <h3 style="color: #111; font-size: 16px; margin-bottom: 10px;">⏰ LEMBRETE AUTOMÁTICO</h3>
                  <p style="font-size: 14px; color: #666;">
                    Você receberá um lembrete <strong>15 minutos antes</strong> do seu horário.
                    O arquivo de agenda (ICS) está anexo a este e-mail — adicione ao seu calendário para não esquecer.
                  </p>
                </div>

                <div style="margin-top: 30px; padding: 25px; background-color: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7;">
                  <h3 style="color: #92400e; font-size: 16px; margin-top: 0; margin-bottom: 10px;">📖 PALAVRA DE ENCORAJAMENTO</h3>
                  <div style="white-space: pre-wrap; color: #92400e; font-size: 15px;">${escapeHtml(encouragementWord)}</div>
                </div>

                <div style="margin-top: 40px; text-align: center; border-top: 1px solid #eee; padding-top: 30px;">
                  <p style="margin: 0; color: #111; font-weight: bold;">Em Cristo e com gratidão,</p>
                  <p style="margin: 5px 0; color: #f59e0b; font-weight: bold; font-size: 18px;">Pr. Vulmar Junior</p>
                  <p style="margin: 0; font-size: 14px; color: #666;">Igreja Batista Olaria</p>
                  <p style="margin: 0; font-size: 12px; color: #999;">Porto Velho — Rondônia</p>
                  <p style="margin: 10px 0 0;"><a href="https://www.ibopvh.com.br" style="color: #f59e0b; text-decoration: none; font-size: 14px;">www.ibopvh.com.br</a></p>
                </div>
              </div>
              
              <div style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Precisa cancelar este horário?</p>
                <div style="font-size: 12px; color: #666;">
                  <ul style="list-style: none; padding: 0; margin: 0; display: inline-block; text-align: left;">
                    ${cancelLinksHtml}
                  </ul>
                </div>
                <p style="font-size: 11px; color: #999; margin-top: 20px;">Este é um e-mail automático. Por favor, não responda a esta mensagem.</p>
              </div>
            </div>
          `,
          attachments: [
            {
              filename: "oracao.ics",
              content: Buffer.from(calendar.toString()),
            },
          ],
        });
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }
    }

    res.json({ success: true, count: reservations.length });
  } catch (error) {
    const statusCode = typeof (error as { statusCode?: unknown })?.statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : 500;
    if (statusCode !== 500) return res.status(statusCode).json({ error: (error as Error).message });
    console.error("Error creating reservation:", error);
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

// Cancel reservation
apiRouter.get("/relogio/cancel", async (req, res) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    return res.status(400).send("Token inválido.");
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { cancelToken: token },
    });

    if (!reservation || reservation.cancelledAt) {
      return res.status(400).send("Reserva não encontrada ou já cancelada.");
    }

    await prisma.reservation.update({
      where: { cancelToken: token },
      data: { cancelledAt: new Date() },
    });

    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
          <h1>Reserva Cancelada</h1>
          <p>Seu horário de oração foi liberado com sucesso.</p>
          <a href="/">Voltar ao site</a>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).send("Erro ao cancelar reserva.");
  }
});

// Stats
apiRouter.get("/relogio/stats", async (req, res) => {
  try {
    // Get current time in Porto Velho (Church's timezone)
    const now = new Date();
    const churchTimeStr = now.toLocaleString("en-US", { timeZone: "America/Porto_Velho" });
    const churchTime = new Date(churchTimeStr);
    
    const currentHour = churchTime.getHours().toString().padStart(2, "0") + ":00";
    const year = churchTime.getFullYear();
    const month = (churchTime.getMonth() + 1).toString().padStart(2, "0");
    const day = churchTime.getDate().toString().padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    // 1. Current Intercessors
    const currentIntercessors = await prisma.reservation.findMany({
      where: { date: today, timeStart: currentHour, cancelledAt: null },
      select: { name: true },
    });

    // 2. Daily Coverage (Slots with at least 1 person)
    const todayReservations = await prisma.reservation.findMany({
      where: { date: today, cancelledAt: null },
      select: { timeStart: true },
    });
    
    const slotsCovered = new Set(todayReservations.map(r => r.timeStart));
    const dailyCoverageCount = slotsCovered.size;

    // 3. Full Coverage (Slots with 4/4)
    const slotCounts: Record<string, number> = {};
    todayReservations.forEach(r => {
      slotCounts[r.timeStart] = (slotCounts[r.timeStart] || 0) + 1;
    });
    const capacityConfig = await prisma.config.findUnique({ where: { key: "slot_capacity" } });
    const capacity = parseInt(capacityConfig?.value || "4");
    const fullCoverageCount = Object.values(slotCounts).filter(count => count >= capacity).length;

    // 4. Next Empty Slot
    let nextEmptySlot = null;
    const currentHourInt = churchTime.getHours();
    for (let i = 1; i <= 24; i++) {
      const checkHour = ((currentHourInt + i) % 24).toString().padStart(2, "0") + ":00";
      if (!slotsCovered.has(checkHour)) {
        nextEmptySlot = checkHour;
        break;
      }
    }

    // 5. Monthly Stats
    const firstDayOfMonth = `${year}-${month}-01`;
    const monthlyReservations = await prisma.reservation.findMany({
      where: { date: { gte: firstDayOfMonth }, cancelledAt: null },
      select: { email: true, date: true, timeStart: true }
    });
    
    const uniqueIntercessorsMonth = new Set(monthlyReservations.map(r => r.email)).size;
    
    // Calculate unique clock hours for the month
    const monthlyUniqueSlots = new Set(monthlyReservations.map(r => `${r.date}_${r.timeStart}`));
    const totalHoursMonth = monthlyUniqueSlots.size;

    // 6. Historical Stats
    // Count unique (date, timeStart) pairs across all time
    const historicalUniqueSlots = await prisma.reservation.groupBy({
      by: ['date', 'timeStart'],
      where: { cancelledAt: null },
    });
    const totalHoursHistory = historicalUniqueSlots.length;

    // 7. Timeline Data (all 24 hours)
    const timeline = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, "0") + ":00";
      return {
        hour,
        count: slotCounts[hour] || 0,
        isFull: (slotCounts[hour] || 0) >= capacity
      };
    });

    res.json({
      currentHour,
      currentIntercessors: currentIntercessors.map((i) => i.name.split(" ")[0]),
      dailyCoverage: dailyCoverageCount,
      fullCoverage: fullCoverageCount,
      nextEmptySlot,
      uniqueIntercessorsMonth,
      totalHoursMonth,
      totalHoursHistory,
      timeline,
      capacity
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Public: Get active prayer themes
apiRouter.get("/relogio/themes", async (req, res) => {
  try {
    const themes = await prisma.prayerTheme.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar temas" });
  }
});

apiRouter.use((_req, res) => res.status(404).json({ error: "Endpoint não encontrado" }));
