import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import commentController from "../controllers/comment.controller.js";

class CommentRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.delete("/:id", authMiddleware.authenticate, commentController.remove);
    this.router.post("/:id/like", authMiddleware.authenticate, commentController.toggleLike);
  }
}

export { CommentRoutes };
export default new CommentRoutes().router;
