import path from "node:path";
import fs from "node:fs";
import { createVideo, getVideoById, listVideos, listMyVideos, updateVideo, deleteVideo } from "../services/videoProcessingService.js";
import { getRecommendations } from "../services/recommendationService.js";
import { env } from "../config/env.js";
import { sendCreated, HttpError } from "../utils/http.js";
import { processImage } from "../utils/imageProcess.js";
import { faststartVideo } from "../utils/videoProcess.js";

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

export async function store(req, res) {
  const videoFile = req.files?.video?.[0];
  const thumbnailFile = req.files?.thumbnail?.[0];
  const uploadDir = path.resolve(env.uploadDir);

  // Run both optimizations in parallel — thumbnail resize and video faststart
  await Promise.all([
    thumbnailFile
      ? processImage(path.join(uploadDir, thumbnailFile.filename), { width: 1280, height: 720, fit: "inside" })
          .then((out) => { thumbnailFile.filename = path.basename(out); })
      : Promise.resolve(),
    videoFile
      ? faststartVideo(path.join(uploadDir, videoFile.filename))
      : Promise.resolve()
  ]);

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

export function my(req, res) {
  return res.json({ videos: listMyVideos(req.user.id) });
}

export async function update(req, res) {
  const thumbnailFile = req.files?.thumbnail?.[0];
  const uploadDir = path.resolve(env.uploadDir);

  if (thumbnailFile) {
    await processImage(path.join(uploadDir, thumbnailFile.filename), { width: 1280, height: 720, fit: "inside" })
      .then((out) => { thumbnailFile.filename = path.basename(out); })
      .catch(() => {});
  }

  const payload = {
    ...req.body,
    ...(thumbnailFile ? { thumbnailUrl: uploadedFileUrl(req, thumbnailFile) } : {})
  };

  return res.json(updateVideo(req.params.videoId, req.user.id, payload));
}

export function destroy(req, res) {
  deleteVideo(req.params.videoId, req.user.id, path.resolve(env.uploadDir));
  return res.json({ ok: true });
}
