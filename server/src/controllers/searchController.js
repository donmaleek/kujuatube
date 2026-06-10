import { listVideos } from "../services/videoProcessingService.js";

export function index(req, res) {
  return res.json({ videos: listVideos(req.query) });
}
