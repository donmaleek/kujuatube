import { s3Config } from "../config/s3.js";

export async function uploadToS3(file) {
  if (!s3Config.enabled) {
    return {
      provider: "local",
      url: `${s3Config.publicBaseUrl}/uploads/${file.filename || file.originalname}`
    };
  }

  return {
    provider: "s3",
    bucket: s3Config.bucket,
    key: file.filename || file.originalname,
    url: `https://${s3Config.bucket}.s3.amazonaws.com/${file.filename || file.originalname}`
  };
}
