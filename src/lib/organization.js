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

// Organizations the user owns, with everyone else in them.
const ownedOrganizations = (userId) =>
  db.member.findMany({
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

/**
 * Refuses to delete a user who is the last owner of an organization that
 * still has other members — it would be left with nobody able to manage it.
 *
 * Must run before better-auth deletes anything: its deleteUser removes the
 * user's sessions and accounts (password included) before the user row, so a
 * check on the user row itself fires too late and strands a login-less user.
 */
export async function assertNoOrphanedOrganizations(userId) {
  const blocking = (await ownedOrganizations(userId)).filter(
    ({ organization: { members } }) =>
      members.length > 0 && !members.some((m) => m.role === "owner"),
  );

  if (blocking.length) {
    const names = blocking.map(({ organization }) => organization.name);
    throw new APIError("BAD_REQUEST", {
      message: `Transfer ownership of ${names.join(", ")} before deleting this account.`,
    });
  }
}

// Organizations the user is alone in go with them.
export async function deleteSoloOrganizations(userId) {
  const solo = (await ownedOrganizations(userId))
    .filter(({ organization: { members } }) => members.length === 0)
    .map(({ organization }) => organization.id);

  if (solo.length) {
    await db.organization.deleteMany({ where: { id: { in: solo } } });
  }
}
