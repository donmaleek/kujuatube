import { API_BASE_URL } from "../utils/constants.js";
import { getAuthToken } from "./api.js";
import { createVideo } from "./videoService.js";

export async function uploadVideo(payload, onProgress = () => {}) {
  if (payload.videoFile || payload.thumbnailFile) {
    return uploadVideoFile(payload, onProgress);
  }

  onProgress(30);
  const video = await createVideo(payload);
  onProgress(100);
  return video;
}

function appendField(formData, field, value) {
  if (value === undefined || value === null || value === "") return;
  formData.append(field, value);
}

function parseUploadResponse(xhr) {
  const contentType = xhr.getResponseHeader("content-type") || "";
  if (!contentType.includes("application/json")) return xhr.responseText;

  try {
    return JSON.parse(xhr.responseText);
  } catch {
    return {};
  }
}

function getUploadErrorMessage(xhr, body) {
  if (xhr.status === 413) return "Upload is too large. Choose a video under 1 GB.";
  if (body && typeof body === "object" && body.error) return body.error;
  if (typeof body === "string" && body.trim()) {
    if (body.includes("Request Entity Too Large")) return "Upload is too large. Choose a video under 1 GB.";
    return body.trim();
  }

  return "Upload failed";
}

function uploadVideoFile(payload, onProgress) {
  const formData = new FormData();
  appendField(formData, "title", payload.title);
  appendField(formData, "description", payload.description);
  appendField(formData, "category", payload.category);
  appendField(formData, "visibility", payload.visibility);
  appendField(formData, "duration", payload.duration);
  appendField(formData, "videoUrl", payload.videoUrl);
  appendField(formData, "thumbnailUrl", payload.thumbnailUrl);

  if (payload.videoFile) formData.append("video", payload.videoFile);
  if (payload.thumbnailFile) formData.append("thumbnail", payload.thumbnailFile);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const apiBaseUrl = API_BASE_URL.replace(/\/$/, "");
    xhr.open("POST", `${apiBaseUrl}/api/videos`);

    const token = getAuthToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 95));
    };

    xhr.onload = () => {
      const body = parseUploadResponse(xhr);
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve(body);
        return;
      }

      reject(new Error(getUploadErrorMessage(xhr, body)));
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.onabort = () => reject(new Error("Upload canceled"));
    xhr.send(formData);
  });
}
