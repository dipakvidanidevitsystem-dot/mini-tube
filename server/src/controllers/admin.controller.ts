import type { Request, Response, NextFunction } from "express";
import { adminService, type AdminService } from "../services/admin.service.js";

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
}

export { AdminController };
export default new AdminController(adminService);
