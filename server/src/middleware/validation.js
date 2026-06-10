import { HttpError } from "../utils/http.js";

export function requireFields(fields) {
  return (req, _res, next) => {
    const missing = fields.filter((field) => !String(req.body?.[field] ?? "").trim());
    if (missing.length) {
      return next(new HttpError(400, `Missing required fields: ${missing.join(", ")}`));
    }

    return next();
  };
}

export function validateEmail(req, _res, next) {
  if (req.body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
    return next(new HttpError(400, "Invalid email address"));
  }

  return next();
}
