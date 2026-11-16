"use client";

import Link from "next/link";
import { useState } from "react";

import { ConfirmAction } from "@/components/confirm-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "@/hooks/use-action";
import { authClient } from "@/lib/auth-client";

export function NameCard({ organization, canEdit }) {
  const { pending, run } = useAction();
  const [name, setName] = useState(organization.name);

  const trimmed = name.trim();

  function handleSubmit(e) {
    e.preventDefault();
    run(
      "save",
      () =>
        authClient.organization.update({
          organizationId: organization.id,
          data: { name: trimmed },
        }),
      { success: "Organization renamed." },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Name</CardTitle>
        <CardDescription>
          {canEdit
            ? "What the organization is called across the app and in invitations."
            : "Only owners and admins can rename the organization."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <div className="flex-1 space-y-2">
            <Label htmlFor="org-name">Organization name</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canEdit}
              required
            />
          </div>
          {canEdit && (
            <Button
              type="submit"
              disabled={
                pending !== null || !trimmed || trimmed === organization.name
              }
            >
              {pending === "save" ? "Saving..." : "Save"}
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

const LEAVE_BLOCKED = {
  "last-owner": (
    <>
      You are the only owner. Make another member an owner on the{" "}
      <Link
        href="/organization/members"
        className="text-foreground underline underline-offset-4"
      >
        members page
      </Link>{" "}
      before you leave.
    </>
  ),
  "only-member":
    "You are the only member, so there is nobody to leave it to. Delete the organization instead.",
};

// `blockedBy` is why the caller can't leave ("last-owner", "only-member"), or
// null when they can.
export function LeaveOrganizationCard({ organization, blockedBy }) {
  const { pending, run } = useAction();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave organization</CardTitle>
        <CardDescription>
          {LEAVE_BLOCKED[blockedBy] ??
            `You lose access to ${organization.name} right away, and need a new invitation to come back.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-end">
        <ConfirmAction
          title={`Leave ${organization.name}?`}
          description="You lose access right away, and need a new invitation to come back."
          confirmLabel="Leave"
          onConfirm={() =>
            run(
              "leave",
              () =>
                authClient.organization.leave({
                  organizationId: organization.id,
                }),
              { redirectTo: "/dashboard" },
            )
          }
        >
          <Button
            variant="outline"
            disabled={pending !== null || blockedBy !== null}
          >
            {pending === "leave" ? "Leaving..." : "Leave organization"}
          </Button>
        </ConfirmAction>
      </CardContent>
    </Card>
  );
}

export function DeleteOrganizationCard({ organization }) {
  const { pending, run } = useAction();

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Delete organization</CardTitle>
        <CardDescription>
          Removes {organization.name}, its members and pending invitations.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-end">
        <ConfirmAction
          title={`Delete ${organization.name}?`}
          description="This action cannot be undone. Every member loses access to this organization."
          confirmLabel="Delete"
          onConfirm={() =>
            run(
              "delete",
              () =>
                authClient.organization.delete({
                  organizationId: organization.id,
                }),
              { redirectTo: "/dashboard" },
            )
          }
        >
          <Button variant="destructive" disabled={pending !== null}>
            {pending === "delete" ? "Deleting..." : "Delete organization"}
          </Button>
        </ConfirmAction>
      </CardContent>
    </Card>
  );
}
