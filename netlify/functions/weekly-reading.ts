import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { buildWeeklyReadingEmail } from "../../src/lib/email-templates/weekly-reading";
import { selectCurrentWeeklyReading } from "../../src/lib/editorial/weeklyReading";

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

export default async () => {
  console.log("[weekly-reading] Iniciando envio semanal...");

  // 1. Calcular segunda-feira da semana atual (horário de Porto Velho)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Dom
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + mondayOffset);
  monday.setUTCHours(11, 0, 0, 0); // 11h UTC = 7h Porto Velho
  const mondayStr = monday.toISOString().split("T")[0]; // YYYY-MM-DD

  console.log(`[weekly-reading] Segunda-feira: ${mondayStr}`);

  // 2. Selecionar a leitura vigente na plataforma editorial
  const db = getPrisma();
  const sermoeVigente = await selectCurrentWeeklyReading(db, now);

  if (!sermoeVigente) {
    console.log("[weekly-reading] Nenhum sermão com leituras encontrado para esta semana.");
    return { status: "no_sermon", monday: mondayStr };
  }

  console.log(
    `[weekly-reading] Sermão: #${sermoeVigente.number} — ${sermoeVigente.title}`
  );

  // 3. Buscar subscribers ativos
  const subscribers = await db.readingSubscriber.findMany({
    where: { active: true },
  });

  if (subscribers.length === 0) {
    console.log("[weekly-reading] Nenhum inscrito ativo.");
    return { status: "no_subscribers", sermon: sermoeVigente.number };
  }

  console.log(`[weekly-reading] ${subscribers.length} inscrito(s) ativo(s)`);

  let run;
  try {
    run = await db.editorialEmailRun.create({
      data: {
        seriesId: sermoeVigente.seriesId,
        messageId: sermoeVigente.messageId,
        weekStart: monday,
        recipientCount: subscribers.length,
      },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      console.log('[weekly-reading] Esta edição semanal já foi processada. Envio ignorado.');
      return { status: 'already_processed', sermon: sermoeVigente.number, monday: mondayStr };
    }
    throw error;
  }
  if (!sermoeVigente.emailEnabled) {
    console.log('[weekly-reading] E-mail desabilitado para esta série.');
    return { status: 'disabled', sermon: sermoeVigente.number, monday: mondayStr };
  }

  // 4. Enviar e-mails
  const siteUrl = process.env.APP_URL || "https://www.ibopvh.com.br";
  const resendClient = getResend();
  let sent = 0;
  let errors = 0;

  for (const sub of subscribers) {
    const unsubscribeUrl = `${siteUrl}/api/parousia/unsubscribe?token=${sub.token}`;

    const html = buildWeeklyReadingEmail({
      sermoeNumero: sermoeVigente.number,
      sermoeTitulo: sermoeVigente.title,
      tema: sermoeVigente.theme,
      dias: sermoeVigente.days,
      unsubscribeUrl,
      siteUrl,
    });

    try {
      const delivery = await db.editorialEmailDelivery.create({ data: { runId: run.id, subscriberId: sub.id } });
      const { data, error } = await resendClient.emails.send({
        from: "IBO Parousia <contato@ibopvh.com.br>",
        to: sub.email,
        subject: `Leitura da Semana — #${sermoeVigente.number} ${sermoeVigente.title}`,
        html,
      }, { idempotencyKey: `weekly-reading/${run.id}/${sub.id}` });
      if (error) throw new Error(error.message);
      await db.editorialEmailDelivery.update({ where: { id: delivery.id }, data: { status: 'SENT', providerId: data?.id, sentAt: new Date() } });
      sent++;
    } catch (err) {
      console.error(`[weekly-reading] Erro ao enviar para ${sub.email}:`, err);
      await db.editorialEmailDelivery.upsert({
        where: { runId_subscriberId: { runId: run.id, subscriberId: sub.id } },
        create: { runId: run.id, subscriberId: sub.id, status: 'FAILED', error: err instanceof Error ? err.message : 'Erro desconhecido' },
        update: { status: 'FAILED', error: err instanceof Error ? err.message : 'Erro desconhecido' },
      });
      errors++;
    }
  }

  await db.editorialEmailRun.update({
    where: { id: run.id },
    data: { status: errors === 0 ? 'COMPLETED' : sent > 0 ? 'PARTIAL' : 'FAILED', sentCount: sent, failedCount: errors, completedAt: new Date() },
  });

  console.log(`[weekly-reading] Envio concluído: ${sent} enviados, ${errors} erros.`);

  return {
    status: "sent",
    sermon: `#${sermoeVigente.number} ${sermoeVigente.title}`,
    subscribers: subscribers.length,
    sent,
    errors,
  };
};
