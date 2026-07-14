import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

if (!globalForPrisma.prismaConnectionChecked) {
  globalForPrisma.prismaConnectionChecked = true;
  db.$queryRaw`SELECT 1`.catch((error) => {
    console.error("Database connection failed, shutting down:", error);
    process.exit(1);
  });
}
