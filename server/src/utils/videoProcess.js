import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/**
 * Moves the MP4 moov atom to the front of the file (faststart).
 * Browsers need the moov atom to start playback — if it's at the end,
 * they make an extra round-trip range request before any video renders.
 * This runs ffmpeg in-place: tmp file → rename over original.
 * Silently returns the original path if ffmpeg is absent or fails.
 */
export async function faststartVideo(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".mp4" && ext !== ".m4v") return filePath;

  const tmpPath = `${filePath}.faststart.mp4`;
  try {
    await execFileAsync(
      "ffmpeg",
      ["-i", filePath, "-c", "copy", "-movflags", "+faststart", "-y", tmpPath],
      { timeout: 300_000 }
    );
    fs.renameSync(tmpPath, filePath);
  } catch {
    try { fs.unlinkSync(tmpPath); } catch { /* ignore */ }
  }
  return filePath;
}
