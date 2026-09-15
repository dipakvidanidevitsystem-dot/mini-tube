import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

export interface AuthTokenPayload {
  id: number;
  role: string;
  disabled?: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: number; role: string };
    }
  }
}

const ACCESS_TOKEN_COOKIE = "access_token";

/**
 * Verifies the JWT signature locally (no call to Auth Service per request).
 * Auth Service is responsible for putting `role`/`disabled` in the token claims
 * and re-issuing a token whenever those change. The token itself travels as an
 * httpOnly `access_token` cookie — the consuming service must run
 * `cookie-parser` before this middleware so `req.cookies` is populated.
 */
export function verifyJwt(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;
    if (payload.disabled) {
      return res.status(403).json({ message: "Your account has been disabled. Please contact support." });
    }
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function optionalVerifyJwt(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ACCESS_TOKEN_COOKIE];
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthTokenPayload;
      if (!payload.disabled) {
        req.user = { id: payload.id, role: payload.role };
      }
    } catch {
      // ignore invalid token on optional routes
    }
  }
  next();
}
