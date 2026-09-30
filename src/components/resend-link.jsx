"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Long enough that an impatient double-click doesn't send two emails, short
// enough that a lost one can be replaced without leaving the page.
const COOLDOWN_MS = 30_000;

/**
 * "Send it again" for codes and links, with a cooldown between sends: a quiet
 * line of text whose link only appears once another send is allowed.
 * `onResend` is an auth-client call — anything resolving to `{ error }`.
 * `coolingDown` starts the cooldown on mount, for when something was just
 * sent before this line appeared. `hint` is the lead-in before the link;
 * pass `null` where space is tight.
 */
export function ResendLink({
  onResend,
  label = "Resend email",
  successMessage = "Sent. Check your email.",
  coolingDown = true,
  hint = "Didn't get it?",
  className,
}) {
  const [sending, setSending] = useState(false);
  const [cooling, setCooling] = useState(coolingDown);

  useEffect(() => {
    if (!cooling) return;
    const timer = setTimeout(() => setCooling(false), COOLDOWN_MS);
    return () => clearTimeout(timer);
  }, [cooling]);

  async function handleClick() {
    setSending(true);
    const { error } = await onResend();
    setSending(false);

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    setCooling(true);
    toast.success(successMessage);
  }

  return (
    <p className={cn("text-muted-foreground text-sm", className)}>
      {sending ? (
        "Sending..."
      ) : (
        <>
          {hint && `${hint} `}
          {cooling ? (
            "You can resend shortly."
          ) : (
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-[length:inherit]"
              onClick={handleClick}
            >
              {label}
            </Button>
          )}
        </>
      )}
    </p>
  );
}
