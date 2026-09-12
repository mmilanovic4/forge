import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

try {
  await db.$queryRaw`SELECT 1`;
} catch (err) {
  logger.error("Database connection check failed, shutting down", { err });
  // process.exit() can cut off pending writes when stderr is a pipe, so wait
  // for it to flush first.
  await new Promise((resolve) => process.stderr.write("", resolve));
  process.exit(1);
}
