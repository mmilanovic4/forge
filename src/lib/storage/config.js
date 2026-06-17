import "server-only";

const requiredEnv = [
  "S3_BUCKET",
  "S3_REGION",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
];

const config = requiredEnv.every((key) => process.env[key])
  ? Object.freeze({
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      endpoint: process.env.S3_ENDPOINT || undefined, // Optional: R2 or MinIO
    })
  : null;

export const s3Enabled = config !== null;

export function s3Config() {
  if (!config) {
    throw new Error("S3 storage is not configured.");
  }
  return config;
}
