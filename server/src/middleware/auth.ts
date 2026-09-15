import type { Request, Response, NextFunction } from "express";
import { TokenService } from "../utils/jwt.js";
import { userRepository, type UserRepository } from "../repositories/user.repository.js";

class AuthMiddleware {
  constructor(private readonly userRepository: UserRepository) {}

  authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const payload = TokenService.verify(header.slice(7));
      const user = await this.userRepository.findAuthSnapshotById(payload.id);
      if (!user) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      if (user.disabled) {
        return res.status(403).json({ message: "Your account has been disabled. Please contact support." });
      }
      req.user = { id: user.id, role: user.role };
      next();
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
    }
  };

  optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      try {
        const payload = TokenService.verify(header.slice(7));
        const user = await this.userRepository.findAuthSnapshotById(payload.id);
        if (user && !user.disabled) {
          req.user = { id: user.id, role: user.role };
        }
      } catch {
        // ignore invalid token on optional routes
      }
    }
    next();
  };
}

export { AuthMiddleware };
export const authMiddleware = new AuthMiddleware(userRepository);
