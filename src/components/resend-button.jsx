"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

// Long enough that an impatient double-click doesn't send two emails, short
// enough that a lost one can be replaced without leaving the page.
const COOLDOWN_S = 30;

/**
 * "Send it again" for codes and links, with a cooldown between sends.
 * `onResend` is an auth-client call — anything resolving to `{ error }`.
 * `coolingDown` starts the countdown on mount, for when something was just
 * sent before this button appeared.
 */
export function ResendButton({
  onResend,
  label = "Resend email",
  successMessage = "Sent. Check your email.",
  coolingDown = true,
  ...props
}) {
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(coolingDown ? COOLDOWN_S : 0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleClick() {
    setSending(true);
    const { error } = await onResend();
    setSending(false);

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }

    setCooldown(COOLDOWN_S);
    toast.success(successMessage);
  }

  return (
    <Button
      type="button"
      disabled={sending || cooldown > 0}
      onClick={handleClick}
      {...props}
    >
      {sending
        ? "Sending..."
        : cooldown > 0
          ? `${label} (${cooldown}s)`
          : label}
    </Button>
  );
}
