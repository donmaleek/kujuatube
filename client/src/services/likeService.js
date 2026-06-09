import { apiRequest, getAuthToken } from "./api.js";

export function fetchMyLike(videoId) {
  if (!getAuthToken()) return Promise.resolve({ likes: [] });
  return apiRequest(`/api/likes?videoId=${encodeURIComponent(videoId)}&mine=true`);
}

export function likeVideo(videoId) {
  return apiRequest("/api/likes", {
    method: "POST",
    body: JSON.stringify({ videoId, value: 1 })
  });
}

export function dislikeVideo(videoId) {
  return apiRequest("/api/likes", {
    method: "POST",
    body: JSON.stringify({ videoId, value: -1 })
  });
}

export function removeLike(videoId) {
  return apiRequest(`/api/likes/${encodeURIComponent(videoId)}`, { method: "DELETE" });
}
