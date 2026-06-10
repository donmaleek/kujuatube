import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("schema defines required core tables", () => {
  const schema = fs.readFileSync(new URL("../../database/schema/schema.sql", import.meta.url), "utf8");

  for (const table of ["users", "videos", "comments", "subscriptions", "playlists", "likes", "watch_history", "reports"]) {
    assert.match(schema, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
  }
});
