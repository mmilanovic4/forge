import { redirect } from "next/navigation";

import { CreateOrganizationForm } from "@/components/create-organization-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { appName, organizationsEnabled } from "@/lib/app-config";
import {
  getActiveOrganization,
  listPendingInvitations,
} from "@/lib/organization/queries";

import { PendingInvitations } from "./pending-invitations";

export const metadata = {
  title: "Set up your organization",
};

// Where a signed-in user without an organization ends up: the (workspace)
// layout sends them here, so this page sits outside it. Anyone who already
// belongs to one has no business here — they start further organizations from
// the switcher instead.
export default async function Onboarding() {
  if (!organizationsEnabled) redirect("/dashboard");

  // Resolves the signed-in user itself, like every query in that module.
  if (await getActiveOrganization()) redirect("/dashboard");

  const invitations = await listPendingInvitations();

  return (
    <div className="mx-auto w-full max-w-md space-y-4 px-4 py-16">
      {invitations.length > 0 && (
        <PendingInvitations invitations={invitations} />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Create an organization</CardTitle>
          <CardDescription>
            Everything in {appName} lives in an organization. You can invite
            your team once it&apos;s set up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm autoFocus={invitations.length === 0} />
        </CardContent>
      </Card>
    </div>
  );
}
