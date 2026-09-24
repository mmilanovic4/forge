"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { revokeSessionAction } from "@/app/actions/sessions";
import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function RevokeSessionButton({ sessionId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRevoke() {
    setLoading(true);

    const { error } = await revokeSessionAction(sessionId);

    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }

    toast.success("Session revoked.");
    router.refresh();
    setLoading(false);
  }

  return (
    <ConfirmAction
      title="Revoke session?"
      description="That device will be signed out and has to sign in again."
      confirmLabel="Revoke"
      onConfirm={handleRevoke}
    >
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive shrink-0"
        disabled={loading}
      >
        {loading ? "Revoking..." : "Revoke"}
      </Button>
    </ConfirmAction>
  );
}

export function RevokeOtherSessionsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRevokeAll() {
    setLoading(true);

    const { error } = await authClient.revokeOtherSessions();

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    toast.success("All other sessions revoked.");
    router.refresh();
    setLoading(false);
  }

  return (
    <ConfirmAction
      title="Revoke all other sessions?"
      description="Every device except this one will be signed out."
      confirmLabel="Revoke all"
      onConfirm={handleRevokeAll}
    >
      <Button variant="outline" className="w-full" disabled={loading}>
        {loading ? "Revoking..." : "Revoke all other sessions"}
      </Button>
    </ConfirmAction>
  );
}
