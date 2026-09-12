import { logger } from "@/lib/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node.js");
  }
}

// Catches everything thrown and left unhandled in Server Components, Route
// Handlers, Server Actions and Proxy. Request headers are deliberately left out
// — they carry the session cookie.
export function onRequestError(err, request, context) {
  logger.error("Unhandled request error", {
    err,
    method: request.method,
    path: request.path,
    routePath: context.routePath,
    routeType: context.routeType,
  });
}
