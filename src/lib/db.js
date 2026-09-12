import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

import { logger } from "./logger";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

function createClient() {
  const client = new PrismaClient({
    adapter,
    log: [
      { emit: "event", level: "warn" },
      { emit: "event", level: "error" },
    ],
  });
  client.$on("warn", (e) =>
    logger.warn(e.message, { source: "prisma", target: e.target }),
  );
  client.$on("error", (e) =>
    logger.error(e.message, { source: "prisma", target: e.target }),
  );
  return client;
}

const globalForPrisma = globalThis;

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
