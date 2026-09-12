import { NextResponse } from "next/server";

import { cookiePrefix } from "@/lib/app-config";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

// Auth cookies are `<prefix>.<purpose>`, gaining a `__Secure-` prefix on HTTPS.
const isAuthCookie = (name) =>
  name.startsWith(`${cookiePrefix}.`) ||
  name.startsWith(`__Secure-${cookiePrefix}.`);

// Protected routes are guarded by src/app/(protected)/layout.js, which reads
// the session directly — no need to duplicate that check (and its round trip)
// here.
const authRoutes = ["/login", "/register"];

export default async function proxy(request) {
  const pathname = request.nextUrl.pathname;

  let session = null;

  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch (error) {
    // A failed lookup reads as "signed out" below and clears the auth cookies.
    logger.warn("Session lookup failed in proxy", {
      error: error.message,
      status: error.status,
      path: pathname,
    });
  }

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();

  // Reaching an auth route without a valid session means any auth cookie still
  // present is stale — expired, or a half-finished 2FA challenge. Clearing it
  // here replaces the signOut() call the login/register forms used to fire from
  // a mount effect, which cost a round trip on every visit and would sign out a
  // valid session whenever the check above failed to see it.
  if (isAuthRoute && !session) {
    for (const { name } of request.cookies.getAll()) {
      if (isAuthCookie(name)) {
        // `__Secure-` cookies are only removable by a Secure Set-Cookie.
        response.cookies.set(name, "", {
          maxAge: 0,
          path: "/",
          secure: name.startsWith("__Secure-"),
        });
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/login", "/register"],
};
