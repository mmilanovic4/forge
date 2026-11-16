import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./auth";
import { isAdmin } from "./user";

// Deduped per request, so a page and the queries it triggers share one lookup
// instead of hitting the session store once each.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

// Defense in depth. (protected)/layout.js already redirects visitors without a
// session, but layouts are not guaranteed to re-run on client-side navigation
// between routes that share them — so every query verifies its own caller
// rather than trusting that a guard higher up ran.
export async function requireSession() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

// For anything only a global admin may see or do. Everyone else gets a 404
// rather than a redirect, so the page doesn't confirm it exists.
export async function requireAdmin() {
  const session = await requireSession();

  if (!isAdmin(session.user)) {
    notFound();
  }

  return session;
}
