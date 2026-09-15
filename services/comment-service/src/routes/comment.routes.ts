import { Router } from "express";
import { verifyJwt } from "@mini-tube/auth-middleware";
import commentController from "../controllers/comment.controller.js";

class CommentRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.delete("/:id", verifyJwt, commentController.remove);
    this.router.post("/:id/like", verifyJwt, commentController.toggleLike);
  }
}

export { CommentRoutes };
export default new CommentRoutes().router;
