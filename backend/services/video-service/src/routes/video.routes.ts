import { Router } from "express";
import { verifyJwt, optionalVerifyJwt } from "@mini-tube/auth-middleware";
import { UploadMiddleware } from "../middleware/upload.js";
import videoController from "../controllers/video.controller.js";

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
    this.router.get("/:id", optionalVerifyJwt, videoController.getOne);
    this.router.post("/", verifyJwt, videoFiles, videoController.create);
    this.router.put("/:id", verifyJwt, thumbnailOnly, videoController.update);
    this.router.delete("/:id", verifyJwt, videoController.remove);
    this.router.post("/:id/like", verifyJwt, videoController.toggleLike);
    this.router.post("/:id/report", verifyJwt, videoController.report);
    this.router.post("/:id/watch-progress", optionalVerifyJwt, videoController.reportWatchProgress);

    // Nested comment routes (/:id/comments) stay with the still-monolithic
    // comment domain until Comment Service is extracted — the gateway routes
    // that specific sub-path there instead of here (see gateway/src/routes.ts).
  }
}

export { VideoRoutes };
export default new VideoRoutes().router;
