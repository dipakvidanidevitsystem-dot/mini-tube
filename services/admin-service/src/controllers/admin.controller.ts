import type { Request, Response, NextFunction } from "express";
import axios from "axios";
import { adminService, type AdminService } from "../services/admin.service.js";

const VIDEO_SERVICE_URL = process.env.VIDEO_SERVICE_URL || "http://localhost:5013";
const COMMENT_SERVICE_URL = process.env.COMMENT_SERVICE_URL || "http://localhost:5014";

class AdminController {
  constructor(private readonly adminService: AdminService) {}

  listAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.adminService.listUsers();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  };

  setUserDisabled = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await this.adminService.setUserDisabled(id, Boolean(req.body.disabled));
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  listAllVideos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.adminService.listVideos();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  };

  listAllComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.adminService.listComments();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  };

  listAllReports = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await this.adminService.listReports();
      res.json(rows);
    } catch (err) {
      next(err);
    }
  };

  markReportReviewed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const result = await this.adminService.markReportReviewed(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  // Video deletion belongs to video-service (it enforces the same
  // owner-or-admin rule) — forward the admin's own token so that check runs
  // there instead of duplicating it here.
  removeVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await axios.delete(`${VIDEO_SERVICE_URL}/api/videos/${req.params.id}`, {
        headers: { Authorization: req.headers.authorization },
      });
      res.status(204).send();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        res.status(err.response.status).json(err.response.data);
        return;
      }
      next(err);
    }
  };

  // Comment deletion belongs to comment-service, for the same reason.
  removeComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await axios.delete(`${COMMENT_SERVICE_URL}/api/comments/${req.params.id}`, {
        headers: { Authorization: req.headers.authorization },
      });
      res.status(204).send();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        res.status(err.response.status).json(err.response.data);
        return;
      }
      next(err);
    }
  };
}

export { AdminController };
export default new AdminController(adminService);
