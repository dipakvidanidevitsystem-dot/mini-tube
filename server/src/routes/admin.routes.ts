import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireAdminMiddleware } from "../middleware/requireAdmin.js";
import videoController from "../controllers/video.controller.js";
import commentController from "../controllers/comment.controller.js";
import adminController from "../controllers/admin.controller.js";
import migrationController from "../controllers/migration.controller.js";

class AdminRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authMiddleware.authenticate, requireAdminMiddleware.handle);

    this.router.get("/users", adminController.listAllUsers);
    this.router.patch("/users/:id/disable", adminController.setUserDisabled);

    this.router.get("/videos", adminController.listAllVideos);
    this.router.delete("/videos/:id", videoController.remove);

    this.router.get("/comments", adminController.listAllComments);
    this.router.delete("/comments/:id", commentController.remove);

    this.router.get("/reports", adminController.listAllReports);
    this.router.patch("/reports/:id", adminController.markReportReviewed);

    this.router.get("/migrations", migrationController.getStatus);
    this.router.post("/migrations/run", migrationController.run);
    this.router.post("/migrations/baseline", migrationController.baseline);
  }
}

export { AdminRoutes };
export default new AdminRoutes().router;
