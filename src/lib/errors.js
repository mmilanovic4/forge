import "server-only";

import { isAPIError } from "better-auth/api";

import { logger } from "./logger";

// An error whose message was written for the person using the app. Anything
// else that gets thrown — a database driver, the storage client, a bug — may
// name hosts, tables or queries, and must not reach the browser.
export class UserError extends Error {
  name = "UserError";
}

/**
 * The message a Server Action may hand back to the client for a caught error.
 * better-auth's own client errors pass through — the same text its HTTP API
 * would have answered with. Everything else is logged and replaced.
 */
export function publicMessage(
  err,
  fallback = "Something went wrong. Please try again.",
) {
  if (err instanceof UserError) return err.message;

  // A 5xx from better-auth is it failing, not the caller getting it wrong.
  if (isAPIError(err) && err.statusCode < 500 && err.message) {
    return err.message;
  }

  logger.error("Server action failed", { err });
  return fallback;
}
