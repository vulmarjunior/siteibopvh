import express from "express";
import serverless from "serverless-http";
import { apiRouter, seed } from "../../src/api";

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use("/api", apiRouter);
app.use("/.netlify/functions/api", apiRouter);

app.use((err: any, _req: any, res: any, next: any) => {
  if (err?.type === "entity.too.large") {
    res.status(413).json({ error: "O JSON enviado é grande demais para importação (limite de 2 MB)." });
    return;
  }
  next(err);
});

let seeded = false;
const handlerFunc = serverless(app);

export const handler: any = async (event: any, context: any) => {
  if (!seeded) {
    try {
      await seed();
      seeded = true;
    } catch (err) {
      console.error("Seeding error in handler:", err);
    }
  }
  return handlerFunc(event, context);
};
