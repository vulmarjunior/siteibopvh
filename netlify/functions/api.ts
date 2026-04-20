import express from "express";
import serverless from "serverless-http";
import { apiRouter, seed } from "../../src/api";

const app = express();
app.use(express.json());
app.use("/api", apiRouter);
app.use("/.netlify/functions/api", apiRouter);

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
