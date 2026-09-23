"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { NativeSelect } from "@/components/ui/native-select";
import { authClient } from "@/lib/auth-client";
import {
  canManageOrganization,
  ORGANIZATION_ROLES,
} from "@/lib/organization-roles";
import { getInitials } from "@/lib/user";
import { slugify } from "@/lib/utils";

// Only an owner may hand out ownership.
const assignableRoles = (currentRole) =>
  currentRole === "owner"
    ? ORGANIZATION_ROLES
    : ORGANIZATION_ROLES.filter((role) => role !== "owner");

// Runs an auth-client call, reports failures, and refreshes server data on
// success. `pending` holds the key of the call in flight.
function useAction() {
  const router = useRouter();
  const [pending, setPending] = useState(null);

  async function run(key, action, { success, redirectTo } = {}) {
    setPending(key);
    const { error } = await action();
    setPending(null);

    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return false;
    }

    if (success) toast.success(success);
    // Pushing alone would keep the shared (protected) layout — and the
    // organization switcher in it — as rendered before the change.
    if (redirectTo) router.push(redirectTo);
    router.refresh();
    return true;
  }

  return { pending, run };
}

export function GeneralCard({ organization, canManage }) {
  const { pending, run } = useAction();
  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);

  const changed =
    name.trim() !== organization.name || slug !== organization.slug;

  function handleSubmit(e) {
    e.preventDefault();
    const data = { name: name.trim() };
    if (slug !== organization.slug) data.slug = slugify(slug);

    run(
      "save",
      () =>
        authClient.organization.update({
          organizationId: organization.id,
          data,
        }),
      { success: "Organization updated." },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>
          {canManage
            ? "Your organization's name and URL slug."
            : "Only owners and admins can change these."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-name">Name</Label>
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!canManage}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input
                id="org-slug"
                value={slug}
                onChange={(e) =>
                  setSlug(slugify(e.target.value, { trim: false }))
                }
                disabled={!canManage}
                required
              />
            </div>
          </div>
          {canManage && (
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={
                  pending !== null || !changed || !name.trim() || !slugify(slug)
                }
              >
                {pending === "save" ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export function MembersCard({
  organizationId,
  members,
  currentUserId,
  currentRole,
}) {
  const { pending, run } = useAction();
  const canManage = canManageOrganization(currentRole);
  const ownerCount = members.filter((m) => m.role === "owner").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          {members.length} {members.length === 1 ? "member" : "members"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.map((member) => {
          const isSelf = member.user.id === currentUserId;
          const isLastOwner = member.role === "owner" && ownerCount === 1;
          // Admins can't touch owners; the server enforces the same.
          const editable =
            canManage &&
            !isSelf &&
            (currentRole === "owner" || member.role !== "owner");
          const initials = getInitials(member.user);

          return (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar className="h-8 w-8">
                  {member.user.image && (
                    <AvatarImage src={member.user.image} alt={initials} />
                  )}
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.user.name}
                    {isSelf && (
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {member.user.email}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {editable ? (
                  <NativeSelect
                    aria-label={`Role of ${member.user.name}`}
                    value={member.role}
                    disabled={pending !== null}
                    onChange={(e) =>
                      run(
                        `role-${member.id}`,
                        () =>
                          authClient.organization.updateMemberRole({
                            organizationId,
                            memberId: member.id,
                            role: e.target.value,
                          }),
                        { success: "Role updated." },
                      )
                    }
                  >
                    {assignableRoles(currentRole).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </NativeSelect>
                ) : (
                  <Badge
                    variant={member.role === "owner" ? "default" : "secondary"}
                  >
                    {member.role}
                  </Badge>
                )}
                {editable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={pending !== null}
                    onClick={() =>
                      run(
                        `remove-${member.id}`,
                        () =>
                          authClient.organization.removeMember({
                            organizationId,
                            memberIdOrEmail: member.id,
                          }),
                        { success: "Member removed." },
                      )
                    }
                  >
                    Remove
                  </Button>
                )}
                {isSelf && !isLastOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={pending !== null}
                    onClick={() =>
                      run(
                        "leave",
                        () => authClient.organization.leave({ organizationId }),
                        { redirectTo: "/dashboard" },
                      )
                    }
                  >
                    {pending === "leave" ? "Leaving..." : "Leave"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

const invitationLink = (id) =>
  `${window.location.origin}/accept-invitation/${id}`;

async function copyInvitationLink(id) {
  try {
    await navigator.clipboard.writeText(invitationLink(id));
    toast.success("Invitation link copied.");
  } catch {
    toast.error("Could not copy the link. Use the Copy link button below.");
  }
}

export function InvitationsCard({
  organizationId,
  invitations,
  currentRole,
  emailEnabled,
}) {
  const { pending, run } = useAction();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  async function handleInvite(e) {
    e.preventDefault();
    let invitationId;

    const ok = await run(
      "invite",
      async () => {
        // Explicit, like every other call here: without it better-auth falls
        // back to the session's active organization, which another tab may
        // have switched since this page rendered.
        const result = await authClient.organization.inviteMember({
          organizationId,
          email: email.trim(),
          role,
        });
        invitationId = result.data?.id;
        return result;
      },
      {
        success: emailEnabled
          ? `Invitation sent to ${email.trim()}.`
          : undefined,
      },
    );

    if (!ok) return;
    setEmail("");

    // Nothing was emailed — hand the inviter the link to pass on themselves.
    if (!emailEnabled && invitationId) {
      await copyInvitationLink(invitationId);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitations</CardTitle>
        <CardDescription>
          {emailEnabled
            ? "Invite people by email. Invitations expire after 48 hours."
            : "Email is not configured, so share the invitation link yourself. Invitations expire after 48 hours."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          onSubmit={handleInvite}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <Input
            type="email"
            aria-label="Email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <NativeSelect
            aria-label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {assignableRoles(currentRole).map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </NativeSelect>
          <Button type="submit" disabled={pending !== null || !email.trim()}>
            {pending === "invite" ? "Inviting..." : "Invite"}
          </Button>
        </form>

        {invitations.length > 0 && (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {invitation.email}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {invitation.role ?? "member"} · expires{" "}
                    {new Date(invitation.expiresAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyInvitationLink(invitation.id)}
                  >
                    Copy link
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    disabled={pending !== null}
                    onClick={() =>
                      run(
                        `cancel-${invitation.id}`,
                        () =>
                          authClient.organization.cancelInvitation({
                            invitationId: invitation.id,
                          }),
                        { success: "Invitation cancelled." },
                      )
                    }
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={pending !== null}>
              {pending === "delete" ? "Deleting..." : "Delete organization"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {organization.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Every member loses access to this
                organization.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() =>
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
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
