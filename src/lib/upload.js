import "server-only";

import { organizationsEnabled } from "./app-config";
import { db } from "./db";
import { avatarPrefix } from "./files";
import { logger } from "./logger";
import { storage } from "./storage";

const EXT_BY_TYPE = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const IMAGE_TYPES = Object.keys(EXT_BY_TYPE);

// `file.type` is whatever the browser — or a hand-crafted request — claims, so
// images are identified by their leading bytes instead.
function detectImageType(buffer) {
  const startsWith = (bytes, offset = 0) =>
    bytes.every((byte, i) => buffer[offset + i] === byte);

  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    return "image/png";
  if (startsWith([0x47, 0x49, 0x46, 0x38])) return "image/gif";
  // "RIFF" <size> "WEBP"
  if (
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    startsWith([0x57, 0x45, 0x42, 0x50], 8)
  )
    return "image/webp";
  return null;
}

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
  // Anything that claims to be an image has to actually be one.
  const contentType =
    detectImageType(buffer) ??
    (IMAGE_TYPES.includes(file.type)
      ? null
      : file.type || "application/octet-stream");

  if (!contentType || (allowedTypes && !allowedTypes.includes(contentType))) {
    throw new Error("Unsupported file type.");
  }

  const ext = EXT_BY_TYPE[contentType] ?? "bin";
  const key = `${prefix}/${crypto.randomUUID()}.${ext}`;

  try {
    await storage.put({ key, body: buffer, contentType });
  } catch (err) {
    logger.error("Failed to store uploaded file", {
      err,
      key,
      contentType,
      size: file.size,
    });
    // Callers surface this message to the user, so keep storage internals out.
    throw new Error("Upload failed. Please try again.", { cause: err });
  }

  return { key, contentType };
}

/**
 * Whether `userId` may read the object at `key`. Avatars are visible to their
 * owner and to anyone who can see the owner elsewhere in the app: everyone
 * when the app is single-tenant, otherwise members of a shared organization.
 * Keys outside a known layout are refused.
 */
export async function canReadFile(userId, key) {
  const [, ownerId, name, ...rest] = key.split("/");
  if (!ownerId || !name || rest.length) return false;
  if (!key.startsWith(`${avatarPrefix(ownerId)}/`)) return false;

  if (ownerId === userId || !organizationsEnabled) return true;

  const shared = await db.member.findFirst({
    where: {
      userId: ownerId,
      organization: { members: { some: { userId } } },
    },
    select: { id: true },
  });
  return !!shared;
}
