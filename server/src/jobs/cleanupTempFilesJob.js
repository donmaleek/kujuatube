import fs from "node:fs";
import path from "node:path";
import { env } from "../config/env.js";

export function runCleanupTempFilesJob({ maxAgeMs = 1000 * 60 * 60 * 24 } = {}) {
  const directory = path.resolve(env.uploadDir);
  if (!fs.existsSync(directory)) return { removed: 0 };

  const now = Date.now();
  let removed = 0;

  for (const filename of fs.readdirSync(directory)) {
    const filePath = path.join(directory, filename);
    const stat = fs.statSync(filePath);
    if (stat.isFile() && now - stat.mtimeMs > maxAgeMs) {
      fs.unlinkSync(filePath);
      removed += 1;
    }
  }

  return { removed };
}
