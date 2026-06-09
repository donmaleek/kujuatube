import { apiRequest, setAuthToken } from "./api.js";

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
