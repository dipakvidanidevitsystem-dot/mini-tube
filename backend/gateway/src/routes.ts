import type { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

// Service endpoints mapping
const routeTable: { pathFilter: string | ((path: string) => boolean); serviceUrl: string }[] = [
  // Nested video comments are handled by comment-service
  {
    pathFilter: (path) => /^\/api\/videos\/[^/]+\/comments/.test(path),
    serviceUrl: process.env.COMMENT_SERVICE_URL || "http://localhost:5014",
  },
  { pathFilter: "/api/auth", serviceUrl: process.env.AUTH_SERVICE_URL || "http://localhost:5011" },
  { pathFilter: "/api/users", serviceUrl: process.env.USER_SERVICE_URL || "http://localhost:5012" },
  { pathFilter: "/api/videos", serviceUrl: process.env.VIDEO_SERVICE_URL || "http://localhost:5013" },
  { pathFilter: "/api/comments", serviceUrl: process.env.COMMENT_SERVICE_URL || "http://localhost:5014" },
  { pathFilter: "/api/history", serviceUrl: process.env.HISTORY_SERVICE_URL || "http://localhost:5015" },
  { pathFilter: "/api/saved", serviceUrl: process.env.HISTORY_SERVICE_URL || "http://localhost:5015" },
  { pathFilter: "/api/admin", serviceUrl: process.env.ADMIN_SERVICE_URL || "http://localhost:5016" },
];

export function registerRoutes(app: Express) {
  for (const { pathFilter, serviceUrl } of routeTable) {
    const target = serviceUrl;

    app.use(
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathFilter,

        on: {
          proxyReq: (_proxyReq, req) => {
            console.log(
              `[Gateway] ${req.method} ${req.originalUrl} -> ${target}`
            );
          },
        },
      })
    );  
  }
}
