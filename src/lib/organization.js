import "server-only";

import { APIError } from "better-auth/api";

import { db } from "./db";

/**
 * The organization a new session should start in: the one the user last had
 * active, as long as they still belong to it, otherwise the one they joined
 * first. `null` when they belong to none — the protected layout then sends them
 * to onboarding.
 */
export async function defaultOrganizationId(userId) {
  const [memberships, lastSession] = await Promise.all([
    db.member.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { organizationId: true },
    }),
    db.session.findFirst({
      where: { userId, activeOrganizationId: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: { activeOrganizationId: true },
    }),
  ]);

  const ids = memberships.map((m) => m.organizationId);
  const last = lastSession?.activeOrganizationId;

  return ids.includes(last) ? last : (ids[0] ?? null);
}

/**
 * Runs before any user row is deleted — self-service deletion and the admin
 * plugin's removeUser alike — so no organization is left without an owner.
 * Organizations the user is alone in go with them; one that still has other
 * members but no other owner blocks the deletion until ownership moves.
 */
export async function releaseOwnedOrganizations(userId) {
  const owned = await db.member.findMany({
    where: { userId, role: "owner" },
    select: {
      organization: {
        select: {
          id: true,
          name: true,
          members: {
            where: { userId: { not: userId } },
            select: { role: true },
          },
        },
      },
    },
  });

  const blocking = owned.filter(
    ({ organization: { members } }) =>
      members.length > 0 && !members.some((m) => m.role === "owner"),
  );

  if (blocking.length) {
    const names = blocking.map(({ organization }) => organization.name);
    throw new APIError("BAD_REQUEST", {
      message: `Transfer ownership of ${names.join(", ")} before deleting this account.`,
    });
  }

  const solo = owned
    .filter(({ organization: { members } }) => members.length === 0)
    .map(({ organization }) => organization.id);

  if (solo.length) {
    await db.organization.deleteMany({ where: { id: { in: solo } } });
  }
}
