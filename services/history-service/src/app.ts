import express, { type Express } from "express";
import cors from "cors";
import historyRoutes from "./routes/history.routes.js";
import savedRoutes from "./routes/saved.routes.js";
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
    this.app.get("/health", (_req, res) => res.json({ status: "ok", service: "history-service" }));

    this.app.use("/api/history", historyRoutes);
    this.app.use("/api/saved", savedRoutes);
  }

  private initializeErrorHandler() {
    this.app.use(errorHandlerMiddleware.handle);
  }
}

export { App };
export default new App().app;
