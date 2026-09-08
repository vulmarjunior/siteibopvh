import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { buildWeeklyReadingEmail } from "../../src/lib/email-templates/weekly-reading.js";
import { getFallbackWeeklyReadingFromJSON, selectCurrentWeeklyReading } from "../../src/lib/editorial/weeklyReading.js";

// Config: toda segunda-feira às 11h UTC = 7h Porto Velho
export const config = {
  schedule: "0 11 * * 1",
};

let prisma: PrismaClient;
function getPrisma() {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

let resend: Resend;
function getResend() {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY não configurada");
    resend = new Resend(key);
  }
  return resend;
}

// Utilitário para fatiar array em lotes
function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export default async () => {
  console.log("[weekly-reading] Iniciando envio semanal automatizado...");

  // 1. Calcular segunda-feira da semana atual (horário de Porto Velho)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Dom
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + mondayOffset);
  monday.setUTCHours(11, 0, 0, 0); // 11h UTC = 7h Porto Velho
  const mondayStr = monday.toISOString().split("T")[0]; // YYYY-MM-DD

  console.log(`[weekly-reading] Data de referência: ${mondayStr}`);

  // 2. Selecionar a leitura vigente na plataforma editorial (com fallback seguro)
  const db = getPrisma();
  let sermoeVigente = await selectCurrentWeeklyReading(db, now).catch((err) => {
    console.error("[weekly-reading] Erro ao consultar leitura vigente no banco:", err);
    return null;
  });

  if (!sermoeVigente) {
    console.log("[weekly-reading] Usando fallback local para catálogo sermoes.json...");
    sermoeVigente = getFallbackWeeklyReadingFromJSON(now);
  }

  if (!sermoeVigente) {
    console.log("[weekly-reading] Nenhum sermão com leituras encontrado para esta semana.");
    return { status: "no_sermon", monday: mondayStr };
  }

  console.log(`[weekly-reading] Sermão identificado: #${sermoeVigente.number} — ${sermoeVigente.title}`);

  // 3. Checar status da série no banco e se o envio está habilitado ANTES de registrar a execução
  let seriesId = sermoeVigente.seriesId;
  let messageId = sermoeVigente.messageId;
  let emailEnabled = sermoeVigente.emailEnabled;

  const dbSeries = await db.editorialSeries.findFirst({
    where: { slug: sermoeVigente.seriesSlug },
    select: { id: true, emailEnabled: true },
  }).catch(() => null);

  if (dbSeries) {
    seriesId = dbSeries.id;
    emailEnabled = dbSeries.emailEnabled;
  }

  // Se o envio automático estiver desabilitado na série, sai imediatamente sem travar o banco
  if (!emailEnabled) {
    console.log("[weekly-reading] Envio de e-mail está desabilitado na Central para esta série.");
    return { status: "disabled", sermon: sermoeVigente.number, monday: mondayStr };
  }

  // 4. Buscar inscritos ativos
  const subscribers = await db.readingSubscriber.findMany({
    where: { active: true },
  });

  if (subscribers.length === 0) {
    console.log("[weekly-reading] Nenhum inscrito ativo encontrado.");
    return { status: "no_subscribers", sermon: sermoeVigente.number, monday: mondayStr };
  }

  console.log(`[weekly-reading] ${subscribers.length} inscrito(s) ativo(s) para receber`);

  // Se a mensagem for de fallback com prefixo json-, tenta vincular com a mensagem do banco se existir
  if (messageId.startsWith("json-") && dbSeries) {
    const dbMessage = await db.editorialMessage.findFirst({
      where: { seriesId: dbSeries.id, order: Number(sermoeVigente.number) },
      select: { id: true },
    }).catch(() => null);
    if (dbMessage) {
      messageId = dbMessage.id;
    }
  }

  // 5. Gestão auto-recuperável da execução (EditorialEmailRun)
  let run: { id: string; status: string } | null = null;
  const canPersistRun = Boolean(dbSeries && !messageId.startsWith("json-"));

  if (canPersistRun) {
    try {
      const existingRun = await db.editorialEmailRun.findUnique({
        where: {
          seriesId_messageId_weekStart: {
            seriesId,
            messageId,
            weekStart: monday,
          },
        },
        select: { id: true, status: true },
      });

      if (existingRun) {
        if (existingRun.status === "COMPLETED") {
          console.log("[weekly-reading] Esta edição semanal já foi concluída com sucesso.");
          return {
            status: "already_completed",
            sermon: sermoeVigente.number,
            monday: mondayStr,
            runId: existingRun.id,
          };
        }
        console.log(`[weekly-reading] Retomando execução existente (${existingRun.status}): ${existingRun.id}`);
        run = existingRun;
      } else {
        run = await db.editorialEmailRun.create({
          data: {
            seriesId,
            messageId,
            weekStart: monday,
            recipientCount: subscribers.length,
            status: "RUNNING",
          },
          select: { id: true, status: true },
        });
      }
    } catch (err: any) {
      console.warn("[weekly-reading] Aviso ao gerenciar registro de execução:", err?.message || err);
    }
  }

  // 6. Filtrar inscritos que já receberam com sucesso nesta execução (idempotência no nível de destinatário)
  let pendingSubscribers = subscribers;
  if (run) {
    try {
      const alreadySent = await db.editorialEmailDelivery.findMany({
        where: { runId: run.id, status: "SENT" },
        select: { subscriberId: true },
      });
      const sentIds = new Set(alreadySent.map((d) => d.subscriberId));
      if (sentIds.size > 0) {
        pendingSubscribers = subscribers.filter((s) => !sentIds.has(s.id));
        console.log(`[weekly-reading] ${sentIds.size} já receberam; restam ${pendingSubscribers.length} pendentes.`);
      }
    } catch (err) {
      console.warn("[weekly-reading] Não foi possível checar envios prévios, enviando para todos os ativos:", err);
    }
  }

  if (pendingSubscribers.length === 0) {
    console.log("[weekly-reading] Todos os inscritos já receberam a leitura desta semana.");
    if (run) {
      await db.editorialEmailRun.update({
        where: { id: run.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      }).catch(() => null);
    }
    return { status: "already_completed", sermon: sermoeVigente.number, monday: mondayStr };
  }

  // 7. Envio em lotes concorrentes (chunks de 5) para máxima velocidade e sem estourar timeout
  const siteUrl = process.env.APP_URL || "https://www.ibopvh.com.br";
  const resendClient = getResend();
  let sent = 0;
  let errors = 0;

  const batches = chunkArray(pendingSubscribers, 5);

  for (const batch of batches) {
    await Promise.allSettled(
      batch.map(async (sub) => {
        const unsubscribeUrl = `${siteUrl}/api/parousia/unsubscribe?token=${sub.token}`;
        const html = buildWeeklyReadingEmail({
          sermoeNumero: sermoeVigente.number,
          sermoeTitulo: sermoeVigente.title,
          tema: sermoeVigente.theme,
          dias: sermoeVigente.days,
          unsubscribeUrl,
          siteUrl,
        });

        let deliveryId: string | null = null;
        if (run) {
          try {
            const delivery = await db.editorialEmailDelivery.create({
              data: { runId: run.id, subscriberId: sub.id },
              select: { id: true },
            });
            deliveryId = delivery.id;
          } catch {
            // Segue mesmo se a auditoria individual falhar
          }
        }

        try {
          const idempotencyKey = run
            ? `weekly-reading/${run.id}/${sub.id}`
            : `weekly-reading/${mondayStr}/${sub.id}`;

          const { data, error } = await resendClient.emails.send(
            {
              from: "IBO Parousia <contato@ibopvh.com.br>",
              to: sub.email,
              subject: `Leitura da Semana — #${sermoeVigente.number} ${sermoeVigente.title}`,
              html,
            },
            { idempotencyKey }
          );

          if (error) throw new Error(error.message);

          if (deliveryId) {
            await db.editorialEmailDelivery.update({
              where: { id: deliveryId },
              data: { status: "SENT", providerId: data?.id, sentAt: new Date() },
            }).catch(() => null);
          }
          sent++;
        } catch (err) {
          console.error(`[weekly-reading] Erro ao enviar para ${sub.email}:`, err);
          if (deliveryId) {
            await db.editorialEmailDelivery.update({
              where: { id: deliveryId },
              data: {
                status: "FAILED",
                error: err instanceof Error ? err.message : "Erro desconhecido",
              },
            }).catch(() => null);
          }
          errors++;
        }
      })
    );
  }

  // 8. Atualizar status final da execução
  if (run) {
    await db.editorialEmailRun.update({
      where: { id: run.id },
      data: {
        status: errors === 0 ? "COMPLETED" : sent > 0 ? "PARTIAL" : "FAILED",
        sentCount: { increment: sent },
        failedCount: { increment: errors },
        completedAt: new Date(),
      },
    }).catch((err) => console.error("[weekly-reading] Erro ao atualizar status final da execução:", err));
  }

  console.log(`[weekly-reading] Envio concluído: ${sent} enviados com sucesso, ${errors} falhas.`);

  return {
    status: "sent",
    sermon: `#${sermoeVigente.number} ${sermoeVigente.title}`,
    subscribers: pendingSubscribers.length,
    sent,
    errors,
  };
};
