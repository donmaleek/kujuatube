export function createLikeModel({ id, userId, videoId, value }) {
  return {
    id,
    userId,
    videoId,
    value,
    createdAt: new Date().toISOString()
  };
}
