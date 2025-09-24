import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();

// Trust proxy for secure cookies behind Render's proxy
app.set('trust proxy', 1);

// Simple logging function
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// CORS configuration for production deployment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://artisanal-jewels-52y7.vercel.app',
        'https://68d39312-sensational-kleicha-8c506a.netlify.app'
      ] 
    : true, // Allow all origins in development
  credentials: true, // Allow cookies and auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
};

app.use(cors(corsOptions));

// Increase body parser limits to handle multiple image uploads (base64 encoded)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    // Only import vite in development - using dynamic import to avoid bundling in production
    try {
      const viteModule = await eval('import("./vite.js")');
      await viteModule.setupVite(app, server);
    } catch (e) {
      console.error("Failed to setup Vite:", e);
    }
  } else {
    // Production: API-only server - no frontend serving to avoid any vite dependencies
    log("Production mode: API-only server");
    
    // Simple catch-all for any non-API routes
    app.use("*", (_req, res) => {
      res.status(200).json({ 
        message: "Artisanal Jewels API is running", 
        status: "production",
        note: "This is an API-only deployment. Frontend is hosted separately on Netlify.",
        api_endpoints: [
          "/api/auth/*", "/api/products", "/api/categories", 
          "/api/cart", "/api/wishlist", "/api/orders", "/api/reviews"
        ]
      });
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
