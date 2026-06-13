import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * Resize + convert an uploaded image to WebP in-place.
 * Returns the new filename (same stem, .webp extension).
 * Silently returns original filename if sharp fails.
 */
export async function processImage(filePath, { width, height, fit = "cover" } = {}) {
  try {
    const dir = path.dirname(filePath);
    const stem = path.basename(filePath, path.extname(filePath));
    const outPath = path.join(dir, `${stem}.webp`);

    const pipeline = sharp(filePath).webp({ quality: 82 });
    if (width || height) pipeline.resize(width, height, { fit, withoutEnlargement: true });

    await pipeline.toFile(outPath);

    // Remove original only if the output is a different file
    if (outPath !== filePath) fs.unlink(filePath, () => {});

    return outPath;
  } catch {
    return filePath;
  }
}
