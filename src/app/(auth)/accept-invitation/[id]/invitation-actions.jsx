"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function InvitationActions({ invitationId }) {
  const router = useRouter();
  const [pending, setPending] = useState(null);

  async function run(key, action) {
    setPending(key);
    const { error } = await action({ invitationId });

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setPending(null);
      return;
    }

    // Accepting makes the organization active; declining leaves the protected
    // layout to pick another one or fall through to onboarding.
    router.push("/dashboard");
  }

  return (
    <div className="flex w-full gap-2">
      <Button
        variant="outline"
        className="flex-1"
        disabled={pending !== null}
        onClick={() =>
          run("reject", (body) =>
            authClient.organization.rejectInvitation(body),
          )
        }
      >
        {pending === "reject" ? "Declining..." : "Decline"}
      </Button>
      <Button
        className="flex-1"
        disabled={pending !== null}
        onClick={() =>
          run("accept", (body) =>
            authClient.organization.acceptInvitation(body),
          )
        }
      >
        {pending === "accept" ? "Joining..." : "Accept invitation"}
      </Button>
    </div>
  );
}

export function SignOutButton({ redirectTo }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
