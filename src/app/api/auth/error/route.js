import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";

export function GET(request) {
  const error = new URL(request.url).searchParams.get("error");
  // better-auth lands here when an OAuth flow fails, e.g. a misconfigured
  // provider or a sign-in attempt for an account that doesn't exist.
  logger.warn("Auth flow failed", { error });
  const url = new URL("/auth-error", request.url);
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}
