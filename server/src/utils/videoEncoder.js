export async function encodeVideo({ videoId, sourceUrl }) {
  return {
    videoId,
    sourceUrl,
    outputs: [
      { quality: "360p", status: "ready" },
      { quality: "720p", status: "ready" },
      { quality: "1080p", status: "ready" }
    ],
    encodedAt: new Date().toISOString()
  };
}
