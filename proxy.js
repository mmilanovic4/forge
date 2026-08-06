import { NextResponse } from "next/server";

import { betterFetch } from "@better-fetch/fetch";

import { cookiePrefix } from "@/lib/app-config";

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

  const { data: session } = await betterFetch("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") ?? "",
    },
  });

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
