"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { avatarPrefix, FILES_URL_PREFIX } from "@/lib/files";
import { getSession } from "@/lib/session";
import { IMAGE_TYPES, removeAvatarFile, uploadFile } from "@/lib/upload";

// Upload and swap in one step, so the avatar it replaces can be deleted — done
// from the client, the old object was simply left behind in the bucket.
export async function uploadAvatarAction(_, formData) {
  const hdrs = await headers();
  const session = await getSession();
  if (!session?.user) {
    return { error: "You must be signed in to upload." };
  }

  const { id: userId, image: previous } = session.user;

  let url;
  try {
    const { key } = await uploadFile(formData.get("file"), {
      prefix: avatarPrefix(userId),
      allowedTypes: IMAGE_TYPES,
      maxSize: 5 * 1024 * 1024,
    });
    url = `${FILES_URL_PREFIX}${key}`;
  } catch (err) {
    return { error: err.message ?? "Upload failed." };
  }

  try {
    await auth.api.updateUser({ body: { image: url }, headers: hdrs });
  } catch (err) {
    // Nothing points at the new file, so don't keep it.
    await removeAvatarFile(userId, url);
    return { error: err.message ?? "Could not update avatar." };
  }

  await removeAvatarFile(userId, previous);
  return { url };
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

  await removeAvatarFile(userId, image);
  return { ok: true };
}
