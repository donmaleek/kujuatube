import { apiRequest } from "./api.js";

export function listComments(videoId) {
  return apiRequest(`/api/comments?videoId=${encodeURIComponent(videoId)}`);
}

export function addComment(videoId, body) {
  return apiRequest("/api/comments", {
    method: "POST",
    body: JSON.stringify({ videoId, body })
  });
}
