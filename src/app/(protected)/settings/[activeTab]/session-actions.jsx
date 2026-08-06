"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function RevokeSessionButton({ token }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleRevoke() {
    setLoading(true);

    const { error } = await authClient.revokeSession({ token });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    toast.success("Session revoked.");
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive shrink-0"
      disabled={loading}
      onClick={handleRevoke}
    >
      {loading ? "Revoking..." : "Revoke"}
    </Button>
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
    <Button
      variant="outline"
      className="w-full"
      disabled={loading}
      onClick={handleRevokeAll}
    >
      {loading ? "Revoking..." : "Revoke all other sessions"}
    </Button>
  );
}
