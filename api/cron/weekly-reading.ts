import { IncomingMessage, ServerResponse } from "node:http";
import { default as runWeeklyReading } from "../../netlify/functions/weekly-reading.js";

function getHeader(req: IncomingMessage, name: string): string {
  const value = req.headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? "";
  if (typeof value === "string") return value;
  return "";
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function isAuthorized(req: IncomingMessage): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const authorization = getHeader(req, "authorization");
  const isVercelCron = getHeader(req, "x-vercel-cron") === "1" || getHeader(req, "user-agent").includes("vercel-cron");

  // 1. Se veio diretamente da infraestrutura nativa do Vercel Cron
  if (isVercelCron) {
    // Se CRON_SECRET estiver configurado na Vercel, valida o bearer
    if (cronSecret) {
      return authorization === `Bearer ${cronSecret}`;
    }
    // Se CRON_SECRET não foi definido no painel da Vercel, o cabeçalho nativo x-vercel-cron garante autenticidade
    return true;
  }

  // 2. Validação por Bearer Token CRON_SECRET
  if (cronSecret && authorization === `Bearer ${cronSecret}`) {
    return true;
  }

  // 3. Validação por ADMIN_PASSWORD (para testes diretos da Central Administrativa)
  if (adminPassword) {
    if (authorization === `Bearer ${adminPassword}`) return true;
    const url = req.url || "";
    if (url.includes(`key=${encodeURIComponent(adminPassword)}`) || url.includes(`secret=${encodeURIComponent(adminPassword)}`)) {
      return true;
    }
  }

  return false;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(req)) {
    console.warn("[cron/weekly-reading] Tentativa de execução não autorizada.");
    sendJson(res, 401, { ok: false, error: "Unauthorized" });
    return;
  }

  try {
    const result = await runWeeklyReading();
    sendJson(res, 200, { ok: true, executedAt: new Date().toISOString(), ...result });
  } catch (error) {
    console.error("Erro ao executar weekly-reading automatizado:", error);
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
