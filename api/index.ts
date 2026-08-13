import express from "express";

const app = express();
const isProdLike = () => process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

app.use(express.json());
const appReady = import("../src/api.js").then(({ apiRouter }) => {
  app.use("/api", apiRouter);
  return app;
});

export default async function handler(req: any, res: any) {
  const pathname = req.url?.split("?")[0] || "";
  if (isProdLike() && pathname.startsWith("/api/debug")) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  try {
    const readyApp = await appReady;
    return readyApp(req, res);
  } catch (error) {
    console.error("API initialization failed:", error);
    return res.status(500).json({ error: "Falha ao inicializar a API" });
  }
}
