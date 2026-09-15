import express, { type Express } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { errorHandlerMiddleware } from "./middleware/errorHandler.js";

class App {
  app: Express = express();

  constructor() {
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandler();
  }

  private initializeMiddleware() {
    this.app.use(cors({ origin: process.env.CLIENT_URL }));
    this.app.use(express.json());
  }

  private initializeRoutes() {
    this.app.get("/health", (_req, res) => res.json({ status: "ok", service: "auth-service" }));

    // Mounted at /api/auth so it matches whether called directly or proxied
    // through the gateway unchanged (see gateway/src/routes.ts).
    this.app.use("/api/auth", authRoutes);
  }

  private initializeErrorHandler() {
    this.app.use(errorHandlerMiddleware.handle);
  }
}

export { App };
export default new App().app;
