import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import app from "../../server/src/app.js";
import { env } from "../../server/src/config/env.js";

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

test("health endpoint returns ok", async () => {
  const server = await listen();
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const body = await response.json();
  server.close();

  assert.equal(response.status, 200);
  assert.equal(body.status, "ok");
});

test("login and list videos flow works", async () => {
  const server = await listen();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@kujuatime.com", password: "Password123!" })
  });
  const session = await login.json();

  const videos = await fetch(`${baseUrl}/api/videos`);
  const videoBody = await videos.json();
  server.close();

  assert.equal(login.status, 200);
  assert.ok(session.token);
  assert.equal(videos.status, 200);
  assert.ok(videoBody.videos.length >= 1);
});

test("authenticated creator can upload a local video file", async () => {
  const server = await listen();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  let uploadedPath = "";

  try {
    const login = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@kujuatime.com", password: "Password123!" })
    });
    const session = await login.json();

    const formData = new FormData();
    formData.append("title", "Multipart Upload");
    formData.append("description", "Uploaded from a local test file");
    formData.append("category", "Education");
    formData.append("visibility", "public");
    formData.append("duration", "0:01");
    formData.append("video", new Blob([Buffer.from("fake mp4 content")], { type: "video/mp4" }), "sample.mp4");

    const response = await fetch(`${baseUrl}/api/videos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
      body: formData
    });
    const video = await response.json();
    uploadedPath = new URL(video.videoUrl, "http://localhost").pathname;

    assert.equal(response.status, 201);
    assert.equal(video.title, "Multipart Upload");
    assert.match(uploadedPath, /^\/uploads\/.+\.mp4$/);
  } finally {
    server.close();
    if (uploadedPath) {
      fs.rmSync(path.join(env.uploadDir, path.basename(uploadedPath)), { force: true });
    }
  }
});
