"use client";

import { useState } from "react";

import { Mail, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { ConfirmAction } from "@/components/confirm-action";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useAction } from "@/hooks/use-action";
import { authClient } from "@/lib/auth-client";
import { invitationPath } from "@/lib/organization/invitation";
import {
  assignableRoles,
  can,
  canManageMember,
  isOwner,
} from "@/lib/organization/permissions";
import { getInitials } from "@/lib/user";

const plural = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;

const withArticle = (role) => `${role === "member" ? "a" : "an"} ${role}`;

async function copyInvitationLink(id) {
  try {
    await navigator.clipboard.writeText(
      `${window.location.origin}${invitationPath(id)}`,
    );
    toast.success("Invitation link copied.");
  } catch {
    toast.error(
      "Could not copy the link. Try again from the invitation's menu.",
    );
  }
}

// One confirmation dialog per row, opened from its menu. The content outlives
// `open` so it doesn't blank out while the dialog animates away.
function useConfirm() {
  const [dialog, setDialog] = useState({ open: false });

  return {
    ask: (content) => setDialog({ ...content, open: true }),
    props: {
      ...dialog,
      onOpenChange: (open) => setDialog((current) => ({ ...current, open })),
    },
  };
}

function RowMenu({ label, disabled, children }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={disabled}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MemberRow({
  organizationId,
  member,
  isSelf,
  currentRole,
  ownerCount,
  reserveMenu,
}) {
  const { pending, run } = useAction();
  const confirm = useConfirm();
  const { name } = member.user;
  const initials = getInitials(member.user);

  // The server enforces all of this too. An owner may step down, but only
  // while another owner remains.
  const canChangeRole =
    canManageMember(currentRole, member.role, "update") &&
    !(isSelf && isOwner(member.role) && ownerCount === 1);
  const canRemove =
    !isSelf && canManageMember(currentRole, member.role, "delete");

  const setRole = (role) =>
    run(
      "role",
      () =>
        authClient.organization.updateMemberRole({
          organizationId,
          memberId: member.id,
          role,
        }),
      {
        success: isSelf
          ? `You are now ${withArticle(role)}.`
          : `${name} is now ${withArticle(role)}.`,
      },
    );

  function handleRoleChange(role) {
    if (role === member.role) return;

    if (isSelf) {
      confirm.ask({
        title: `Change your role to ${role}?`,
        description:
          "You give up what your current role allows, and can't take it back yourself — someone else has to restore it.",
        confirmLabel: "Change my role",
        onConfirm: () => setRole(role),
      });
    } else if (isOwner(role)) {
      confirm.ask({
        title: `Make ${name} an owner?`,
        description:
          "Owners can do everything you can: delete the organization, and change or remove other owners — you included.",
        confirmLabel: "Make owner",
        variant: "default",
        onConfirm: () => setRole(role),
      });
    } else {
      setRole(role);
    }
  }

  const handleRemove = () =>
    confirm.ask({
      title: `Remove ${name}?`,
      description:
        "They lose access to this organization right away. You can invite them again later.",
      confirmLabel: "Remove",
      onConfirm: () =>
        run(
          "remove",
          () =>
            authClient.organization.removeMember({
              organizationId,
              memberIdOrEmail: member.id,
            }),
          { success: `${name} was removed.` },
        ),
    });

  return (
    <li className="flex items-center justify-between gap-3 p-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar className="h-8 w-8">
          {member.user.image && (
            <AvatarImage src={member.user.image} alt={initials} />
          )}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {name}
            {isSelf && (
              <span className="text-muted-foreground font-normal"> (you)</span>
            )}
          </p>
          <p className="text-muted-foreground truncate text-xs">
            {member.user.email}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge
          variant={isOwner(member.role) ? "default" : "secondary"}
          className="capitalize"
        >
          {member.role}
        </Badge>
        {canChangeRole || canRemove ? (
          <RowMenu label={`Actions for ${name}`} disabled={pending !== null}>
            {canChangeRole && (
              <>
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  Role
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={member.role}
                  onValueChange={handleRoleChange}
                >
                  {assignableRoles(currentRole).map((role) => (
                    <DropdownMenuRadioItem
                      key={role}
                      value={role}
                      className="cursor-pointer capitalize"
                    >
                      {role}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </>
            )}
            {canChangeRole && canRemove && <DropdownMenuSeparator />}
            {canRemove && (
              <DropdownMenuItem variant="destructive" onClick={handleRemove}>
                Remove from organization
              </DropdownMenuItem>
            )}
          </RowMenu>
        ) : (
          // Keeps the role badges in one column next to rows that have a menu.
          reserveMenu && <span className="w-8" aria-hidden />
        )}
      </div>
      <ConfirmAction {...confirm.props} />
    </li>
  );
}

function InvitationRow({ organizationId, invitation, emailEnabled }) {
  const { pending, run } = useAction();
  const confirm = useConfirm();
  const { id, email } = invitation;
  const role = invitation.role ?? "member";

  const handleResend = () =>
    run(
      "resend",
      () =>
        authClient.organization.inviteMember({
          organizationId,
          email,
          role,
          resend: true,
        }),
      { success: `Invitation sent to ${email} again.` },
    );

  const handleCancel = () =>
    confirm.ask({
      title: "Cancel invitation?",
      description: `The link sent to ${email} will stop working.`,
      confirmLabel: "Cancel invitation",
      cancelLabel: "Keep it",
      onConfirm: () =>
        run(
          "cancel",
          () => authClient.organization.cancelInvitation({ invitationId: id }),
          { success: "Invitation cancelled." },
        ),
    });

  return (
    <li className="flex items-center justify-between gap-3 p-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <Mail className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{email}</p>
          <p className="text-muted-foreground truncate text-xs">
            Invited as {withArticle(role)} · expires{" "}
            {new Date(invitation.expiresAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="outline">Pending</Badge>
        <RowMenu
          label={`Actions for the invitation to ${email}`}
          disabled={pending !== null}
        >
          <DropdownMenuItem onClick={() => copyInvitationLink(id)}>
            Copy link
          </DropdownMenuItem>
          {emailEnabled && (
            <DropdownMenuItem onClick={handleResend}>
              Resend email
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleCancel}>
            Cancel invitation
          </DropdownMenuItem>
        </RowMenu>
      </div>
      <ConfirmAction {...confirm.props} />
    </li>
  );
}

function InviteForm({ organizationId, currentRole, emailEnabled }) {
  const { pending, run } = useAction();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  async function handleSubmit(e) {
    e.preventDefault();
    const address = email.trim();

    const { ok, data } = await run(
      "invite",
      // The organization is named explicitly, like in every other call here:
      // without it better-auth falls back to the session's active one, which
      // another tab may have switched since this page rendered.
      () =>
        authClient.organization.inviteMember({
          organizationId,
          email: address,
          role,
        }),
      { success: emailEnabled ? `Invitation sent to ${address}.` : undefined },
    );

    if (!ok) return;
    setEmail("");

    // Nothing was emailed — hand the inviter the link to pass on themselves.
    if (!emailEnabled && data?.id) {
      await copyInvitationLink(data.id);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
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
      </div>
      <p className="text-muted-foreground text-xs">
        {emailEnabled
          ? "They get an email with a link to join. Invitations expire after 48 hours."
          : "Email is not configured, so the invitation link is copied for you to share. Invitations expire after 48 hours."}
      </p>
    </form>
  );
}

export function MembersCard({
  organizationId,
  members,
  invitations,
  currentUserId,
  currentRole,
  canInvite,
  emailEnabled,
}) {
  const ownerCount = members.filter((m) => isOwner(m.role)).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          {plural(members.length, "member")}
          {invitations.length > 0 &&
            `, ${plural(invitations.length, "pending invitation")}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canInvite && (
          <InviteForm
            organizationId={organizationId}
            currentRole={currentRole}
            emailEnabled={emailEnabled}
          />
        )}
        <ul className="divide-y rounded-lg border">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              organizationId={organizationId}
              member={member}
              isSelf={member.user.id === currentUserId}
              currentRole={currentRole}
              ownerCount={ownerCount}
              reserveMenu={can(currentRole, "member", "update")}
            />
          ))}
          {invitations.map((invitation) => (
            <InvitationRow
              key={invitation.id}
              organizationId={organizationId}
              invitation={invitation}
              emailEnabled={emailEnabled}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
