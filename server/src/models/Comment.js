export function createCommentModel({ id, videoId, userId, authorName, authorAvatarUrl = "", body }) {
  const timestamp = new Date().toISOString();
  return {
    id,
    videoId,
    userId,
    authorName,
    authorAvatarUrl,
    body,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
