import { Router } from "express";
import { verifyJwt } from "@mini-tube/auth-middleware";
import { requireAdminMiddleware } from "../middleware/requireAdmin.js";
import adminController from "../controllers/admin.controller.js";

import migrationController from "../controllers/migration.controller.js";

class AdminRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(verifyJwt, requireAdminMiddleware.handle);

    this.router.get("/users", adminController.listAllUsers);
    this.router.patch("/users/:id/disable", adminController.setUserDisabled);

    this.router.get("/videos", adminController.listAllVideos);
    this.router.delete("/videos/:id", adminController.removeVideo);

    this.router.get("/comments", adminController.listAllComments);
    this.router.delete("/comments/:id", adminController.removeComment);

    this.router.get("/reports", adminController.listAllReports);
    this.router.patch("/reports/:id", adminController.markReportReviewed);

    // Database schema migrations management
    this.router.get("/migrations", migrationController.getStatus);
    this.router.post("/migrations/run", migrationController.run);
    this.router.post("/migrations/baseline", migrationController.baseline);
  }
}

export { AdminRoutes };
export default new AdminRoutes().router;
