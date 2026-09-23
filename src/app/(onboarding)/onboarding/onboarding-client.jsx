"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { slugify } from "@/lib/utils";

export function OnboardingClient({
  invitations,
  hasOrganization,
  suggestedName,
}) {
  const router = useRouter();
  const [name, setName] = useState(hasOrganization ? "" : suggestedName);
  const [slug, setSlug] = useState(
    hasOrganization ? "" : slugify(suggestedName),
  );
  // Once edited by hand, the slug stops following the name.
  const [slugTouched, setSlugTouched] = useState(false);
  const [pending, setPending] = useState(null);

  function handleNameChange(e) {
    setName(e.target.value);
    if (!slugTouched) setSlug(slugify(e.target.value));
  }

  async function run(key, action, successPath) {
    setPending(key);
    const { error } = await action();

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      setPending(null);
      return;
    }

    if (successPath) {
      router.push(successPath);
    } else {
      setPending(null);
      router.refresh();
    }
  }

  function handleCreate(e) {
    e.preventDefault();
    run(
      "create",
      () =>
        authClient.organization.create({
          name: name.trim(),
          slug: slugify(slug),
        }),
      "/dashboard",
    );
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>
              Join an organization you have been invited to.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {invitation.organization.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    Invited by {invitation.user.name}{" "}
                    <Badge variant="outline" className="ml-1 text-[10px]">
                      {invitation.role ?? "member"}
                    </Badge>
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending !== null}
                    onClick={() =>
                      run(`reject-${invitation.id}`, () =>
                        authClient.organization.rejectInvitation({
                          invitationId: invitation.id,
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
                        `accept-${invitation.id}`,
                        () =>
                          authClient.organization.acceptInvitation({
                            invitationId: invitation.id,
                          }),
                        "/dashboard",
                      )
                    }
                  >
                    {pending === `accept-${invitation.id}`
                      ? "Joining..."
                      : "Join"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create an organization</CardTitle>
          <CardDescription>
            {hasOrganization
              ? "Start a new workspace. You will be its owner."
              : "Everything in Forge lives in an organization. You can invite your team once it's set up."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreate}>
          <CardContent className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                autoFocus={invitations.length === 0}
                id="name"
                name="name"
                placeholder="Acme Inc."
                value={name}
                onChange={handleNameChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="acme-inc"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value, { trim: false }));
                }}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={pending !== null || !name.trim() || !slugify(slug)}
            >
              {pending === "create" ? "Creating..." : "Create organization"}
            </Button>
          </CardContent>
        </form>
        {hasOrganization && (
          <CardFooter className="justify-center">
            <Link
              href="/dashboard"
              className="text-muted-foreground text-sm hover:underline"
            >
              Back to dashboard
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
