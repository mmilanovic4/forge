"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { avatarPrefix, FILES_URL_PREFIX } from "@/lib/files";
import { logger } from "@/lib/logger";
import { getSession } from "@/lib/session";
import { storage } from "@/lib/storage";
import { IMAGE_TYPES, uploadFile } from "@/lib/upload";

export async function uploadImageAction(_, formData) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "You must be signed in to upload." };
  }

  try {
    const { key } = await uploadFile(formData.get("file"), {
      prefix: avatarPrefix(session.user.id),
      allowedTypes: IMAGE_TYPES,
      maxSize: 5 * 1024 * 1024,
    });
    return { key, url: `${FILES_URL_PREFIX}${key}` };
  } catch (err) {
    return { error: err.message ?? "Upload failed." };
  }
}

// Takes no argument on purpose: the only avatar a user may remove is their
// own current one, read from the session rather than trusted from the client.
export async function removeAvatarAction() {
  const hdrs = await headers();
  const session = await getSession();
  if (!session?.user) {
    return { error: "You must be signed in to remove your avatar." };
  }

  const { id: userId, image } = session.user;

  try {
    await auth.api.updateUser({ body: { image: null }, headers: hdrs });
  } catch (err) {
    return { error: err.message ?? "Could not remove avatar." };
  }

  const key = image?.startsWith(FILES_URL_PREFIX)
    ? image.slice(FILES_URL_PREFIX.length)
    : null;

  if (key?.startsWith(`${avatarPrefix(userId)}/`)) {
    try {
      await storage.remove(key);
    } catch (err) {
      // Not an error for the caller, but it leaves an orphaned object behind.
      logger.warn("Failed to remove file", { err, key, userId });
    }
  }

  return { ok: true };
}
