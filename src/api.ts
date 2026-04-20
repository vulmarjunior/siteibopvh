import express from "express";
import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import ical, { ICalAlarmType } from "ical-generator";
import crypto from "crypto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import "dayjs/locale/pt-br.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "America/Porto_Velho";

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
  res.json({ status: "ok", message: "Relógio de Oração API is running" });
});

apiRouter.get("/debug", async (req, res) => {
  try {
    await prisma.$connect();
    const themesCount = await prisma.prayerTheme.count();
    const maskUrl = (url?: string) => {
      if (!url) return "not set";
      try {
        const parsed = new URL(url);
        return `${parsed.protocol}//${parsed.username}:****@${parsed.host}${parsed.pathname}${parsed.search}`;
      } catch {
        return "invalid format";
      }
    };

    res.json({ 
      status: "connected", 
      themesCount,
      env: {
        dbUrl: maskUrl(process.env.DATABASE_URL),
        directUrl: maskUrl(process.env.DIRECT_URL),
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: "error", 
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  }
});

apiRouter.post("/admin/seed", async (req, res) => {
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  try {
    await seed();
    res.json({ success: true, message: "Database seeded successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
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

    // Check capacity for ALL requested days first
    const capacityConfig = await prisma.config.findUnique({ where: { key: "slot_capacity" } });
    const capacity = parseInt(capacityConfig?.value || "4");

    const startDate = dayjs.tz(date, TZ);
    const datesToReserve: string[] = [];

    for (let i = 0; i < numDays; i++) {
      const current = startDate.add(i, 'day');
      const currentStr = current.format("YYYY-MM-DD");
      
      const existingCount = await prisma.reservation.count({
        where: {
          date: currentStr,
          timeStart,
          cancelledAt: null,
        },
      });

      if (existingCount >= capacity) {
        return res.status(400).json({ 
          error: `O horário ${timeStart} está lotado no dia ${current.format('DD/MM/YYYY')}.` 
        });
      }

      // Check duplicate email for same slot on this day
      const duplicate = await prisma.reservation.findFirst({
        where: {
          date: currentStr,
          timeStart,
          email,
          cancelledAt: null,
        },
      });

      if (duplicate) {
        return res.status(400).json({ 
          error: `Você já reservou o horário ${timeStart} no dia ${current.format('DD/MM/YYYY')}.` 
        });
      }
      
      datesToReserve.push(currentStr);
    }

    // Create all reservations
    const reservations = [];
    for (const d of datesToReserve) {
      const cancelToken = crypto.randomBytes(32).toString("hex");
      const reservation = await prisma.reservation.create({
        data: {
          date: d,
          timeStart,
          timeEnd,
          name,
          email,
          prayerThemes: JSON.stringify(prayerThemes || []),
          personalRequest,
          cancelToken,
        },
      });
      reservations.push(reservation);
    }

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

        const themesHtml = (prayerThemes || []).map((t: string) => `<li>✦ <strong>${t}</strong></li>`).join("");
        
        const personalRequestHtml = personalRequest ? `
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <h3 style="color: #111; font-size: 16px; margin-bottom: 10px;">💬 SEU PEDIDO PESSOAL</h3>
            <p style="font-style: italic; color: #555;">"${personalRequest}"</p>
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
                <p style="font-size: 18px; margin-bottom: 20px;">Querido(a) <strong>${name.split(" ")[0]}</strong>,</p>
                
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
                  <div style="white-space: pre-wrap; color: #92400e; font-size: 15px;">${encouragementWord}</div>
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

// Admin: Get reservations
apiRouter.get("/admin/reservations", async (req, res) => {
  const { date, password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    const reservations = await prisma.reservation.findMany({
      where: {
        date: date as string,
        cancelledAt: null,
      },
      orderBy: { timeStart: "asc" },
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
});

// Admin: Update reservation
apiRouter.post("/admin/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, prayerThemes, personalRequest, password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        email, 
        prayerThemes: JSON.stringify(prayerThemes || []),
        personalRequest
      },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar reserva" });
  }
});

// Admin: Cancel reservation
apiRouter.post("/admin/cancel/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  try {
    console.log(`Admin attempting to delete reservation ID: ${id}`);
    await prisma.reservation.delete({
      where: { id: parseInt(id) },
    });
    console.log(`Reservation ID ${id} deleted successfully`);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ error: "Erro ao excluir reserva" });
  }
});

// Admin: Export CSV
apiRouter.get("/admin/export/csv", async (req, res) => {
  const { password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).send("Não autorizado");
  }

  try {
    const reservations = await prisma.reservation.findMany({
      where: { cancelledAt: null },
      orderBy: [{ date: "desc" }, { timeStart: "asc" }],
    });

    let csv = "ID,Data,Inicio,Fim,Nome,Email,Temas,ReservadoEm\n";
    reservations.forEach((r) => {
      csv += `${r.id},${r.date},${r.timeStart},${r.timeEnd},"${r.name}","${r.email}","${(r.prayerThemes || "").replace(/"/g, '""')}",${r.reservedAt.toISOString()}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=reservas_relogio.csv");
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).send("Erro ao exportar CSV");
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

// Admin: Get all config
apiRouter.get("/admin/config", async (req, res) => {
  const { password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  try {
    const configs = await prisma.config.findMany();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar configurações" });
  }
});

// Admin: Update config
apiRouter.post("/admin/config", async (req, res) => {
  const { key, value, password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  try {
    await prisma.config.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar configuração" });
  }
});

// Admin: Get all themes
apiRouter.get("/admin/themes", async (req, res) => {
  const { password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  try {
    const themes = await prisma.prayerTheme.findMany({
      orderBy: { order: "asc" },
    });
    res.json(themes);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar temas" });
  }
});

// Admin: Create/Update theme
apiRouter.post("/admin/themes", async (req, res) => {
  const { id, label, active, order, password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  try {
    if (id) {
      await prisma.prayerTheme.update({
        where: { id },
        data: { label, active, order },
      });
    } else {
      await prisma.prayerTheme.create({
        data: { label, active, order: order || 0 },
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar tema" });
  }
});

// Admin: Delete theme
apiRouter.delete("/admin/themes/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.query;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }
  try {
    await prisma.prayerTheme.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir tema" });
  }
});

// Admin: Test Email
apiRouter.post("/admin/test-email", async (req, res) => {
  const { email, password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Não autorizado" });
  }

  const resend = getResend();
  if (!resend) {
    return res.status(400).json({ error: "RESEND_API_KEY não configurada no ambiente." });
  }

  try {
    await resend.emails.send({
      from: "IBO Relógio <contato@ibopvh.com.br>",
      to: email,
      subject: "Teste de Configuração — Relógio de Oração IBO",
      html: `
        <h1>Teste bem-sucedido!</h1>
        <p>Se você está lendo isso, a integração com o Resend está funcionando corretamente.</p>
        <p><strong>Atenção:</strong> O remetente configurado é <strong>contato@ibopvh.com.br</strong>.</p>
      `,
    });
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error sending test email:", error);
    res.status(500).json({ error: error.message || "Erro ao enviar e-mail de teste." });
  }
});
