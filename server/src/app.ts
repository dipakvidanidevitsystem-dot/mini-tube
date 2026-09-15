import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { createRateLimiter } from "@mini-tube/security-middleware";
import migrationsRoutes from "./routes/migrations.routes.js";
import { errorHandlerMiddleware } from "./middleware/errorHandler.js";

class App {
  app: Express = express();

  constructor() {
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandler();
  }

  private initializeMiddleware() {
    this.app.use(helmet());
    this.app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
    this.app.use(createRateLimiter());
    this.app.use(cookieParser());
    this.app.use(express.json());
  }

  private initializeRoutes() {
    this.app.get("/api/health", (req, res) => res.json({ status: "ok" }));

    // Every business domain has moved to its own service (see the migration
    // plan) — this is the last thing the monolith owns: schema migrations
    // for the still-shared database, which don't belong to any single
    // service. The gateway routes /api/admin/migrations here and everything
    // else under /api/admin to admin-service.
    this.app.use("/api/admin/migrations", migrationsRoutes);
  }

  private initializeErrorHandler() {
    this.app.use(errorHandlerMiddleware.handle);
  }
}

export { App };
export default new App().app;
