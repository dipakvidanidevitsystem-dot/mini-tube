import type { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

// Every prefix defaults to the still-running monolith. As each service is
// actually extracted (see the migration plan), set its SERVICE_URL env var
// and it takes over that prefix — no other route's behavior changes.
const MONOLITH_URL = process.env.MONOLITH_URL || "http://localhost:5001";

// Order matters: more specific rules must be registered before broader
// prefixes they overlap with, since each proxy either handles the request or
// calls next() — the first match wins.
const routeTable: { pathFilter: string | ((path: string) => boolean); serviceUrl: string | undefined }[] = [
  // Nested video comments stay owned by the comment domain (still in the
  // monolith until Comment Service is extracted) even though the broader
  // /api/videos prefix below now goes to Video Service.
  {
    pathFilter: (path) => /^\/api\/videos\/[^/]+\/comments/.test(path),
    serviceUrl: process.env.COMMENT_SERVICE_URL,
  },
  { pathFilter: "/api/auth", serviceUrl: process.env.AUTH_SERVICE_URL },
  { pathFilter: "/api/users", serviceUrl: process.env.USER_SERVICE_URL },
  { pathFilter: "/api/videos", serviceUrl: process.env.VIDEO_SERVICE_URL },
  { pathFilter: "/api/comments", serviceUrl: process.env.COMMENT_SERVICE_URL },
  { pathFilter: "/api/history", serviceUrl: process.env.HISTORY_SERVICE_URL },
  { pathFilter: "/api/saved", serviceUrl: process.env.HISTORY_SERVICE_URL },
  { pathFilter: "/api/admin", serviceUrl: process.env.ADMIN_SERVICE_URL },
];

export function registerRoutes(app: Express) {
  // Mounted at root (not app.use(prefix, ...)) so Express doesn't strip the
  // prefix from req.url before the proxy sees it — pathFilter matches on the
  // full original path instead, and the target gets the unmodified path.
  for (const { pathFilter, serviceUrl } of routeTable) {
    app.use(
      createProxyMiddleware({
        target: serviceUrl || MONOLITH_URL,
        changeOrigin: true,
        pathFilter,
      })
    );
  }
}
