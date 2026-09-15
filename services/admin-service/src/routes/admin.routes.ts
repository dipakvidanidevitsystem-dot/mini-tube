import { Router } from "express";
import { verifyJwt } from "@mini-tube/auth-middleware";
import { requireAdminMiddleware } from "../middleware/requireAdmin.js";
import adminController from "../controllers/admin.controller.js";

// Migration tooling (/api/admin/migrations/*) stays with the monolith, since
// it operates on the shared database as a whole rather than a single
// business domain — the gateway routes that specific sub-path there instead
// of here (see gateway/src/routes.ts).
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
  }
}

export { AdminRoutes };
export default new AdminRoutes().router;
