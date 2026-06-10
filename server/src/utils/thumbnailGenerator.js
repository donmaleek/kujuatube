export async function generateThumbnail({ videoId, sourceUrl, thumbnailUrl }) {
  return {
    videoId,
    thumbnailUrl: thumbnailUrl || sourceUrl || "",
    generatedAt: new Date().toISOString()
  };
}
