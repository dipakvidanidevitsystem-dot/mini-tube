import type { Request, Response, NextFunction } from "express";
import { authService, type AuthService } from "../services/auth.service.js";

class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const result = await this.authService.register(name, email, password, req.body.profileImage);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.forgotPassword(req.body.email);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = req.body;
      const result = await this.authService.resetPassword(token, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}

export { AuthController };
export default new AuthController(authService);
