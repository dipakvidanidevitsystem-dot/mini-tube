import type { Request, Response, NextFunction } from "express";
import { videoService, type VideoService } from "../services/video.service.js";

type MulterFiles = { [fieldname: string]: Express.Multer.File[] } | undefined;

function parsePaging(req: Request) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
  return { page, limit, offset: (page - 1) * limit };
}

class VideoController {
  constructor(private readonly videoService: VideoService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = typeof req.query.category === "string" && req.query.category ? req.query.category : undefined;
      const { page, limit, offset } = parsePaging(req);

      const { rows, total } = await this.videoService.list(category, req.query.sort, limit, offset);
      res.json({ items: rows, total, page, pageSize: limit });
    } catch (err) {
      next(err);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const category = typeof req.query.category === "string" && req.query.category ? req.query.category : undefined;
      const { page, limit, offset } = parsePaging(req);

      const { rows, total } = await this.videoService.search(q, category, req.query.sort, limit, offset);
      res.json({ items: rows, total, page, pageSize: limit });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const video = await this.videoService.getById(id, req.user?.id);
      res.json(video);
    } catch (err) {
      next(err);
    }
  };

  reportWatchProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = Number(req.params.id);
      const videoViewId = Number(req.body?.videoViewId);
      const seconds = Number(req.body?.seconds);

      await this.videoService.reportWatchProgress(videoId, videoViewId, seconds, req.user?.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, category, visibility } = req.body;
      const files = req.files as MulterFiles;

      const video = await this.videoService.create(req.user!.id, title, description, category, visibility, files);
      res.status(202).json(video);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { title, description, category, visibility } = req.body;
      const files = req.files as MulterFiles;

      const video = await this.videoService.update(id, req.user!.id, title, description, category, visibility, files);
      res.json(video);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await this.videoService.delete(id, req.user!.id, req.user!.role as "user" | "admin");
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  toggleLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = Number(req.params.id);
      const result = await this.videoService.toggleLike(videoId, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  report = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = Number(req.params.id);
      await this.videoService.report(videoId, req.user!.id, req.body.reason);
      res.status(201).json({ message: "Report submitted. Thank you for helping keep MiniTube safe." });
    } catch (err) {
      next(err);
    }
  };
}

export { VideoController };
export default new VideoController(videoService);
