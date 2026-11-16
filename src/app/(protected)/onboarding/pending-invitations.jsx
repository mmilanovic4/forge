"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAction } from "@/hooks/use-action";
import { authClient } from "@/lib/auth-client";

export function PendingInvitations({ invitations }) {
  const { pending, run } = useAction();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending invitations</CardTitle>
        <CardDescription>
          Join an organization you have been invited to.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {invitations.map(({ id, role, organization, inviter }) => (
          <div
            key={id}
            className="flex items-center justify-between gap-3 rounded-lg border p-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {organization.name}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                Invited by {inviter.name}{" "}
                <Badge variant="outline" className="ml-1 text-[10px]">
                  {role ?? "member"}
                </Badge>
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={pending !== null}
                onClick={() =>
                  run(`reject-${id}`, () =>
                    authClient.organization.rejectInvitation({
                      invitationId: id,
                    }),
                  )
                }
              >
                Decline
              </Button>
              <Button
                size="sm"
                disabled={pending !== null}
                onClick={() =>
                  run(
                    `accept-${id}`,
                    () =>
                      authClient.organization.acceptInvitation({
                        invitationId: id,
                      }),
                    { redirectTo: "/dashboard" },
                  )
                }
              >
                {pending === `accept-${id}` ? "Joining..." : "Join"}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
