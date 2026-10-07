import type { Request, Response, NextFunction } from "express";

class RequireAdminMiddleware {
  handle = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };
}

export { RequireAdminMiddleware };
export const requireAdminMiddleware = new RequireAdminMiddleware();
