"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAction } from "@/hooks/use-action";
import { authClient } from "@/lib/auth-client";

export function InvitationActions({ invitationId }) {
  const { pending, run } = useAction();

  // Accepting makes the organization active; declining leaves the workspace
  // layout to pick another one or fall through to onboarding.
  const answer = (key, action) =>
    run(key, () => action({ invitationId }), { redirectTo: "/dashboard" });

  return (
    <div className="flex w-full gap-2">
      <Button
        variant="outline"
        className="flex-1"
        disabled={pending !== null}
        onClick={() =>
          answer("reject", authClient.organization.rejectInvitation)
        }
      >
        {pending === "reject" ? "Declining..." : "Decline"}
      </Button>
      <Button
        className="flex-1"
        disabled={pending !== null}
        onClick={() =>
          answer("accept", authClient.organization.acceptInvitation)
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
