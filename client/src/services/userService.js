import { API_BASE_URL } from "../utils/constants.js";
import { apiRequest, getAuthToken, setAuthToken } from "./api.js";

export async function login(credentials) {
  const result = await apiRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });

  setAuthToken(result.token);
  return result.user;
}

export async function signup(payload) {
  const result = await apiRequest("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  setAuthToken(result.token);
  return result.user;
}

export function getCurrentUser() {
  return apiRequest("/api/auth/me");
}

export function listUsers() {
  return apiRequest("/api/users");
}

export function logout() {
  setAuthToken("");
}

export function updateProfile(data) {
  return apiRequest("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(data)
  });
}

async function uploadFile(path, fieldname, file) {
  const formData = new FormData();
  formData.append(fieldname, file);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {},
    body: formData
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error || "Upload failed");
  return body;
}

export function uploadAvatar(file) {
  return uploadFile("/api/users/me/avatar", "avatar", file);
}

export function uploadBanner(file) {
  return uploadFile("/api/users/me/banner", "banner", file);
}
