import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import commentController from "../controllers/comment.controller.js";

// Nested under /api/videos (mounted in app.ts) even though video CRUD itself
// moved to video-service — comments are still a monolith-owned domain, and
// the gateway routes this specific sub-path here instead of to video-service
// (see gateway/src/routes.ts).
class VideoCommentsRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/:id/comments", commentController.list);
    this.router.post("/:id/comments", authMiddleware.authenticate, commentController.add);
  }
}

export { VideoCommentsRoutes };
export default new VideoCommentsRoutes().router;
