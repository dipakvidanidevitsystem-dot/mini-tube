import { Router } from "express";
import { verifyJwt, optionalVerifyJwt } from "@mini-tube/auth-middleware";
import { UploadMiddleware } from "../middleware/upload.js";
import userController from "../controllers/user.controller.js";

class UserRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const avatarUpload = UploadMiddleware.instance.fields([{ name: "profileImage", maxCount: 1 }]);

    this.router.patch("/preferences", verifyJwt, userController.updatePreferences);
    this.router.patch("/me", verifyJwt, avatarUpload, userController.updateProfile);
    this.router.patch("/me/password", verifyJwt, userController.changePassword);
    this.router.get("/me/dashboard", verifyJwt, userController.getDashboard);
    this.router.get("/me/dashboard/highlights", verifyJwt, userController.getDashboardHighlights);
    this.router.get("/me/dashboard/views-series", verifyJwt, userController.getViewsSeries);
    this.router.get("/me/dashboard/top-videos", verifyJwt, userController.getTopVideos);
    this.router.get("/me/dashboard/activity", verifyJwt, userController.getRecentActivity);
    this.router.get("/me/dashboard/audience", verifyJwt, userController.getAudienceActivity);
    this.router.get("/:id", optionalVerifyJwt, userController.getUser);
    this.router.post("/:id/subscribe", verifyJwt, userController.toggleSubscribe);
  }
}

export { UserRoutes };
export default new UserRoutes().router;
