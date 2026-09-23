import { logger } from "@/lib/logger";
import { getSession } from "@/lib/session";
import { storage } from "@/lib/storage";
import { canReadFile } from "@/lib/upload";

const notFound = () => new Response("Not found", { status: 404 });

export async function GET(_, ctx) {
  const session = await getSession();
  if (!session?.user) {
    return new Response("You must be signed in to view this file.", {
      status: 401,
    });
  }

  const { key } = await ctx.params;
  const path = key.join("/");

  // 404 rather than 403, so a key outside the caller's reach can't be told
  // apart from one that doesn't exist.
  if (!(await canReadFile(session.user.id, path))) {
    return notFound();
  }

  try {
    const { body, contentType, size } = await storage.get(path);

    const respHeaders = {
      "Content-Type": contentType || "application/octet-stream",
      "Cache-Control": "private, max-age=31536000, immutable",
      // Served from the app's own origin, so never let a browser second-guess
      // the type or run anything the file contains.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    };
    if (size) respHeaders["Content-Length"] = String(size);

    return new Response(body, { headers: respHeaders });
  } catch (err) {
    // A missing key is an expected 404; anything else means storage is failing.
    if (err.name !== "NoSuchKey") {
      logger.error("Failed to read file from storage", { err, key: path });
    }
    return notFound();
  }
}
