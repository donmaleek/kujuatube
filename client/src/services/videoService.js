import { apiRequest } from "./api.js";

export function listVideos(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/api/videos${query ? `?${query}` : ""}`);
}

export function getVideo(videoId) {
  return apiRequest(`/api/videos/${videoId}`);
}

export function createVideo(payload) {
  return apiRequest("/api/videos", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getTrendingVideos() {
  return apiRequest("/api/trending");
}
