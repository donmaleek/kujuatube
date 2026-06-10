import { createId, db, findUserById, persistDb, publicVideo } from "../config/database.js";
import { queueNotification } from "./notificationService.js";
import { createVideoModel } from "../models/Video.js";
import { HttpError } from "../utils/http.js";

export function listVideos({ q = "", category = "", sort = "newest", channelId = "" } = {}) {
  const query = q.toLowerCase();
  let videos = db.videos
    .filter((video) => video.visibility === "public")
    .filter((video) => !channelId || video.channelId === channelId || video.userId === channelId)
    .filter((video) => !category || video.category === category)
    .filter((video) => {
      if (!query) return true;
      return [video.title, video.description, video.category, video.channelName].join(" ").toLowerCase().includes(query);
    });

  if (sort === "views") videos = videos.sort((a, b) => b.views - a.views);
  else if (sort === "relevance" && q) videos = videos.sort((a, b) => b.likes + b.views - (a.likes + a.views));
  else videos = videos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return videos.map(publicVideo);
}

export function getVideoById(videoId) {
  const video = db.videos.find((item) => item.id === videoId && item.visibility !== "private");
  if (!video) throw new HttpError(404, "Video not found");

  video.views += 1;
  persistDb();
  return publicVideo(video);
}

export function createVideo(userId, payload) {
  const owner = findUserById(userId);
  if (!owner) throw new HttpError(404, "Owner not found");

  const video = createVideoModel({
    id: createId("video"),
    userId,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    visibility: payload.visibility,
    videoUrl: payload.videoUrl,
    thumbnailUrl: payload.thumbnailUrl,
    duration: payload.duration
  });

  video.channelName = owner.name;
  video.channelHandle = owner.email.split("@")[0];
  video.subscribers = db.subscriptions.filter((item) => item.channelId === owner.id).length;
  db.videos.unshift(video);
  persistDb();

  db.subscriptions
    .filter((s) => s.channelId === userId)
    .forEach((s) => {
      queueNotification({
        userId: s.userId,
        type: "new_video",
        title: `${video.channelName} posted a new video`,
        body: video.title,
        videoId: video.id,
        channelName: video.channelName,
        thumbnailUrl: video.thumbnailUrl || ""
      });
    });

  return publicVideo(video);
}

export function updateVideoStatus(videoId, status) {
  const video = db.videos.find((item) => item.id === videoId);
  if (!video) throw new HttpError(404, "Video not found");
  video.status = status;
  video.updatedAt = new Date().toISOString();
  persistDb();
  return publicVideo(video);
}
