import type { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

// Every prefix defaults to the still-running monolith. As each service is
// actually extracted (see migration plan step 5), set its SERVICE_URL env var
// and it takes over that prefix — no other route's behavior changes.
const MONOLITH_URL = process.env.MONOLITH_URL || "http://localhost:5001";

const routeTable: Record<string, string | undefined> = {
  "/api/auth": process.env.AUTH_SERVICE_URL,
  "/api/users": process.env.USER_SERVICE_URL,
  "/api/videos": process.env.VIDEO_SERVICE_URL,
  "/api/comments": process.env.COMMENT_SERVICE_URL,
  "/api/history": process.env.HISTORY_SERVICE_URL,
  "/api/saved": process.env.HISTORY_SERVICE_URL,
  "/api/admin": process.env.ADMIN_SERVICE_URL,
};

export function registerRoutes(app: Express) {
  // Mounted at root (not app.use(prefix, ...)) so Express doesn't strip the
  // prefix from req.url before the proxy sees it — pathFilter matches on the
  // full original path instead, and the target gets the unmodified path.
  for (const [prefix, serviceUrl] of Object.entries(routeTable)) {
    app.use(
      createProxyMiddleware({
        target: serviceUrl || MONOLITH_URL,
        changeOrigin: true,
        pathFilter: prefix,
      })
    );
  }
}
