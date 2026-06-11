import { Header } from "@/components/header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserMenu } from "@/components/user-menu";

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
    </div>
  );
}
