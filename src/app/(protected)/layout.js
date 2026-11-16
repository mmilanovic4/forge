import { redirect } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { UserMenu } from "@/components/user-menu";
import { organizationsEnabled } from "@/lib/app-config";
import {
  getActiveOrganization,
  listPendingInvitations,
  listUserOrganizations,
} from "@/lib/organization/queries";
import { getSession } from "@/lib/session";

export default async function ProtectedLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Independent lookups, so in parallel. Users without an organization still
  // get here — for onboarding and their own settings; (workspace)/layout.js
  // gates the rest.
  const [scope, organizations, invitations] = await Promise.all([
    getActiveOrganization(),
    organizationsEnabled ? listUserOrganizations() : [],
    organizationsEnabled ? listPendingInvitations() : [],
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        context={
          scope && (
            <OrganizationSwitcher
              active={{
                id: scope.organization.id,
                name: scope.organization.name,
                role: scope.member.role,
              }}
              organizations={organizations}
              invitations={invitations}
            />
          )
        }
      >
        <UserMenu user={session.user} />
      </Header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
