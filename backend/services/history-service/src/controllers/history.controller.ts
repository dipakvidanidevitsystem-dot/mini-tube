import type { Request, Response, NextFunction } from "express";
import { historyService, type HistoryService } from "../services/history.service.js";

class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  recordView = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = Number(req.params.videoId);
      await this.historyService.recordView(req.user!.id, videoId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.historyService.listForUser(req.user!.id);
      res.json(rows);
    } catch (err) {
      next(err);
    }
  };

  removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const videoId = Number(req.params.videoId);
      await this.historyService.removeItem(req.user!.id, videoId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  clear = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.historyService.clear(req.user!.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

export { HistoryController };
export default new HistoryController(historyService);
