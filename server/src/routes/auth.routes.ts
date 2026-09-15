import { Router } from "express";
import authController from "../controllers/auth.controller.js";

class AuthRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/register", authController.register);
    this.router.post("/login", authController.login);
    this.router.post("/forgot-password", authController.forgotPassword);
    this.router.post("/reset-password", authController.resetPassword);
  }
}

export { AuthRoutes };
export default new AuthRoutes().router;
