import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http.js";

const uploadDir = path.resolve(env.uploadDir);
fs.mkdirSync(uploadDir, { recursive: true });
const videoExtensions = new Set([".mp4", ".mov", ".m4v", ".webm", ".mkv", ".avi", ".mpeg", ".mpg", ".ogv"]);
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

function fileFilter(_req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "video" && !file.mimetype.startsWith("video/") && !videoExtensions.has(extension)) {
    return cb(new HttpError(400, "Only video files can be uploaded as videos"));
  }

  if (["thumbnail", "avatar", "banner"].includes(file.fieldname) && !file.mimetype.startsWith("image/") && !imageExtensions.has(extension)) {
    return cb(new HttpError(400, "Only image files can be uploaded here"));
  }

  if (!["video", "thumbnail", "avatar", "banner"].includes(file.fieldname)) {
    return cb(new HttpError(400, "Unsupported upload field"));
  }

  return cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024
  }
});
