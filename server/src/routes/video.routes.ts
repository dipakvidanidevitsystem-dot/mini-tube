import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { UploadMiddleware } from "../middleware/upload.js";
import videoController from "../controllers/video.controller.js";
import commentController from "../controllers/comment.controller.js";

class VideoRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const videoFiles = UploadMiddleware.instance.fields([
      { name: "video", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]);
    const thumbnailOnly = UploadMiddleware.instance.fields([{ name: "thumbnail", maxCount: 1 }]);

    this.router.get("/search", videoController.search);
    this.router.get("/", videoController.list);
    this.router.get("/:id", authMiddleware.optionalAuthenticate, videoController.getOne);
    this.router.post("/", authMiddleware.authenticate, videoFiles, videoController.create);
    this.router.put("/:id", authMiddleware.authenticate, thumbnailOnly, videoController.update);
    this.router.delete("/:id", authMiddleware.authenticate, videoController.remove);
    this.router.post("/:id/like", authMiddleware.authenticate, videoController.toggleLike);
    this.router.post("/:id/report", authMiddleware.authenticate, videoController.report);
    this.router.post("/:id/watch-progress", authMiddleware.optionalAuthenticate, videoController.reportWatchProgress);

    this.router.get("/:id/comments", commentController.list);
    this.router.post("/:id/comments", authMiddleware.authenticate, commentController.add);
  }
}

export { VideoRoutes };
export default new VideoRoutes().router;
