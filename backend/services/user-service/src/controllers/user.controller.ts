import type { Request, Response, NextFunction } from "express";
import { userService, type UserService } from "../services/user.service.js";

type MulterFiles = { [fieldname: string]: Express.Multer.File[] } | undefined;

class UserController {
  constructor(private readonly userService: UserService) {}

  getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await this.userService.getUser(id, req.user?.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  toggleSubscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const channelId = Number(req.params.id);
      const result = await this.userService.toggleSubscribe(channelId, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notifyNewSubscriber, notifyVideoUploaded, notifyComment, notifyLike } = req.body;
      const result = await this.userService.updatePreferences(
        req.user!.id,
        notifyNewSubscriber,
        notifyVideoUploaded,
        notifyComment,
        notifyLike
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name } = req.body;
      const files = req.files as MulterFiles;
      const result = await this.userService.updateProfile(req.user!.id, name, files);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await this.userService.changePassword(req.user!.id, currentPassword, newPassword);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getDashboard(req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getDashboardHighlights = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const period = typeof req.query.period === "string" ? req.query.period : "all";
      const result = await this.userService.getDashboardHighlights(req.user!.id, period);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getViewsSeries = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getViewsSeries(req.user!.id, req.query.period);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getTopVideos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getTopVideos(req.user!.id, req.query.period);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getRecentActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getRecentActivity(req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getAudienceActivity = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.userService.getAudienceActivity(req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export { UserController };
export default new UserController(userService);
