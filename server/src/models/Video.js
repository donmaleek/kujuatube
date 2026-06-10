export function createVideoModel({
  id,
  userId,
  title,
  description = "",
  category = "Education",
  visibility = "public",
  videoUrl = "",
  thumbnailUrl = "",
  duration = "0:00"
}) {
  const timestamp = new Date().toISOString();
  return {
    id,
    userId,
    channelId: userId,
    title,
    description,
    category,
    visibility,
    status: "ready",
    videoUrl,
    thumbnailUrl,
    duration,
    views: 0,
    likes: 0,
    dislikes: 0,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}
