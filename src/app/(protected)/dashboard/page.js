import { headers } from "next/headers";
import Link from "next/link";

import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { activeProviders, emailEnabled } from "@/lib/auth-config";

import { SecurityChecklist } from "./security-checklist";

export const metadata = {
  title: "Dashboard",
};

export default async function Dashboard() {
  const hdrs = await headers();

  const [session, accounts, passkeys] = await Promise.all([
    auth.api.getSession({ headers: hdrs }),
    auth.api.listUserAccounts({ headers: hdrs }),
    auth.api.listPasskeys({ headers: hdrs }),
  ]);

  const user = session.user;

  const providerLabels = new Map(activeProviders.map((p) => [p.id, p.label]));
  const socialAccounts = accounts
    .filter((account) => account.providerId !== "credential")
    .map((account) => ({
      id: account.providerId,
      label: providerLabels.get(account.providerId) ?? account.providerId,
    }));
  const hasPassword = accounts.some(
    (account) => account.providerId === "credential",
  );

  return (
    <div className="bg-background">
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {user.name || user.firstName}!
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {user.role === "admin" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Admin
              </CardTitle>
              <CardDescription>Manage users, roles, and bans.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/users">Go to user management</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <SecurityChecklist
          email={user.email}
          emailEnabled={emailEnabled}
          emailVerified={user.emailVerified}
          twoFactorEnabled={user.twoFactorEnabled}
          hasPassword={hasPassword}
          passkeyCount={passkeys.length}
          socialAccounts={socialAccounts}
        />
      </main>
    </div>
  );
}
