"use client";

import { ErrorFallback } from "@/components/error-fallback";

// Sits inside (protected)/layout.js, so a page that fails keeps the header —
// and with it the way to another page. A failure in the layout itself (e.g.
// the session lookup) still falls through to app/error.js.
export default function Error({ error, retry }) {
  return <ErrorFallback error={error} retry={retry} className="py-24" />;
}
