import test from "node:test";
import assert from "node:assert/strict";
import app from "../../server/src/app.js";

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => resolve(server));
  });
}

test("creator can authenticate and publish a video through the API", async () => {
  const server = await listen();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "demo@kujuatime.com", password: "Password123!" })
  });
  const session = await loginResponse.json();

  const createResponse = await fetch(`${baseUrl}/api/videos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`
    },
    body: JSON.stringify({
      title: "E2E Upload",
      description: "Published through the E2E flow",
      category: "Education",
      visibility: "public"
    })
  });
  const video = await createResponse.json();
  server.close();

  assert.equal(createResponse.status, 201);
  assert.equal(video.title, "E2E Upload");
});
