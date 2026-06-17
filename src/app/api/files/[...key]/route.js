import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { storage } from "@/lib/storage";

export async function GET(_, ctx) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return new Response("You must be signed in to view this file.", {
      status: 401,
    });
  }

  const { key } = await ctx.params;
  const path = key.join("/");

  try {
    const { body, contentType, size } = await storage.get(path);

    const respHeaders = {
      "Content-Type": contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    if (size) respHeaders["Content-Length"] = String(size);

    return new Response(body, { headers: respHeaders });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
