import "server-only";

import { organizationsEnabled } from "./app-config";
import { db } from "./db";
import { requireAdmin, requireSession } from "./session";

// Every account in the app, for the admin's user management. The rows carry
// each account's email, role and ban status, so admins only — what members may
// see of one another is in lib/organization/queries.js.
export async function listUsers({ search, limit, offset }) {
  await requireAdmin();

  const where = search
    ? { name: { contains: search, mode: "insensitive" } }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      where,
      take: limit,
      skip: offset,
      // Only what the table shows.
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
        ...(organizationsEnabled && {
          members: {
            orderBy: { createdAt: "asc" },
            select: { organization: { select: { id: true, name: true } } },
          },
        }),
      },
    }),
    db.user.count({ where }),
  ]);

  return {
    users: users.map(({ members = [], ...user }) => ({
      ...user,
      organizations: members.map((member) => member.organization),
    })),
    total,
  };
}

// App-wide numbers for the dashboard of a single-tenant app. With
// organizations on, the dashboard shows getOrganizationStats instead.
export async function getUserStats() {
  await requireSession();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, activeSessions, recent] = await Promise.all([
    db.user.count(),
    db.session.count({ where: { expiresAt: { gt: now } } }),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);

  return { total, activeSessions, recent };
}
