import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { emailEnabled } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { canManageOrganization } from "@/lib/organization-roles";
import { getActiveOrganization, requireSession } from "@/lib/session";

import {
  DeleteOrganizationCard,
  GeneralCard,
  InvitationsCard,
  MembersCard,
} from "./organization-settings";

function NoOrganizationCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>No organization</CardTitle>
        <CardDescription>
          You&apos;re not part of an organization. Create one, or join one
          you&apos;ve been invited to.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-end">
        <Button asChild>
          <Link href="/onboarding">Set up organization</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export async function OrganizationTab() {
  const [session, scope] = await Promise.all([
    requireSession(),
    getActiveOrganization(),
  ]);

  if (!scope) {
    return <NoOrganizationCard />;
  }

  const { organization, member } = scope;
  const canManage = canManageOrganization(member.role);

  const [members, invitations] = await Promise.all([
    db.member.findMany({
      where: { organizationId: organization.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
          },
        },
      },
    }),
    canManage
      ? db.invitation.findMany({
          where: {
            organizationId: organization.id,
            status: "pending",
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, email: true, role: true, expiresAt: true },
        })
      : [],
  ]);

  const { id, name, slug } = organization;

  return (
    <div className="space-y-6">
      {/* Keyed so switching organizations resets the form's local state. */}
      <GeneralCard
        key={id}
        organization={{ id, name, slug }}
        canManage={canManage}
      />
      <MembersCard
        organizationId={id}
        members={members}
        currentUserId={session.user.id}
        currentRole={member.role}
      />
      {canManage && (
        <InvitationsCard
          organizationId={id}
          invitations={invitations}
          currentRole={member.role}
          emailEnabled={emailEnabled}
        />
      )}
      {member.role === "owner" && (
        <DeleteOrganizationCard organization={{ id, name }} />
      )}
    </div>
  );
}
