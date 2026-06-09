import { apiRequest } from "./api.js";

export function createCommunityPost(payload) {
  return apiRequest("/api/creator/posts", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function createLiveRoom(payload) {
  return apiRequest("/api/creator/live", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function createLaunchKit(payload) {
  return apiRequest("/api/creator/launch-kit", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
