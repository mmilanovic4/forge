import { db } from "@/lib/db";

try {
  await db.$queryRaw`SELECT 1`;
} catch (error) {
  const fs = await import("node:fs");
  fs.writeSync(
    2,
    `Database connection check failed, shutting down: ${error.stack ?? error}\n`,
  );
  process.exit(1);
}
