import { API_BASE_URL } from "../utils/constants.js";

let authToken = localStorage.getItem("kujuatime.token") || "";

export function setAuthToken(token) {
  authToken = token || "";
  if (authToken) {
    localStorage.setItem("kujuatime.token", authToken);
  } else {
    localStorage.removeItem("kujuatime.token");
  }
}

export function getAuthToken() {
  return authToken;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers || {})
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === "object" && body?.error ? body.error : "Request failed";
    throw new Error(message);
  }

  return body;
}
