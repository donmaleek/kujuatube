import { createVideo, getVideoById, listVideos } from "../services/videoProcessingService.js";
import { getRecommendations } from "../services/recommendationService.js";
import { env } from "../config/env.js";
import { sendCreated } from "../utils/http.js";

function resolveBaseUrl(req) {
  // Prefer explicit env var; fall back to public-facing host from proxy headers
  if (env.publicBaseUrl && !env.publicBaseUrl.includes("localhost")) {
    return env.publicBaseUrl.replace(/\/$/, "");
  }
  const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  return `${proto}://${host}`;
}

function uploadedFileUrl(req, file) {
  if (!file?.filename) return "";
  return `${resolveBaseUrl(req)}/uploads/${encodeURIComponent(file.filename)}`;
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
    videoUrl: uploadedFileUrl(req, videoFile) || req.body.videoUrl,
    thumbnailUrl: uploadedFileUrl(req, thumbnailFile) || req.body.thumbnailUrl
  };

  return sendCreated(res, createVideo(req.user.id, payload));
}

export function recommendations(req, res) {
  return res.json({ videos: getRecommendations(req.params.videoId) });
}
