import { createId, db, persistDb, publicVideo } from "../config/database.js";
import { createWatchHistoryModel } from "../models/WatchHistory.js";
import { HttpError, sendCreated } from "../utils/http.js";

export function index(req, res) {
  const history = db.watchHistory
    .filter((item) => item.userId === req.user.id)
    .map((item) => ({
      ...item,
      video: db.videos.find((video) => video.id === item.videoId)
    }))
    .filter((item) => item.video)
    .map((item) => ({ ...item, video: publicVideo(item.video) }));

  return res.json({ history });
}

export function store(req, res) {
  if (!db.videos.some((video) => video.id === req.body.videoId)) throw new HttpError(404, "Video not found");

  const item = createWatchHistoryModel({
    id: createId("history"),
    userId: req.user.id,
    videoId: req.body.videoId
  });

  db.watchHistory.unshift(item);
  persistDb();
  return sendCreated(res, item);
}
