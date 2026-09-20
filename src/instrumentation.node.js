import { db } from "@/lib/db";
import { logger } from "@/lib/logger";

try {
  await db.$queryRaw`SELECT 1`;
} catch (err) {
  // The check only catches misconfiguration, which in production is worth dying
  // for: the non-zero exit tells the supervisor to restart with backoff, and a
  // dead process never gets traffic. In development the database is often
  // deliberately down, and killing the server costs it its warm state.
  if (process.env.NODE_ENV !== "production") {
    logger.warn("Database unreachable, starting anyway", { err });
  } else {
    logger.error("Database connection check failed, shutting down", { err });
    // process.exit() can cut off pending writes when stderr is a pipe, so wait
    // for it to flush first.
    await new Promise((resolve) => process.stderr.write("", resolve));
    process.exit(1);
  }
}
