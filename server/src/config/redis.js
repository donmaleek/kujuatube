import { env } from "./env.js";

export const redisConfig = {
  url: env.redisUrl,
  enabled: Boolean(env.redisUrl)
};
