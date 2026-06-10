export function notFound(req, _res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || (error.name === "MulterError" ? 400 : 500);
  const payload = {
    error: error.message || "Internal server error"
  };

  if (error.details) payload.details = error.details;
  if (process.env.NODE_ENV !== "production" && status >= 500) payload.stack = error.stack;

  res.status(status).json(payload);
}
