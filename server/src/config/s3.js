import { env } from "./env.js";

export const s3Config = {
  bucket: env.s3Bucket,
  enabled: Boolean(env.s3Bucket),
  publicBaseUrl: env.publicBaseUrl
};
