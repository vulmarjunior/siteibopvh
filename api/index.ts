import express from "express";
import { apiRouter } from "../src/api.js";

const app = express();
const isProdLike = () => process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

app.use(express.json({ limit: "2mb" }));
app.use("/api", apiRouter);

app.use((err: any, _req: any, res: any, next: any) => {
  if (err?.type === "entity.too.large") {
    res.status(413).json({ error: "O JSON enviado é grande demais para importação (limite de 2 MB)." });
    return;
  }
  next(err);
});

export default function handler(req: any, res: any) {
  const pathname = req.url?.split("?")[0] || "";
  if (isProdLike() && pathname.startsWith("/api/debug")) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  return app(req, res);
}
