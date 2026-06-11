import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { UserMenu } from "@/components/user-menu";
import { auth } from "@/lib/auth";

export default async function ProtectedLayout({ children }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header>
        <UserMenu
          firstName={session.user.firstName}
          lastName={session.user.lastName}
          email={session.user.email}
        />
      </Header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
