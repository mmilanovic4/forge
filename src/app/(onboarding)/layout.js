import { redirect } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { UserMenu } from "@/components/user-menu";
import { organizationsEnabled } from "@/lib/app-config";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// Signed in, but deliberately outside (protected)/layout.js: that layout sends
// users without an organization here, so it can't also wrap this page.
export default async function OnboardingLayout({ children }) {
  if (!organizationsEnabled) {
    redirect("/dashboard");
  }

  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Users who already belong somewhere come here to create another
  // organization, and keep their usual menu.
  const hasOrganization =
    (await db.member.count({ where: { userId: session.user.id } })) > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header>
        <UserMenu user={session.user} onboarding={!hasOrganization} />
      </Header>
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
