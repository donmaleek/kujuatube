import { apiRequest } from "./api.js";

export function listSubscriptions() {
  return apiRequest("/api/subscriptions");
}

export function subscribe(channelId) {
  return apiRequest("/api/subscriptions", {
    method: "POST",
    body: JSON.stringify({ channelId })
  });
}

export function unsubscribe(channelId) {
  return apiRequest(`/api/subscriptions/${channelId}`, {
    method: "DELETE"
  });
}
