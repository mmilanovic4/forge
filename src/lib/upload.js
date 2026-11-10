import "server-only";

import sharp from "sharp";

import { organizationsEnabled } from "./app-config";
import { db } from "./db";
import { UserError } from "./errors";
import { avatarPrefix, FILES_URL_PREFIX } from "./files";
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

// Longest edge of a stored avatar, in pixels. The largest one on screen is
// 40px, so this leaves plenty for high-density displays.
const AVATAR_MAX_EDGE = 512;

// Decoding is where an image costs memory, whatever its size on disk — a few
// kilobytes can declare a canvas of gigabytes. Counted across all frames of an
// animation.
const AVATAR_MAX_PIXELS = 100_000_000;

/**
 * Re-encodes an uploaded avatar, for use as uploadFile's `transform`.
 *
 * What a camera writes into a photo — GPS position, device, timestamps — would
 * otherwise be served to everyone who can see the avatar. sharp carries no
 * metadata over unless asked to, so re-encoding is what removes it;
 * `autoOrient()` first bakes the EXIF rotation into the pixels, which would
 * be lost along with the tag. The file that gets stored is also one this
 * server produced, not the bytes that were sent.
 */
export async function normalizeAvatar(buffer) {
  try {
    const output = await sharp(buffer, {
      animated: true,
      limitInputPixels: AVATAR_MAX_PIXELS,
    })
      .autoOrient()
      .resize({
        width: AVATAR_MAX_EDGE,
        height: AVATAR_MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    return { buffer: output, contentType: "image/webp" };
  } catch (err) {
    throw new UserError("That image could not be read. Try another file.", {
      cause: err,
    });
  }
}

/**
 * Validates and stores an uploaded file. `transform` gets the bytes and the
 * detected type once those checks have passed, and returns what to store in
 * their place. Rejections are UserErrors: their messages are meant for the
 * person uploading.
 */
export async function uploadFile(
  file,
  {
    prefix = "uploads",
    allowedTypes,
    maxSize = 10 * 1024 * 1024,
    transform,
  } = {},
) {
  if (!file || typeof file.arrayBuffer !== "function") {
    throw new UserError("No file provided.");
  }
  if (file.size === 0) {
    throw new UserError("File is empty.");
  }
  if (file.size > maxSize) {
    throw new UserError(
      `File is too large (max ${Math.round(maxSize / 1024 / 1024)}MB).`,
    );
  }

  const original = Buffer.from(await file.arrayBuffer());
  // Anything that claims to be an image has to actually be one.
  const detectedType =
    detectImageType(original) ??
    (IMAGE_TYPES.includes(file.type)
      ? null
      : file.type || "application/octet-stream");

  if (!detectedType || (allowedTypes && !allowedTypes.includes(detectedType))) {
    throw new UserError("Unsupported file type.");
  }

  const { buffer, contentType } = transform
    ? await transform(original, detectedType)
    : { buffer: original, contentType: detectedType };

  const ext = EXT_BY_TYPE[contentType] ?? "bin";
  const key = `${prefix}/${crypto.randomUUID()}.${ext}`;

  try {
    await storage.put({ key, body: buffer, contentType });
  } catch (err) {
    logger.error("Failed to store uploaded file", {
      err,
      key,
      contentType,
      size: buffer.length,
    });
    // Callers surface this message to the user, so keep storage internals out.
    throw new UserError("Upload failed. Please try again.", { cause: err });
  }

  return { key, contentType };
}

/**
 * Deletes the stored object behind a user's avatar URL, if it is one of their
 * own uploads — the prefix check keeps a stray value from ever reaching
 * someone else's file. A failure only leaves an orphan behind, so it's logged
 * rather than thrown.
 */
export async function removeAvatarFile(userId, imageUrl) {
  const key = imageUrl?.startsWith(FILES_URL_PREFIX)
    ? imageUrl.slice(FILES_URL_PREFIX.length)
    : null;
  if (!key?.startsWith(`${avatarPrefix(userId)}/`)) return;

  try {
    await storage.remove(key);
  } catch (err) {
    logger.warn("Failed to remove file", { err, key, userId });
  }
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
