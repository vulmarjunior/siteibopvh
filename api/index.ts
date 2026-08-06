import express from "express";
import { apiRouter } from "../src/api.js";

const app = express();
const isProdLike = () => process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

app.use(express.json());
app.use("/api", apiRouter);

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