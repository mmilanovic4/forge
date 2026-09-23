import {
  listPendingInvitations,
  listUserOrganizations,
} from "@/lib/data-helper";
import { requireSession } from "@/lib/session";

import { OnboardingClient } from "./onboarding-client";

export const metadata = {
  title: "Set up your organization",
};

export default async function Onboarding() {
  const [session, invitations, organizations] = await Promise.all([
    requireSession(),
    listPendingInvitations(),
    listUserOrganizations(),
  ]);

  const { firstName, name } = session.user;

  return (
    <OnboardingClient
      invitations={invitations}
      hasOrganization={organizations.length > 0}
      suggestedName={`${firstName || name.split(" ")[0]}'s workspace`}
    />
  );
}
