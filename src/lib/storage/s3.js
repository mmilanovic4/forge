import "server-only";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { s3Config } from "./config";

let cachedClient;
function client() {
  if (cachedClient) return cachedClient;
  const cfg = s3Config();
  cachedClient = new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint,
    forcePathStyle: !!cfg.endpoint, // Required by most S3-compatible services (R2/MinIO)
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
  return cachedClient;
}

export async function put({ key, body, contentType }) {
  await client().send(
    new PutObjectCommand({
      Bucket: s3Config().bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

export async function get(key) {
  const res = await client().send(
    new GetObjectCommand({ Bucket: s3Config().bucket, Key: key }),
  );

  return {
    body: res.Body.transformToWebStream(),
    contentType: res.ContentType,
    size: res.ContentLength,
  };
}

export async function remove(key) {
  await client().send(
    new DeleteObjectCommand({ Bucket: s3Config().bucket, Key: key }),
  );
}
