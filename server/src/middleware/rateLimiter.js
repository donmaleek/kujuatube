import { HttpError } from "../utils/http.js";

const buckets = new Map();

export function rateLimiter({ windowMs = 60_000, max = 180 } = {}) {
  return (req, _res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "local";
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt < now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > max) {
      return next(new HttpError(429, "Too many requests"));
    }

    return next();
  };
}
