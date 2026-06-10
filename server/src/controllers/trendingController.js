import { listVideos } from "../services/videoProcessingService.js";

export function index(_req, res) {
  return res.json({ videos: listVideos({ sort: "views" }).slice(0, 12) });
}
