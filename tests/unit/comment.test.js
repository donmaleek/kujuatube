import test from "node:test";
import assert from "node:assert/strict";
import { createCommentModel } from "../../server/src/models/Comment.js";

test("createCommentModel creates a comment with timestamps", () => {
  const comment = createCommentModel({
    id: "comment-test",
    videoId: "video-1",
    userId: "user-1",
    authorName: "Tester",
    body: "Looks good"
  });

  assert.equal(comment.videoId, "video-1");
  assert.equal(comment.body, "Looks good");
  assert.ok(comment.createdAt);
});
