import type { Request, Response, NextFunction } from "express";
import { savedService, type SavedService } from "../services/saved.service.js";

class SavedController {
  constructor(private readonly savedService: SavedService) {}

  toggle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = Number(req.params.videoId);
      const result = await this.savedService.toggle(req.user!.id, videoId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.savedService.listForUser(req.user!.id);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  };
}

export { SavedController };
export default new SavedController(savedService);
