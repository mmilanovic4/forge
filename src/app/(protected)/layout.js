import { redirect } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { OrganizationSwitcher } from "@/components/organization-switcher";
import { UserMenu } from "@/components/user-menu";
import { organizationsEnabled } from "@/lib/app-config";
import { listUserOrganizations } from "@/lib/data-helper";
import { getSession, requireActiveOrganization } from "@/lib/session";

export default async function ProtectedLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Independent lookups, so in parallel. requireActiveOrganization redirects
  // to onboarding when the user belongs to no organization.
  const [scope, organizations] = await Promise.all([
    requireActiveOrganization(),
    organizationsEnabled ? listUserOrganizations() : [],
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header>
        {scope && (
          <OrganizationSwitcher
            activeId={scope.organization.id}
            organizations={organizations}
          />
        )}
        <UserMenu user={session.user} />
      </Header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
