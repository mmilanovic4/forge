"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

// Shared by error.js and global-error.js. In production a Server Component
// error reaches the client stripped down to a generic message plus `digest`,
// which is also on the server-side log entry (see instrumentation.js) — so
// that's the one detail worth showing.
export function ErrorFallback({ error, retry }) {
  useEffect(() => {
    // Server errors are already logged by onRequestError; this is the only
    // trace a client-side rendering error leaves.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4 text-center">
      <div className="flex max-w-md flex-col items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again in a moment.
        </p>
        {error?.digest && (
          <p className="text-muted-foreground font-mono text-xs">
            Reference: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
