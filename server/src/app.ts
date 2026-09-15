import express, { type Express } from "express";
import cors from "cors";
import videoCommentsRoutes from "./routes/videoComments.routes.js";
import commentRoutes from "./routes/comment.routes.js";
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

    // /api/auth is now owned by services/auth-service (migration plan step 3),
    // and video CRUD by services/video-service (step 4) — the gateway routes
    // those prefixes there instead of here. Nested video comments stay here.
    this.app.use("/api/videos", videoCommentsRoutes);
    this.app.use("/api/comments", commentRoutes);
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
