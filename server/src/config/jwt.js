import { env } from "./env.js";

export const jwtConfig = {
  secret: env.jwtSecret,
  issuer: "kujuatime",
  audience: "kujuatime-client",
  expiresInSeconds: 60 * 60 * 24 * 7
};
