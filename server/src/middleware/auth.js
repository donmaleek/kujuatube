import { findUserById, publicUser } from "../config/database.js";
import { verifyToken } from "../utils/generateToken.js";
import { HttpError } from "../utils/http.js";

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : "";
}

export function optionalAuth(req, _res, next) {
  const token = getBearerToken(req);
  if (!token) return next();

  const payload = verifyToken(token);
  const user = payload ? findUserById(payload.sub) : null;
  if (user) req.user = publicUser(user);

  return next();
}

export function authenticate(req, _res, next) {
  const token = getBearerToken(req);
  const payload = verifyToken(token);
  const user = payload ? findUserById(payload.sub) : null;

  if (!user) {
    return next(new HttpError(401, "Authentication required"));
  }

  req.user = publicUser(user);
  return next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, "Insufficient permissions"));
    }

    return next();
  };
}
