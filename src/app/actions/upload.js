"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { storage } from "@/lib/storage";
import { IMAGE_TYPES, uploadFile } from "@/lib/upload";

export async function uploadImageAction(_, formData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { error: "You must be signed in to upload." };
  }

  try {
    const { key } = await uploadFile(formData.get("file"), {
      prefix: "avatars",
      allowedTypes: IMAGE_TYPES,
      maxSize: 5 * 1024 * 1024,
    });
    return { key, url: `/api/files/${key}` };
  } catch (err) {
    return { error: err.message ?? "Upload failed." };
  }
}

export async function removeImageAction(url) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return { error: "You must be signed in to remove a file." };
  }

  const prefix = "/api/files/";
  if (typeof url === "string" && url.startsWith(prefix)) {
    const key = url.slice(prefix.length);
    try {
      await storage.remove(key);
    } catch (err) {
      // Not an error for the caller, but it leaves an orphaned object behind.
      logger.warn("Failed to remove file", {
        err,
        key,
        userId: session.user.id,
      });
    }
  }
  return { ok: true };
}
