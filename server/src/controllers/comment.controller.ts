import type { Request, Response, NextFunction } from "express";
import { commentService, type CommentService } from "../services/comment.service.js";

class CommentController {
  constructor(private readonly commentService: CommentService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = Number(req.params.id);
      const rows = await this.commentService.listForVideo(videoId, req.user?.id);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  };

  add = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = Number(req.params.id);
      const { comment, parentId } = req.body;
      const row = await this.commentService.add(videoId, req.user!.id, comment, parentId);
      res.status(201).json(row);
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      await this.commentService.delete(id, req.user!.id, req.user!.role);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  toggleLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = Number(req.params.id);
      const result = await this.commentService.toggleLike(commentId, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export { CommentController };
export default new CommentController(commentService);
