import { redirect } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { UserMenu } from "@/components/user-menu";
import { organizationsEnabled } from "@/lib/app-config";
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header>
        <UserMenu user={session.user} />
      </Header>
      <main className="flex flex-1 items-center justify-center p-4">
        {children}
      </main>
      <Footer />
    </div>
  );
}
