import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { organizationsEnabled } from "./app-config";
import { auth } from "./auth";
import { db } from "./db";
import { defaultOrganizationId } from "./organization";

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

/**
 * The caller's active organization and their membership in it, or `null` when
 * organizations are switched off. Users without one are sent to onboarding —
 * this is the gate that makes membership mandatory.
 *
 * The session's activeOrganizationId is only a hint: it can point at an
 * organization the user has since left, been removed from, or that was
 * deleted. Membership is re-checked here, and a stale value is replaced.
 */
export const requireActiveOrganization = cache(async () => {
  const session = await requireSession();

  if (!organizationsEnabled) return null;

  const userId = session.user.id;
  const findMember = (organizationId) =>
    organizationId &&
    db.member.findUnique({
      where: { organizationId_userId: { organizationId, userId } },
      include: { organization: true },
    });

  let member = await findMember(session.session.activeOrganizationId);

  if (!member) {
    const organizationId = await defaultOrganizationId(userId);
    if (!organizationId) redirect("/onboarding");

    member = await findMember(organizationId);
    await db.session.update({
      where: { id: session.session.id },
      data: { activeOrganizationId: organizationId },
    });
  }

  const { organization, ...membership } = member;
  return { organization, member: membership };
});
