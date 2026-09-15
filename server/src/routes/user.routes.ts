import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { UploadMiddleware } from "../middleware/upload.js";
import userController from "../controllers/user.controller.js";

class UserRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const avatarUpload = UploadMiddleware.instance.fields([{ name: "profileImage", maxCount: 1 }]);

    this.router.patch("/preferences", authMiddleware.authenticate, userController.updatePreferences);
    this.router.patch("/me", authMiddleware.authenticate, avatarUpload, userController.updateProfile);
    this.router.patch("/me/password", authMiddleware.authenticate, userController.changePassword);
    this.router.get("/me/dashboard", authMiddleware.authenticate, userController.getDashboard);
    this.router.get("/me/dashboard/highlights", authMiddleware.authenticate, userController.getDashboardHighlights);
    this.router.get("/me/dashboard/views-series", authMiddleware.authenticate, userController.getViewsSeries);
    this.router.get("/me/dashboard/top-videos", authMiddleware.authenticate, userController.getTopVideos);
    this.router.get("/me/dashboard/activity", authMiddleware.authenticate, userController.getRecentActivity);
    this.router.get("/me/dashboard/audience", authMiddleware.authenticate, userController.getAudienceActivity);
    this.router.get("/:id", authMiddleware.optionalAuthenticate, userController.getUser);
    this.router.post("/:id/subscribe", authMiddleware.authenticate, userController.toggleSubscribe);
  }
}

export { UserRoutes };
export default new UserRoutes().router;
