export function createWatchHistoryModel({ id, userId, videoId }) {
  return {
    id,
    userId,
    videoId,
    watchedAt: new Date().toISOString()
  };
}
