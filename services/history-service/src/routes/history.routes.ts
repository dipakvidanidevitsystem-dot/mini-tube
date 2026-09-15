import { Router } from "express";
import { verifyJwt } from "@mini-tube/auth-middleware";
import historyController from "../controllers/history.controller.js";

class HistoryRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", verifyJwt, historyController.list);
    this.router.post("/:videoId", verifyJwt, historyController.recordView);
    this.router.delete("/:videoId", verifyJwt, historyController.removeItem);
    this.router.delete("/", verifyJwt, historyController.clear);
  }
}

export { HistoryRoutes };
export default new HistoryRoutes().router;
