"use client";

import { ErrorFallback } from "@/components/error-fallback";

// Catches everything below the root layout, the route group layouts included —
// so a failed session lookup (e.g. the database being down) lands here too.
export default function Error({ error, retry }) {
  return <ErrorFallback error={error} retry={retry} />;
}
