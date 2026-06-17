import "server-only";

import { storage } from "./storage";

const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const IMAGE_TYPES = Object.keys(EXT_BY_TYPE);

export async function uploadFile(
  file,
  { prefix = "uploads", allowedTypes, maxSize = 10 * 1024 * 1024 } = {},
) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new Error("No file provided.");
  }
  if (file.size === 0) {
    throw new Error("File is empty.");
  }
  if (file.size > maxSize) {
    throw new Error(
      `File is too large (max ${Math.round(maxSize / 1024 / 1024)}MB).`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = file.type;

  if (allowedTypes && !allowedTypes.includes(contentType)) {
    throw new Error("Unsupported file type.");
  }

  const ext = EXT_BY_TYPE[contentType] ?? "bin";
  const key = `${prefix}/${crypto.randomUUID()}.${ext}`;

  await storage.put({ key, body: buffer, contentType });

  return { key, contentType };
}
