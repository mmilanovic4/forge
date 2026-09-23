import "server-only";

import { db } from "./db";
import { requireActiveOrganization, requireSession } from "./session";

// With organizations on, a user only ever sees the members of their active
// organization. Without them the app is single-tenant, so everyone is visible.
async function userScope() {
  const scope = await requireActiveOrganization();
  return scope
    ? { members: { some: { organizationId: scope.organization.id } } }
    : {};
}

export async function listUsers({ search, limit, offset }) {
  await requireSession();

  const scope = await requireActiveOrganization();
  const where = {
    ...(await userScope()),
    ...(search && { name: { contains: search, mode: "insensitive" } }),
  };

  const [users, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      where,
      take: limit,
      skip: offset,
      // Only what the table shows: every other member can read this, so the
      // row mustn't carry anything about how an account is secured.
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        role: true,
        banned: true,
        createdAt: true,
        // The member row carries the organization role.
        ...(scope && {
          members: {
            where: { organizationId: scope.organization.id },
            select: { role: true },
          },
        }),
      },
    }),
    db.user.count({ where }),
  ]);

  return {
    users: users.map(({ members, ...user }) => ({
      ...user,
      membership: members?.[0] ?? null,
    })),
    total,
  };
}

export async function getUserStats() {
  await requireSession();

  const scope = await requireActiveOrganization();
  const users = await userScope();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, activeSessions, newUsers] = await Promise.all([
    db.user.count({ where: users }),
    db.session.count({
      where: { expiresAt: { gt: now }, ...(scope && { user: users }) },
    }),
    scope
      ? db.member.count({
          where: {
            organizationId: scope.organization.id,
            createdAt: { gte: weekAgo },
          },
        })
      : db.user.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);

  return { totalUsers, activeSessions, newUsers };
}

export async function listUserOrganizations() {
  const session = await requireSession();

  const memberships = await db.member.findMany({
    where: { userId: session.user.id },
    orderBy: { organization: { name: "asc" } },
    select: { role: true, organization: { select: { id: true, name: true } } },
  });

  return memberships.map(({ role, organization }) => ({
    ...organization,
    role,
  }));
}

// Pending, unexpired invitations addressed to the signed-in user.
export async function listPendingInvitations() {
  const session = await requireSession();

  return db.invitation.findMany({
    where: {
      email: session.user.email.toLowerCase(),
      status: "pending",
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      role: true,
      organization: { select: { name: true } },
      user: { select: { name: true } },
    },
  });
}
