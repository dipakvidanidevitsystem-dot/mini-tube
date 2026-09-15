import { Router } from "express";
import { verifyJwt } from "@mini-tube/auth-middleware";
import commentController from "../controllers/comment.controller.js";

// Mounted at /api/videos so it matches the gateway's nested-comments rule
// (see gateway/src/routes.ts) unchanged. GET has no auth middleware — matches
// the original monolith behavior, which never resolved `isLiked` on this route.
class VideoCommentsRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/:id/comments", commentController.list);
    this.router.post("/:id/comments", verifyJwt, commentController.add);
  }
}

export { VideoCommentsRoutes };
export default new VideoCommentsRoutes().router;
