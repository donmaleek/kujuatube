import test from "node:test";
import assert from "node:assert/strict";
import { db } from "../../server/src/config/database.js";
import { createVideo, getVideoById, listVideos } from "../../server/src/services/videoProcessingService.js";

test("listVideos returns public videos", () => {
  const result = listVideos();
  assert.ok(result.length >= 1);
  assert.ok(result.every((video) => video.visibility === "public"));
});

test("createVideo creates a public video for a user", () => {
  const before = db.videos.length;
  const video = createVideo("user-1", {
    title: "Unit Test Video",
    description: "Created by tests",
    category: "Education",
    visibility: "public"
  });

  assert.equal(db.videos.length, before + 1);
  assert.equal(video.title, "Unit Test Video");
});

test("getVideoById increments view count", () => {
  const before = db.videos.find((video) => video.id === "video-1").views;
  const video = getVideoById("video-1");
  assert.equal(video.views, before + 1);
});
