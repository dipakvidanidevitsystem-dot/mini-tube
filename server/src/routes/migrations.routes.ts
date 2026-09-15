import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireAdminMiddleware } from "../middleware/requireAdmin.js";
import migrationController from "../controllers/migration.controller.js";

// The only remaining monolith-owned endpoint group — it operates on the
// shared database's schema as a whole (see migration.controller.ts), not a
// single business domain, so it stays here rather than moving to
// admin-service. The gateway routes this specific sub-path to the monolith
// even though /api/admin generally goes to admin-service now (see
// gateway/src/routes.ts).
class MigrationsRoutes {
  router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authMiddleware.authenticate, requireAdminMiddleware.handle);

    this.router.get("/", migrationController.getStatus);
    this.router.post("/run", migrationController.run);
    this.router.post("/baseline", migrationController.baseline);
  }
}

export { MigrationsRoutes };
export default new MigrationsRoutes().router;
