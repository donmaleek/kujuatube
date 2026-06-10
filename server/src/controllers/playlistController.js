import { createId, db, persistDb, publicVideo } from "../config/database.js";
import { createPlaylistModel } from "../models/Playlist.js";
import { HttpError, sendCreated } from "../utils/http.js";

function serializePlaylist(playlist) {
  const videos = playlist.videoIds
    .map((videoId) => db.videos.find((video) => video.id === videoId))
    .filter(Boolean)
    .map(publicVideo);

  return {
    ...playlist,
    videos,
    videoCount: videos.length
  };
}

export function index(req, res) {
  const playlists = db.playlists
    .filter((playlist) => playlist.visibility === "public" || playlist.userId === req.user?.id)
    .map(serializePlaylist);

  return res.json({ playlists });
}

export function store(req, res) {
  const playlist = createPlaylistModel({
    id: createId("playlist"),
    userId: req.user.id,
    title: req.body.title,
    description: req.body.description,
    visibility: req.body.visibility
  });

  db.playlists.unshift(playlist);
  persistDb();
  return sendCreated(res, serializePlaylist(playlist));
}

export function addVideo(req, res) {
  const playlist = db.playlists.find((item) => item.id === req.params.playlistId);
  if (!playlist) throw new HttpError(404, "Playlist not found");
  if (playlist.userId !== req.user.id) throw new HttpError(403, "Cannot edit this playlist");
  if (!db.videos.some((video) => video.id === req.body.videoId)) throw new HttpError(404, "Video not found");
  if (!playlist.videoIds.includes(req.body.videoId)) playlist.videoIds.push(req.body.videoId);

  playlist.updatedAt = new Date().toISOString();
  persistDb();
  return res.json(serializePlaylist(playlist));
}
