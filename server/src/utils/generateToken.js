import crypto from "node:crypto";
import { env } from "../config/env.js";

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(data) {
  return crypto.createHmac("sha256", env.jwtSecret).update(data).digest("base64url");
}

export function generateToken(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds
  });
  const signature = sign(`${header}.${body}`);

  return `${header}.${body}.${signature}`;
}

export function verifyToken(token = "") {
  const [header, body, signature] = token.split(".");
  if (!header || !body || !signature) return null;

  const expected = sign(`${header}.${body}`);
  if (Buffer.byteLength(signature) !== Buffer.byteLength(expected)) return null;
  const valid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}
