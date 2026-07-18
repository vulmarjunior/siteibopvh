import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";
import { buildWeeklyReadingEmail } from "../../src/lib/email-templates/weekly-reading";

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

interface LeituraDiaria {
  dia: string;
  texto: string;
  descricao: string;
}

interface SermoeData {
  numero: string;
  data: string;
  titulo: string;
  movimento: string;
  leituras?: {
    tema: string;
    dias: LeituraDiaria[];
  };
}

export default async () => {
  console.log("[weekly-reading] Iniciando envio semanal...");

  // 1. Ler sermoes.json
  const sermoes: SermoeData[] = await import("../../src/data/sermoes.json").then(
    (m) => m.default
  );

  // 2. Calcular segunda-feira da semana atual (horário de Porto Velho)
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Dom
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + mondayOffset);
  monday.setUTCHours(11, 0, 0, 0); // 11h UTC = 7h Porto Velho
  const mondayStr = monday.toISOString().split("T")[0]; // YYYY-MM-DD

  console.log(`[weekly-reading] Segunda-feira: ${mondayStr}`);

  // 3. Encontrar sermão vigente: o mais recente cuja data já passou e tem leituras
  const hoje = new Date();
  const sermoeVigente = sermoes
    .filter((s) => s.leituras && s.leituras.dias.length > 0 && new Date(`${s.data}T00:00:00`) <= hoje)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];

  if (!sermoeVigente || !sermoeVigente.leituras) {
    console.log("[weekly-reading] Nenhum sermão com leituras encontrado para esta semana.");
    return { status: "no_sermon", monday: mondayStr };
  }

  console.log(
    `[weekly-reading] Sermão: #${sermoeVigente.numero} — ${sermoeVigente.titulo}`
  );

  // 4. Buscar subscribers ativos
  const db = getPrisma();
  const subscribers = await db.readingSubscriber.findMany({
    where: { active: true },
  });

  if (subscribers.length === 0) {
    console.log("[weekly-reading] Nenhum inscrito ativo.");
    return { status: "no_subscribers", sermon: sermoeVigente.numero };
  }

  console.log(`[weekly-reading] ${subscribers.length} inscrito(s) ativo(s)`);

  // 5. Enviar e-mails
  const siteUrl = process.env.APP_URL || "https://www.ibopvh.com.br";
  const resendClient = getResend();
  let sent = 0;
  let errors = 0;

  for (const sub of subscribers) {
    const unsubscribeUrl = `${siteUrl}/api/parousia/unsubscribe?token=${sub.token}`;

    const html = buildWeeklyReadingEmail({
      sermoeNumero: sermoeVigente.numero,
      sermoeTitulo: sermoeVigente.titulo,
      tema: sermoeVigente.leituras.tema,
      dias: sermoeVigente.leituras.dias,
      unsubscribeUrl,
      siteUrl,
    });

    try {
      await resendClient.emails.send({
        from: "IBO Parousia <contato@ibopvh.com.br>",
        to: sub.email,
        subject: `Leitura da Semana — #${sermoeVigente.numero} ${sermoeVigente.titulo}`,
        html,
      });
      sent++;
    } catch (err) {
      console.error(`[weekly-reading] Erro ao enviar para ${sub.email}:`, err);
      errors++;
    }
  }

  console.log(`[weekly-reading] Envio concluído: ${sent} enviados, ${errors} erros.`);

  return {
    status: "sent",
    sermon: `#${sermoeVigente.numero} ${sermoeVigente.titulo}`,
    subscribers: subscribers.length,
    sent,
    errors,
  };
};
