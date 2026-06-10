import { createVideo, getVideoById, listVideos } from "../services/videoProcessingService.js";
import { getRecommendations } from "../services/recommendationService.js";
import { env } from "../config/env.js";
import { sendCreated } from "../utils/http.js";

function uploadedFileUrl(file) {
  if (!file?.filename) return "";
  return `${env.publicBaseUrl.replace(/\/$/, "")}/uploads/${encodeURIComponent(file.filename)}`;
}

export function index(req, res) {
  return res.json({ videos: listVideos(req.query) });
}

export function show(req, res) {
  return res.json(getVideoById(req.params.videoId));
}

export function store(req, res) {
  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];
  const payload = {
    ...req.body,
    videoUrl: uploadedFileUrl(videoFile) || req.body.videoUrl,
    thumbnailUrl: uploadedFileUrl(thumbnailFile) || req.body.thumbnailUrl
  };

  return sendCreated(res, createVideo(req.user.id, payload));
}

export function recommendations(req, res) {
  return res.json({ videos: getRecommendations(req.params.videoId) });
}
