import { can, isOwner } from "@/lib/organization/permissions";
import {
  countMembers,
  requireActiveOrganization,
} from "@/lib/organization/queries";

import {
  DeleteOrganizationCard,
  LeaveOrganizationCard,
  NameCard,
} from "./settings-cards";

export async function SettingsTab() {
  const [{ organization, member }, counts] = await Promise.all([
    requireActiveOrganization(),
    countMembers(),
  ]);

  const { id, name } = organization;
  // An organization always keeps an owner, so the last one can't walk away:
  // they hand the role to someone first, or delete the organization.
  const lastOwner = isOwner(member.role) && counts.owners === 1;

  return (
    <div className="space-y-6">
      <NameCard
        organization={{ id, name }}
        canEdit={can(member.role, "organization", "update")}
      />
      <LeaveOrganizationCard
        organization={{ id, name }}
        blockedBy={
          !lastOwner ? null : counts.members > 1 ? "last-owner" : "only-member"
        }
      />
      {can(member.role, "organization", "delete") && (
        <DeleteOrganizationCard organization={{ id, name }} />
      )}
    </div>
  );
}
