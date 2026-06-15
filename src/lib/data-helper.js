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
