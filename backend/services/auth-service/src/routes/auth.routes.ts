import { Router } from "express";
import { createAuthSensitiveLimiter } from "@mini-tube/security-middleware";
import authController from "../controllers/auth.controller.js";

class AuthRoutes {
  router = Router();
  private sensitiveLimiter = createAuthSensitiveLimiter();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/register", this.sensitiveLimiter, authController.register);
    this.router.post("/login", this.sensitiveLimiter, authController.login);
    this.router.post("/forgot-password", this.sensitiveLimiter, authController.forgotPassword);
    this.router.post("/reset-password", this.sensitiveLimiter, authController.resetPassword);
    this.router.post("/refresh", authController.refresh);
    this.router.post("/logout", authController.logout);
  }
}

export { AuthRoutes };
export default new AuthRoutes().router;
