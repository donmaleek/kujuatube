import { createId, db, persistDb } from "../config/database.js";
import { createLikeModel } from "../models/Like.js";
import { HttpError, sendCreated } from "../utils/http.js";

export function index(req, res) {
  let likes = db.likes.filter((like) => !req.query.videoId || like.videoId === req.query.videoId);
  if (req.query.mine === "true" && req.user) {
    likes = likes.filter((l) => l.userId === req.user.id);
  }
  return res.json({ likes });
}

export function store(req, res) {
  const { videoId, value = 1 } = req.body;
  const video = db.videos.find((item) => item.id === videoId);
  if (!video) throw new HttpError(404, "Video not found");

  const existing = db.likes.find((like) => like.userId === req.user.id && like.videoId === videoId);
  if (existing) {
    existing.value = Number(value) >= 0 ? 1 : -1;
    video.likes = db.likes.filter((item) => item.videoId === videoId && item.value === 1).length;
    video.dislikes = db.likes.filter((item) => item.videoId === videoId && item.value === -1).length;
    persistDb();
    return res.json(existing);
  }

  const like = createLikeModel({
    id: createId("like"),
    userId: req.user.id,
    videoId,
    value: Number(value) >= 0 ? 1 : -1
  });
  db.likes.push(like);
  video.likes = db.likes.filter((item) => item.videoId === videoId && item.value === 1).length;
  video.dislikes = db.likes.filter((item) => item.videoId === videoId && item.value === -1).length;
  persistDb();

  return sendCreated(res, { ...like, videoLikes: video.likes, videoDislikes: video.dislikes });
}

export function destroy(req, res) {
  const { videoId } = req.params;
  const video = db.videos.find((v) => v.id === videoId);
  const idx = db.likes.findIndex((l) => l.userId === req.user.id && l.videoId === videoId);
  if (idx !== -1) {
    db.likes.splice(idx, 1);
    if (video) {
      video.likes = db.likes.filter((l) => l.videoId === videoId && l.value === 1).length;
      video.dislikes = db.likes.filter((l) => l.videoId === videoId && l.value === -1).length;
    }
    persistDb();
  }
  return res.status(204).send();
}
