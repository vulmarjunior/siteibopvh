import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { apiRouter, seed } from "./src/api";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.use("/api", apiRouter);

  // Seed DB
  try {
    await seed();
  } catch (err) {
    console.error("Seeding error:", err);
  }

  const isProduction = process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod";

  // Vite middleware for development
  if (!isProduction) {
    console.log("Running in DEVELOPMENT mode");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in PRODUCTION mode");
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static files from dist
    app.use(express.static(distPath, {
      maxAge: '1d',
      etag: true
    }));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
