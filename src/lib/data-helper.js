import "server-only";

import { db } from "./db";

export async function listAllUsers({ search, limit, offset }) {
  const where = search
    ? { name: { contains: search, mode: "insensitive" } }
    : undefined;

  const [users, total] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      where,
      take: limit,
      skip: offset,
    }),
    db.user.count({ where }),
  ]);

  return { users, total };
}

export async function getUserStats() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totalUsers, activeSessions, newUsers] = await Promise.all([
    db.user.count(),
    db.session.count({ where: { expiresAt: { gt: now } } }),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);

  return { totalUsers, activeSessions, newUsers };
}
