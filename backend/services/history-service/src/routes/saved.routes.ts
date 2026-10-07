import { Router } from "express";
import { verifyJwt } from "@mini-tube/auth-middleware";
import savedController from "../controllers/saved.controller.js";

class SavedRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", verifyJwt, savedController.list);
    this.router.post("/:videoId/toggle", verifyJwt, savedController.toggle);
  }
}

export { SavedRoutes };
export default new SavedRoutes().router;
