import express, { type Express } from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import historyRoutes from "./routes/history.routes.js";
import savedRoutes from "./routes/saved.routes.js";
import adminRoutes from "./routes/admin.routes.js";
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
    this.app.get("/api/health", (req, res) => res.json({ status: "ok" }));

    // /api/auth (step 3), video CRUD + nested /api/videos/:id/comments
    // (step 4), and /api/comments (step 5) are now owned by their respective
    // services — the gateway routes those prefixes there instead of here.
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/history", historyRoutes);
    this.app.use("/api/saved", savedRoutes);
    this.app.use("/api/admin", adminRoutes);
  }

  private initializeErrorHandler() {
    this.app.use(errorHandlerMiddleware.handle);
  }
}

export { App };
export default new App().app;
