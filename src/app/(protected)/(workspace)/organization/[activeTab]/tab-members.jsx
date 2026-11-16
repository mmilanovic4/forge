import { emailEnabled } from "@/lib/auth-config";
import { can } from "@/lib/organization/permissions";
import {
  listInvitations,
  listMembers,
  requireActiveOrganization,
} from "@/lib/organization/queries";
import { requireSession } from "@/lib/session";

import { MembersCard } from "./members-card";

export async function MembersTab() {
  const [session, { organization, member }, members, invitations] =
    await Promise.all([
      requireSession(),
      requireActiveOrganization(),
      listMembers(),
      // Empty for anyone who couldn't send an invitation themselves.
      listInvitations(),
    ]);

  return (
    <MembersCard
      organizationId={organization.id}
      members={members}
      invitations={invitations}
      currentUserId={session.user.id}
      currentRole={member.role}
      canInvite={can(member.role, "invitation", "create")}
      emailEnabled={emailEnabled}
    />
  );
}
