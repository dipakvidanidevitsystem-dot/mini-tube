import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { createRateLimiter } from "@mini-tube/security-middleware";
import userRoutes from "./routes/user.routes.js";
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
    this.app.get("/health", (_req, res) => res.json({ status: "ok", service: "user-service" }));
    this.app.use("/api/users", userRoutes);
  }

  private initializeErrorHandler() {
    this.app.use(errorHandlerMiddleware.handle);
  }
}

export { App };
export default new App().app;
