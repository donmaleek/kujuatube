import test from "node:test";
import assert from "node:assert/strict";
import { generateToken, verifyToken } from "../../server/src/utils/generateToken.js";
import { hashPasswordSync, verifyPassword } from "../../server/src/utils/hashPassword.js";

test("hashPasswordSync hashes and verifies passwords", () => {
  const hash = hashPasswordSync("Password123!", "test-salt");
  assert.equal(verifyPassword("Password123!", hash), true);
  assert.equal(verifyPassword("wrong-password", hash), false);
});

test("generateToken creates a signed token that can be verified", () => {
  const token = generateToken({ sub: "user-1", role: "admin" }, 60);
  const payload = verifyToken(token);

  assert.equal(payload.sub, "user-1");
  assert.equal(payload.role, "admin");
});
