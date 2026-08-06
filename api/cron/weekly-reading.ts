import { IncomingMessage, ServerResponse } from "node:http";
import { default as runWeeklyReading } from "../../netlify/functions/weekly-reading";

function getAuthorizationHeader(req: IncomingMessage): string {
  const header = req.headers?.authorization;

  if (Array.isArray(header)) {
    return header[0] ?? "";
  }
  if (typeof header === "string") {
    return header;
  }
  return "";
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Method not allowed" });
    return;
  }

  const cronSecret = process.env.CRON_SECRET;
  const authorization = getAuthorizationHeader(req);
  const expected = cronSecret ? `Bearer ${cronSecret}` : "";

  if (!cronSecret || authorization !== expected) {
    sendJson(res, 401, { ok: false, error: "Unauthorized" });
    return;
  }

  try {
    const result = await runWeeklyReading();
    sendJson(res, 200, { ok: true, ...result });
  } catch (error) {
    console.error("Erro ao executar weekly-reading:", error);
    sendJson(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

