import crypto from "node:crypto";

const ITERATIONS = 120_000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export function hashPasswordSync(password, salt = crypto.randomBytes(16).toString("hex")) {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${ITERATIONS}:${salt}:${hash}`;
}

export function verifyPassword(password, storedHash = "") {
  const [iterationsRaw, salt, expected] = storedHash.split(":");
  const iterations = Number(iterationsRaw);

  if (!iterations || !salt || !expected) return false;

  const actual = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, DIGEST).toString("hex");
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}
