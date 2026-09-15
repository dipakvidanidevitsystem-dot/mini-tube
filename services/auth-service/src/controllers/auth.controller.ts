import type { Request, Response, NextFunction } from "express";
import { authService, type AuthService } from "../services/auth.service.js";

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const isProd = process.env.NODE_ENV === "production";
// Only set when the client/gateway live on different subdomains of the same
// parent domain in production — omit in dev so the cookie defaults to the
// exact host.
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    domain: cookieDomain,
    path: "/api",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    domain: cookieDomain,
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/api", domain: cookieDomain });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/api/auth", domain: cookieDomain });
}

class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const result = await this.authService.register(name, email, password, req.body.profileImage);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.status(201).json({ user: result.user });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({ user: result.user });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const presented = req.cookies?.[REFRESH_TOKEN_COOKIE];
      const result = await this.authService.refresh(presented);
      setAuthCookies(res, result.accessToken, result.refreshToken);
      res.json({ message: "Refreshed" });
    } catch (err) {
      clearAuthCookies(res);
      next(err);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.authService.logout(req.cookies?.[REFRESH_TOKEN_COOKIE]);
      clearAuthCookies(res);
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
