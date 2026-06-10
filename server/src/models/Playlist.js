export function createPlaylistModel({ id, userId, title, description = "", visibility = "public" }) {
  const timestamp = new Date().toISOString();
  return {
    id,
    userId,
    title,
    description,
    visibility,
    videoIds: [],
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
