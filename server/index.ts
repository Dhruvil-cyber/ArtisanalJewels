import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite"; // keep only what works in both

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// logging middleware … (keep your existing one)

(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "development") {
    // ✅ Import vite only in dev
    const { setupVite } = await import("./vite.js");
    const { createServer: createViteServer } = await import("vite");
    await setupVite(app, server, createViteServer);
  } else {
    // ✅ Import serveStatic only in prod
    const { serveStatic } = await import("./vite.js");
    serveStatic(app);
  }

  app.set("trust proxy", 1);

  const port = Number(process.env.PORT) || 5000;
  const host = process.env.HOST || "0.0.0.0";
  server.listen(port, host, () => {
    log(`🚀 Server running on http://${host}:${port}`);
  });
})();
