import { apiRequest } from "./api.js";

export function getNotifications() {
  return apiRequest("/api/notifications");
}

export function markAllNotificationsRead() {
  return apiRequest("/api/notifications/read-all", { method: "POST" });
}
