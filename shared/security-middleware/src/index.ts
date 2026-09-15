import rateLimit, { type Options } from "express-rate-limit";

type RateLimiterOverrides = Partial<Options>;

/**
 * Global/default limiter: 100 requests per 15 minutes per IP. Applied at the
 * gateway (protects everything behind it) and again at each service
 * (defense in depth if a service is ever reached directly).
 */
export function createRateLimiter(overrides: RateLimiterOverrides = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
    ...overrides,
  });
}

/**
 * Stricter limiter for brute-force-sensitive auth endpoints
 * (login/register/forgot-password/reset-password): 8 requests per 15
 * minutes per IP.
 */
export function createAuthSensitiveLimiter(overrides: RateLimiterOverrides = {}) {
  return createRateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 8,
    message: { message: "Too many attempts, please try again in 15 minutes." },
    ...overrides,
  });
}
