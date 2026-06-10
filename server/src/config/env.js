import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

dotenv.config({ path: path.join(serverRoot, ".env") });

function resolveServerPath(value = "") {
  if (!value) return "";
  return path.isAbsolute(value) ? value : path.resolve(serverRoot, value);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL || "",
  dataFile: resolveServerPath(process.env.DATA_FILE || ""),
  redisUrl: process.env.REDIS_URL || "",
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  s3Bucket: process.env.S3_BUCKET || "",
  uploadDir: resolveServerPath(process.env.UPLOAD_DIR || "../storage/uploads/temp"),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || "http://localhost:5000"
};

export function assertProductionEnv() {
  if (env.nodeEnv !== "production") return;

  const missing = [];
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "change-me-before-production") missing.push("JWT_SECRET");
  if (!process.env.CORS_ORIGIN) missing.push("CORS_ORIGIN");

  if (missing.length) {
    throw new Error(`Missing production environment variables: ${missing.join(", ")}`);
  }
}
