import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import historyController from "../controllers/history.controller.js";

class HistoryRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", authMiddleware.authenticate, historyController.list);
    this.router.post("/:videoId", authMiddleware.authenticate, historyController.recordView);
    this.router.delete("/:videoId", authMiddleware.authenticate, historyController.removeItem);
    this.router.delete("/", authMiddleware.authenticate, historyController.clear);
  }
}

export { HistoryRoutes };
export default new HistoryRoutes().router;
