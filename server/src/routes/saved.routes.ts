import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import savedController from "../controllers/saved.controller.js";

class SavedRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", authMiddleware.authenticate, savedController.list);
    this.router.post("/:videoId/toggle", authMiddleware.authenticate, savedController.toggle);
  }
}

export { SavedRoutes };
export default new SavedRoutes().router;
